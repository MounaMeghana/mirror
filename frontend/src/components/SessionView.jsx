import { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../context/AuthContext';
import { Mic, MicOff, Video, VideoOff, Square } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';

export default function SessionView({ scenario, onEndSession }) {
  const { user } = useAuth(); // Get the logged-in user to attach sessions to their account
  const [micActive, setMicActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [currentExpression, setCurrentExpression] = useState('');
  
  const currentExpressionRef = useRef('');
  useEffect(() => {
    currentExpressionRef.current = currentExpression;
  }, [currentExpression]);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectionInterval = useRef(null);

  const { isConnected, sendMessage } = useWebSocket('ws://localhost:8000/ws/session', (msg) => {
    try {
      const data = JSON.parse(msg.data);
      if (data.type === 'ai_response') {
        setMessages(prev => [...prev, { role: 'ai', content: data.text }]);
      } else if (data.type === 'dashboard_summary') {
        if (data.data) {
           onEndSession(data);
        } else {
           console.error("Received empty dashboard summary:", data);
        }
      }
    } catch (e) {
      console.error("Failed to parse WS message", e);
    }
  });

  // Load Face API Models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (e) {
        console.error("Error loading face models", e);
      }
    };
    loadModels();
  }, []);

  // Initialize Session
  useEffect(() => {
    if (isConnected && scenario) {
      // Small delay to ensure backend is ready
      setTimeout(() => {
        sendMessage(JSON.stringify({ 
          type: 'initialize',
          scenario: scenario,
          // Send user_id so the backend saves this session to the user's history
          // If guest (not logged in), user is null and the session won't be saved
          user_id: user?.id ?? null
        }));
      }, 500);
    }
  }, [isConnected, scenario, sendMessage, user]);

  const toggleCamera = async () => {
    if (!cameraActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720, facingMode: "user" } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Important: We must wait for onLoadedMetadata before playing
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(e => console.error("Error playing video:", e));
          };
        }
        streamRef.current = stream;
        setCameraActive(true);
      } catch (err) {
        console.error("Camera access denied or failed", err);
        alert(`Could not start the camera: ${err.message}. Please check your browser permissions.`);
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          if (track.kind === 'video') track.stop();
        });
        setCameraActive(false);
      }
    }
  };

  // Start face detection loop when video is playing
  const handleVideoPlay = () => {
    if (!modelsLoaded || !videoRef.current) return;

    detectionInterval.current = setInterval(async () => {
      if (videoRef.current && cameraActive) {
        const detections = await faceapi.detectSingleFace(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceExpressions();

        if (detections && detections.expressions) {
          // Find the dominant expression
          const expressions = Object.entries(detections.expressions);
          const dominant = expressions.reduce((a, b) => a[1] > b[1] ? a : b)[0];
          
          setCurrentExpression(dominant);
        }
      }
    }, 1000); // Check every 1 second
  };

  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Initialize Speech Recognition
  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Use continuous so the user can speak freely
      recognition.interimResults = true; // Enable live subtitles
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
        finalTranscriptRef.current = '';
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            currentFinal += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setInterimTranscript(currentInterim);
        
        if (currentFinal.trim() !== '') {
            finalTranscriptRef.current += currentFinal + ' ';
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript(''); // Clear interim when stopped
        
        const textToSend = finalTranscriptRef.current.trim();
        if (textToSend !== '') {
          // Send the current expression along with the transcribed speech
          if (currentExpressionRef.current) {
            sendMessage(JSON.stringify({
              type: 'expression_update',
              expression: currentExpressionRef.current,
              timestamp: new Date().toISOString()
            }));
          }

          sendMessage(JSON.stringify({ type: 'transcription', text: textToSend }));
          setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
        }
        finalTranscriptRef.current = ''; // Reset
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition API is not supported in this browser.");
    }
  }, [isConnected, sendMessage]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please try Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  };

  const handleEndSessionClick = () => {
     sendMessage(JSON.stringify({ type: 'end_session' }));
     // wait for the 'dashboard_summary' WS message which will trigger onEndSession callback
  };

  useEffect(() => {
    return () => {
      // 1. Clean up camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
          } catch(e) {}
        });
      }
      // 2. Clean up face detection interval
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
      // 3. Clean up speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch(e) {}
      }
    };
  }, []); // Empty dependency array means this only runs on mount/unmount

  return (
    <div className="flex flex-col h-[80vh] bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur pb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <h2 className="font-semibold text-lg tracking-tight">Practice Session in Progress</h2>
        </div>
        <div className="flex items-center gap-4">
          {!modelsLoaded && (
            <span className="text-sm text-neutral-500 animate-pulse">Loading AI Models...</span>
          )}
          {currentExpression && (
            <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1 rounded-full border border-neutral-700">
              <span className="text-xs text-neutral-400">Expression:</span>
              <span className="text-sm font-medium capitalize text-purple-400">{currentExpression}</span>
            </div>
          )}
          <span className={`text-sm px-2 py-0.5 rounded-full ${isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-neutral-800 overflow-hidden">
        {/* Left Side - Video Feed */}
        <div className="flex-1 p-6 flex flex-col justify-center items-center bg-neutral-950 relative group">
          <div className="w-full max-w-2xl aspect-video bg-neutral-800 rounded-2xl overflow-hidden relative shadow-inner ring-1 ring-white/5">
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              onPlay={handleVideoPlay}
              className={`w-full h-full object-cover transition-opacity duration-500 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-neutral-600">
                <VideoOff className="w-16 h-16" />
                <p>Turn on camera to enable expression tracking</p>
              </div>
            )}
          </div>
          
          {/* Controls Overlay */}
          <div className="absolute bottom-10 flex items-center gap-4 bg-neutral-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-neutral-700 shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button 
              onClick={toggleMic}
              className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
              title={isListening ? "Stop Listening" : "Start Speaking"}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button 
              onClick={toggleCamera}
              className={`p-3 rounded-full transition-colors ${cameraActive ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-800 text-white hover:bg-neutral-700'}`}
            >
              {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <div className="w-px h-8 bg-neutral-700 mx-2" />
            <button 
              onClick={handleEndSessionClick}
              className="p-3 px-6 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2"
            >
              <Square className="w-4 h-4 fill-current" />
              End Session
            </button>
          </div>
        </div>

        {/* Right Side - Transcript/AI Feedback */}
        <div className="w-full lg:w-96 flex flex-col bg-neutral-900">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="font-medium text-neutral-300">Live Transcript</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4 gap-4">
                <p className="text-neutral-500 text-sm">
                  Conversation will appear here once the AI connects and responds to your scenario.
                </p>
                <div className="px-4 py-3 bg-neutral-800/50 rounded-xl border border-neutral-700 w-full mt-4 flex items-start gap-3 text-left">
                  <Mic className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-300 font-medium">To talk to the AI:</p>
                    <p className="text-xs text-neutral-400 mt-1 hover:text-white transition-colors">Hover over the video and click the microphone icon. Click it again when you are finished speaking to send your message.</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm flex-shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-neutral-800 text-neutral-200 ml-auto rounded-br-sm shadow-md' 
                      : 'bg-purple-500/10 text-purple-200 rounded-bl-sm border border-purple-500/20 shadow-md'
                   }`}>
                    {msg.content}
                  </div>
                ))}
                
                {/* Live Subtitle (Interim Transcript) */}
                {interimTranscript && (
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm flex-shrink-0 bg-neutral-800/50 text-neutral-400 italic ml-auto rounded-br-sm border border-neutral-700/50 animate-pulse">
                    {interimTranscript}...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
