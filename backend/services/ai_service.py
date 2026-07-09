import os
import json
import google.generativeai as genai

# We will initialize this with the API key provided via environment variables
class AIService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None

    def initialize_chat(self, scenario: str):
        if not self.model:
            return None
            
        system_instruction = f"""
You are an AI acting as a roleplay partner to help a user practice for a specific social interaction. 
The user suffers from social anxiety and wants to practice in a safe environment.

Here is the scenario the user has provided:
"{scenario}"

INSTRUCTIONS:
1. Adopt a persona appropriate for this scenario (e.g., an interviewer, a date, an audience member).
2. Start the conversation right away in character. Do not break character.
3. Keep your responses concise, realistic, and open-ended to encourage the user to speak.
4. If the user seems nervous, be a neutral or slightly encouraging interaction partner, just as a normal person would be.
"""
        
        # Start a new chat with the system prompt as the first message from the user, 
        # and acknowledge it so the actual conversation can begin.
        chat = self.model.start_chat(history=[
            {"role": "user", "parts": [system_instruction]},
            {"role": "model", "parts": ["Understood. I will start the roleplay now."]}
        ])
        
        return chat

    async def generate_dashboard_summary(self, transcript: list, expressions: list) -> dict:
        if not self.model:
            return {"error": "AI not initialized"}
            
        # Format the data for the AI
        transcript_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in transcript])
        
        # Summarize expressions roughly to avoid massive context
        expression_counts = {}
        for exp in expressions:
            name = exp.get("expression")
            expression_counts[name] = expression_counts.get(name, 0) + 1
            
        prompt = f"""
You are an expert social anxiety and communication coach. Review the following roleplay session data and provide a constructive dashboard summary.

### Session Transcript:
{transcript_text}

### Dominant Facial Expressions Over Time (Counts):
{expression_counts}

Provide your analysis strictly in the following JSON format:
{{
    "overallFeedback": "A 2-3 sentence summary of how they did.",
    "strengths": ["Strength 1", "Strength 2"],
    "areasForImprovement": ["Area 1", "Area 2"],
    "expressionAnalysis": "What their facial expressions suggest about their internal state vs their verbal performance.",
    "cognitiveDistortions": [
        {{
            "distortionType": "e.g., Catastrophizing, Black-and-White Thinking, Mind Reading",
            "example": "A specific quote or summary of what the user said that exhibits this distortion.",
            "correction": "How the user can reframe this thought."
        }}
    ] // This array can be empty if no distortions are found.
}}
        """
        
        try:
            # We use the generic model for simple zero-shot generation to get JSON back
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean up markdown code blocks if the AI model wraps the JSON in them
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
                
            return json.loads(text.strip())
        except Exception as e:
            print(f"Failed to generate summary or parse JSON. Error: {str(e)}")
            # Return a graceful fallback instead of failing the whole application
            return {
                "overallFeedback": "Thank you for completing the session! We captured your expressions but right now our detailed AI analysis is experiencing high traffic.",
                "strengths": ["Completed the practice session"],
                "areasForImprovement": ["Keep practicing regularly"],
                "expressionAnalysis": "Your expressions were successfully recorded.",
                "cognitiveDistortions": []
            }

    async def get_response(self, chat, user_text: str) -> str:
        if not chat:
            return "System Error: Chat not initialized. Please try restarting the session."
        
        try:
            response = chat.send_message(user_text)
            return response.text
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg or "quota" in error_msg.lower():
                return "System Error: The AI service is currently overloaded or the free tier quota has been exceeded. Please wait a moment and try speaking again."
            return f"System Error: Failed to communicate with AI. ({error_msg})"

# Singleton instance
ai_service = AIService()
