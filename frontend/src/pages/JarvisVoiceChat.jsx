import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Mic, MicOff, Send, Volume2, VolumeX, Loader2, MessageCircle, Zap, Copy, Trash2, User, Users, Headphones, Radio, Square } from 'lucide-react';
import { getToken, getStoredUser } from '../services/authStorage.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Mock AI responses for demo (fallback when API is unavailable)
const getMockResponse = (message) => {
  const responses = {
    hello: "Hello! I'm Jarvis, your AI assistant. How can I help you today?",
    help: "I can help you with questions about your studies, exam preparation, PDF analysis, and more. What would you like to know?",
    exam: "I can help you prepare for exams! You can upload PDFs and I'll generate practice questions for you.",
    study: "Great! I'm here to support your learning journey. What subject or topic would you like to study?",
    default: `I understand you're asking about "${message}". I'm here to help! Could you provide more details about what you need?`,
  };

  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) return responses.hello;
  if (lowerMessage.includes('help')) return responses.help;
  if (lowerMessage.includes('exam')) return responses.exam;
  if (lowerMessage.includes('study')) return responses.study;
  return responses.default;
};

const VOICE_OPTIONS = [
  { id: 'female-young', name: 'Girl', icon: User, pitch: 1.2, rate: 1 },
  { id: 'female-teacher', name: 'Teacher', icon: Users, pitch: 1, rate: 0.9 },
  { id: 'male-young', name: 'Boy', icon: User, pitch: 0.8, rate: 1 },
  { id: 'male-teacher', name: 'Professor', icon: Headphones, pitch: 0.7, rate: 0.85 },
  { id: 'male-deep', name: 'Deep Voice', icon: Radio, pitch: 0.6, rate: 0.8 },
];

