import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { queryAgroAI } from '../lib/gemini';
import { analyzePlantPhoto } from '../lib/plantHealth';
import { speakBrowserTTS } from '../lib/elevenlabs';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import ChatBubble from '../components/ChatBubble';
import VoiceRecorder from '../components/VoiceRecorder';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

export function AgroAI() {
  const { t } = useTranslation();
  const { currentLang } = useLanguage();
  const { user } = useAuth();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: currentLang === 'hi'
        ? 'नमस्ते! मैं AgroKalyan AI हूँ। आप अपनी फसल, कीट रोग या सरकारी योजनाओं से जुड़ा सवाल बोलकर या लिखकर पूछ सकते हैं।'
        : currentLang === 'ta'
        ? 'வணக்கம்! நான் AgroKalyan AI. உங்கள் பயிர் நோய்கள் மற்றும் அரசாங்கத் திட்டங்களைப் பற்றி பேசலாம் அல்லது எழுதலாம்.'
        : 'Welcome to AgroKalyan AI! You can ask crop disease, soil nutrient, or government scheme questions by voice or text in your native language.',
      lang: currentLang
    }
  ]);

  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Voice Input Hook
  const { isListening, transcript, error: voiceError, startListening, stopListening } = useVoiceInput(
    currentLang,
    (text) => {
      setInputQuery(text);
    }
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Load chat history from Firestore if available
  useEffect(() => {
    if (!user?.uid) return;
    try {
      const chatRef = collection(db, 'chats', user.uid, 'messages');
      const q = query(chatRef, orderBy('timestamp', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const loaded = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setMessages(loaded);
        }
      }, (err) => {
        console.warn('Firestore chat listener warning (using session chat state):', err);
      });
      return () => unsubscribe();
    } catch {
      // fallback
    }
  }, [user]);

  const saveMessageToFirestore = async (msg) => {
    if (!user?.uid) return;
    try {
      await addDoc(collection(db, 'chats', user.uid, 'messages'), {
        ...msg,
        timestamp: new Date()
      });
    } catch (err) {
      console.warn('Firestore save warning:', err);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();

    if (!inputQuery.trim() && !selectedImage) return;

    const userText = inputQuery.trim() || 'Please analyze this attached crop leaf photo for disease diagnosis.';
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      imageUrl: imagePreview,
      lang: currentLang
    };

    setMessages((prev) => [...prev, userMsg]);
    saveMessageToFirestore(userMsg);

    setInputQuery('');
    const currentPhoto = selectedImage;
    setSelectedImage(null);
    setImagePreview(null);
    setLoading(true);

    try {
      let aiResponseText = '';

      if (currentPhoto) {
        // Image Diagnosis Flow
        const diagResult = await analyzePlantPhoto(currentPhoto, userText, currentLang);
        aiResponseText = diagResult.diagnosis;
      } else {
        // Gemini Chat Flow
        const result = await queryAgroAI(userText, currentLang, messages);
        aiResponseText = result.text;
      }

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: aiResponseText,
        lang: currentLang
      };

      setMessages((prev) => [...prev, botMsg]);
      saveMessageToFirestore(botMsg);

      // Auto Voice Playback
      speakBrowserTTS(aiResponseText, currentLang);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Sorry, I encountered an issue connecting to the AI server. Please check your network connection and try again.',
        lang: 'en'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const promptSuggestions = [
    { text: currentLang === 'hi' ? 'मेरी गेहूं की पत्तियों में पीलापन आ रहा है, क्या करें?' : 'Wheat leaves are turning yellow, what treatment is needed?', icon: 'grass' },
    { text: currentLang === 'hi' ? 'PM-KISAN योजना की किश्त कब आएगी?' : 'How do I check PM-KISAN installment eligibility?', icon: 'payments' },
    { text: currentLang === 'ta' ? 'தக்காளி பயிர் இலை கருகல் நோய் தடுப்பது எப்படி?' : 'How to prevent early blight in tomato crops?', icon: 'coronavirus' }
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-background text-on-surface">
      <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop space-y-6">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            AgroKalyan Conversational AI
          </div>
          <h1 className="font-headline-md text-3xl md:text-5xl font-bold text-primary">
            {t('pages.agroAI.title')}
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto">
            {t('pages.agroAI.subtitle')}
          </p>
        </div>

        {/* Chat Room Workspace Container */}
        <div className="bg-surface border border-outline-variant/30 rounded-2xl shadow-md overflow-hidden flex flex-col h-[600px] relative">
          {/* Top Bar */}
          <div className="bg-surface-container-high px-6 py-3 border-b border-outline-variant/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
              <span className="font-bold text-primary text-sm">
                Voice & Multimodal Hub ({currentLang.toUpperCase()})
              </span>
            </div>

            {imagePreview && (
              <div className="flex items-center gap-2 bg-surface px-3 py-1 rounded-lg border border-outline-variant/40 text-xs">
                <span className="material-symbols-outlined text-[16px] text-terracotta">image</span>
                <span className="truncate max-w-[120px] font-semibold">Photo Attached</span>
                <button
                  type="button"
                  onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                  className="text-error font-bold ml-1 hover:underline"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-surface-container-lowest"
          >
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} currentLang={currentLang} />
            ))}

            {loading && (
              <div className="flex items-center gap-3 text-secondary font-bold text-sm p-4 bg-secondary-container/40 rounded-2xl max-w-xs animate-pulse">
                <span className="material-symbols-outlined text-[24px] animate-spin">sync</span>
                <span>Agro-AI is analyzing your crop query...</span>
              </div>
            )}
          </div>

          {/* Voice Prompt Suggestions */}
          {messages.length < 3 && (
            <div className="px-6 py-2 bg-surface-container-low border-t border-outline-variant/20 flex gap-2 overflow-x-auto">
              {promptSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInputQuery(s.text)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-outline-variant/30 text-xs text-on-surface hover:border-primary hover:text-primary transition-all shrink-0 font-medium"
                >
                  <span className="material-symbols-outlined text-[16px] text-terracotta">{s.icon}</span>
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Form Bar */}
          <form onSubmit={handleSendMessage} className="p-4 bg-surface border-t border-outline-variant/30 flex items-center gap-3">
            {/* Image Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors"
              title="Upload Crop Photo for Disease Diagnosis"
            >
              <span className="material-symbols-outlined text-[26px]">photo_camera</span>
            </button>

            {/* Text Field */}
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to your voice...'
                  : currentLang === 'hi'
                  ? 'अपनी फसल या रोग के बारे में सवाल पूछें...'
                  : 'Ask about crops, diseases, fertilizers, or schemes...'
              }
              className="flex-1 px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-on-surface text-sm sm:text-base"
            />

            {/* Voice Microphone Recorder */}
            <VoiceRecorder
              isListening={isListening}
              onStart={startListening}
              onStop={stopListening}
              language={currentLang}
            />

            {/* Submit Send Button */}
            <button
              type="submit"
              disabled={loading || (!inputQuery.trim() && !selectedImage)}
              className="p-3 md:p-4 bg-terracotta hover:bg-terracotta-hover disabled:opacity-50 text-white rounded-full transition-all shadow-md flex items-center justify-center shrink-0"
            >
              <span className="material-symbols-outlined text-[24px]">send</span>
            </button>
          </form>
        </div>

        {voiceError && (
          <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>{voiceError}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgroAI;
