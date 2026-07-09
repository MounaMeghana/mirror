# System Requirements Specification (SRS)
## Project: AI Cognitive Mirror

### 1. Introduction
The "AI Cognitive Mirror" is an AI-driven role-play system for social anxiety exposure therapy. It uses multi-modal analysis (voice, tone, facial expression) to provide feedback to users.

### 2. Functional Requirements
- **User Management**: Users can register and login.
- **Session Management**: Users can start and stop practice sessions.
- **Multi-modal Analysis**:
    - **Audio**: Speech-to-text transcription.
    - **Sentiment**: Tone and text sentiment analysis.
    - **Video**: Real-time facial expression tracking.
- **Dual-Sentiment Engine**: Compares user's internal state (self-reported) vs. external perception (AI analyzed).
- **Dashboard**: Visualizes progress over time.

### 3. Non-Functional Requirements
- **Latency**: Analysis should happen near real-time (<2s delay).
- **Privacy**: No video/audio data stored permanently; only derived metrics.
- **Scalability**: Backend able to handle concurrent user sessions.

### 4. Technical Constraints
- Backend: Python (FastAPI).
- Frontend: React (Vite).
- AI Models: Local execution preferred for privacy, or secure API calls (OpenAI/Google).