export default function JarvisVoiceChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: 'Hello! I\'m Jarvis, your AI assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('female-teacher');
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setTextInput(transcript.trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text, forceSpeak = false) => {
    if (!('speechSynthesis' in window)) return;
    
    // Always speak if forceSpeak is true, otherwise check soundEnabled
    if (!forceSpeak && !soundEnabled) return;

    const voiceConfig = VOICE_OPTIONS.find((v) => v.id === selectedVoice) || VOICE_OPTIONS[1];

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get available voices and select based on voice type
    const voices = window.speechSynthesis.getVoices();
    let selectedSystemVoice = null;

    if (selectedVoice === 'female-young' || selectedVoice === 'female-teacher') {
      // Select female voice
      selectedSystemVoice = voices.find((v) => v.name.toLowerCase().includes('female')) ||
                           voices.find((v) => v.name.toLowerCase().includes('woman')) ||
                           voices.find((v) => v.name.toLowerCase().includes('samantha')) ||
                           voices.find((v) => v.name.toLowerCase().includes('victoria')) ||
                           voices[1];
    } else {
      // Select male voice
      selectedSystemVoice = voices.find((v) => v.name.toLowerCase().includes('male')) ||
                           voices.find((v) => v.name.toLowerCase().includes('man')) ||
                           voices.find((v) => v.name.toLowerCase().includes('david')) ||
                           voices.find((v) => v.name.toLowerCase().includes('alex')) ||
                           voices[0];
    }

    if (selectedSystemVoice) {
      utterance.voice = selectedSystemVoice;
    }

    utterance.rate = voiceConfig.rate;
    utterance.pitch = voiceConfig.pitch;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if (!textInput.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: textInput,
      timestamp: new Date(),
    };

    const messageText = textInput;
    setMessages((prev) => [...prev, userMessage]);
    setTextInput('');
    setIsLoading(true);

    try {
      const token = getToken();
      
      // Try backend endpoint first
      try {
        const response = await axios.post(
          `${API_BASE}/api/jarvis/chat`,
          { message: messageText },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const aiResponse = response.data?.response || getMockResponse(messageText);

        const aiMessage = {
          id: messages.length + 2,
          type: 'ai',
          text: aiResponse,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
        speakText(aiResponse, true);
        return;
      } catch (backendError) {
        console.log('Backend endpoint not available, trying GROQ API...');
      }

      // Fallback to GROQ API via backend
      const groqResponse = await axios.post(
        `${API_BASE}/api/groq/jarvis`,
        { message: messageText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const aiResponse = groqResponse.data?.response || getMockResponse(messageText);

      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        text: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      speakText(aiResponse, true);
    } catch (error) {
      console.error('Error sending message:', error);
      // Use mock response as fallback
      const aiResponse = getMockResponse(messageText);
      
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        text: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      speakText(aiResponse, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'ai',
        text: 'Hello! I\'m Jarvis, your AI assistant. How can I help you today?',
        timestamp: new Date(),
      },
    ]);
  };

  const user = getStoredUser();

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-amber-50 via-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50 px-3 sm:px-6 py-3 sm:py-5 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 sm:h-8 w-5 sm:w-8 text-amber-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-2xl font-bold text-slate-900 truncate">Jarvis Voice Chat</h1>
              <p className="text-xs text-slate-500 truncate">Your AI study companion • Made by Malayali Dev</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 relative flex-wrap">
            {/* Voice Selection Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700 transition hover:bg-purple-200 whitespace-nowrap"
                title="Change voice"
              >
                {(() => {
                  const currentVoice = VOICE_OPTIONS.find((v) => v.id === selectedVoice);
                  const Icon = currentVoice?.icon || Headphones;
                  return (
                    <>
                      <Icon className="h-4 w-4" />
                      {currentVoice?.name || 'Voice'}
                    </>
                  );
                })()}
              </button>
              {showVoiceMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-amber-200 bg-white shadow-lg z-50">
                  {VOICE_OPTIONS.map((voice) => {
                    const Icon = voice.icon;
                    return (
                      <button
                        key={voice.id}
                        onClick={() => {
                          setSelectedVoice(voice.id);
                          setShowVoiceMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition ${
                          selectedVoice === voice.id
                            ? 'bg-purple-100 text-purple-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {voice.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={clearChat}
              className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 whitespace-nowrap"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`rounded-full p-2 sm:p-3 transition flex-shrink-0 ${
                soundEnabled
                  ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
              title={soundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {soundEnabled ? <Volume2 className="h-4 sm:h-5 w-4 sm:w-5" /> : <VolumeX className="h-4 sm:h-5 w-4 sm:w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-5">
        {messages.map((message, idx) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeInUp`}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div
              className={`max-w-xs sm:max-w-md rounded-3xl px-4 sm:px-5 py-3 sm:py-4 ${
                message.type === 'user'
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-xl transition'
                  : 'bg-white text-slate-900 border border-amber-100/50 shadow-md hover:shadow-lg transition'
              }`}
            >
              <p className="text-xs sm:text-sm leading-relaxed font-medium break-words">{message.text}</p>
              <p className={`mt-2 text-xs ${message.type === 'user' ? 'text-amber-100' : 'text-slate-400'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fadeInUp">
            <div className="flex items-center gap-3 rounded-3xl bg-white px-5 py-4 border border-amber-100/50 shadow-md">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
              <p className="text-sm font-semibold text-slate-600">Jarvis is thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Premium Input Area */}
      <div className="border-t border-amber-200/50 bg-gradient-to-t from-white to-amber-50/30 px-3 sm:px-6 py-4 sm:py-6 shadow-2xl">
        <div className="flex gap-2 sm:gap-3 mb-2 sm:mb-3 items-end">
          {/* Voice Input Button */}
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading || isSpeaking}
            className={`flex h-11 sm:h-12 w-11 sm:w-12 items-center justify-center rounded-full font-bold transition shadow-lg flex-shrink-0 ${
              isListening
                ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white animate-pulse'
                : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 hover:from-slate-300 hover:to-slate-400'
            } disabled:opacity-50`}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          {/* Text Input */}
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 rounded-2xl border-2 border-amber-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200/50 resize-none font-medium"
            rows="2"
            disabled={isLoading}
          />

          {/* Send Button */}
          <button
            onClick={sendMessage}
            disabled={!textInput.trim() || isLoading}
            className="flex h-11 sm:h-12 w-11 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white font-bold transition hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl disabled:opacity-50 flex-shrink-0"
            title="Send message"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>

          {/* Stop Speaking Button */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex h-11 sm:h-12 w-11 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white font-bold transition hover:from-red-600 hover:to-red-700 shadow-lg animate-pulse flex-shrink-0"
              title="Stop speaking"
            >
              <Square className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Status Indicators */}
        {(isListening || isSpeaking || soundEnabled) && (
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
            {isListening && (
              <span className="flex items-center gap-1 bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                <Mic className="h-3 w-3" />
                Listening...
              </span>
            )}
            {isSpeaking && (
              <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                <Volume2 className="h-3 w-3" />
                Speaking...
              </span>
            )}
            {soundEnabled && (
              <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                <Zap className="h-3 w-3" />
                Sound enabled
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
