import { useState, useRef, useEffect } from "react";
import { Send, User, Loader2, Sprout, Mic, Languages, Volume2, VolumeX, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { API_ML, API_ENDPOINTS } from "@/urlConfig";

const initialMessage = {
  id: "initial-0",
  text: "👋 Halo! Saya adalah asisten pertanian Anda. Saya siap membantu menjawab pertanyaan seputar pertanian, tanaman, atau perkebunan.",
  isBot: true,
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

const GrowingPlantLoader = () => (
  <div className="flex items-start gap-3 animate-fade-in px-4">
    <Avatar className="w-10 h-10"><AvatarFallback className="bg-emerald-100"><Sprout className="w-5 h-5 text-emerald-600" /></AvatarFallback></Avatar>
    <div className="flex flex-col gap-2 max-w-[80%]">
      <div className="flex items-center gap-2 h-8"><div className="flex space-x-1">{[...Array(3)].map((_, i) => (<div key={i} className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s`, animationDuration: "1s" }} />))}</div></div>
      <div className="flex gap-2 items-center text-sm text-emerald-600"><Sprout className="w-4 h-4 animate-pulse" /><span className="animate-pulse">Sedang menumbuhkan jawaban...</span></div>
    </div>
  </div>
);

const DateDivider = ({ date }) => (
  <div className="flex items-center justify-center my-6 px-4">
    <div className="bg-gray-200 h-[1px] flex-grow" /><span className="px-4 text-sm text-gray-500 font-medium">{date}</span><div className="bg-gray-200 h-[1px] flex-grow" />
  </div>
);

const ExampleQuestions = ({ onQuestionSelect }) => {
  const questions = [
    "Bagaimana cara menanam padi yang tahan hama?",
    "Apa pupuk terbaik untuk cabai saat musim hujan?",
    "Kapan waktu tanam jagung yang baik di Jawa Timur?",
  ];
  return (
    <div className="px-4 py-2 animate-fade-in">
      <p className="text-sm text-center text-gray-500 mb-3">Atau coba salah satu pertanyaan ini:</p>
      <div className="flex flex-wrap justify-center gap-2">
        {questions.map((q, i) => (
          <Button key={i} variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 h-auto text-wrap text-left" onClick={() => onQuestionSelect(q)}>{q}</Button>
        ))}
      </div>
    </div>
  );
};

const ChatbotUI = () => {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("id");
  const [isListening, setIsListening] = useState(false);
  // --- [PERUBAHAN 1] --- State untuk kontrol suara
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentSpeakingId, setCurrentSpeakingId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // useEffect(scrollToBottom, [messages, isLoading]);
  const prevMessagesCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMessagesCount.current) { scrollToBottom(); }
    prevMessagesCount.current = messages.length;
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = language === 'id' ? 'id-ID' : 'en-US';
      recognition.interimResults = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSubmit(transcript);
      };
      recognition.onerror = (event) => console.error("Speech recognition error:", event.error);
      recognitionRef.current = recognition;
    }
  }, [language]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  const speak = (text, lang, messageId) => {
    // Fungsi hanya berjalan jika suara diaktifkan
    // if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    if (!isVoiceEnabled || !('speechSynthesis' in window)) {
      window.speechSynthesis.cancel();
      setCurrentSpeakingId(null);
      setIsPaused(false);
      return;
    }

    // jika pesan sedang dalam proses tts, toggle pause/resume
    if (currentSpeakingId === messageId) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
      return;
    }

    // start tts baru
    window.speechSynthesis.cancel();
    setCurrentSpeakingId(messageId);
    setIsPaused(false);

    // const cleanText = text.replace(/(\*\*|`|#|\*|-|\[.*?\]\(.*?\))/g, ''); // Membersihkan markdown & link
    const cleanText = text
      .replace(/`[^`]*`/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/#+\s/g, '')
      .replace(/[-*_]{3,}/g, '')
      .replace(/>\s+/g, '')
      .replace(/`/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'id' ? 'id-ID' : 'en-US';
    utterance.rate = 1.2;
    utterance.onend = () => {
      setCurrentSpeakingId(null);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (query) => {
    const userQuery = (typeof query === 'string' ? query : input).trim();
    if (!userQuery) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: userQuery,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    // --- [PERUBAHAN 2] --- Menyiapkan riwayat percakapan untuk dikirim
    const conversationHistory = messages.slice(1); // Mengabaikan pesan sambutan awal

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_ML}${API_ENDPOINTS.CHAT}`, {
        query: userQuery,
        language: language,
        history: conversationHistory, // Mengirim riwayat
      });

      const botMessage = {
        id: `bot-${Date.now()}`,
        text: response.data.response,
        isBot: true,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMessage]);
      if (!isMobile) {
        if (isVoiceEnabled) {
          // Stop tts sebelum starting new tts
          window.speechSynthesis.cancel();
          setCurrentSpeakingId(null);
          setIsPaused(false);

          speak(botMessage.text, language, botMessage.id);// Memanggil fungsi `speak` yang sekarang kondisional
        }
      }
    } catch (error) {
      console.error("Error during chat API call:", error);
      const errorMessage = {
        id: `error-${Date.now()}`, text: "Maaf, terjadi kesalahan saat menghubungi server.", isBot: true, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  // Komponen MessageBubble yang sudah diperbaiki
  const MessageBubble = ({ message }) => (
    <div className={`flex items-start gap-3 group animate-fade-in px-4 ${message.isBot ? "justify-start" : "justify-end"}`}>
      {message.isBot && (<Avatar className="w-10 h-10 flex-shrink-0"><AvatarFallback className="bg-emerald-100"><Sprout className="w-5 h-5 text-emerald-600" /></AvatarFallback></Avatar>)}
      <div className={`flex flex-col ${message.isBot ? "items-start" : "items-end"}`}>
        <div className="flex items-center gap-2">
          {message.isBot && <span className="text-sm font-medium text-emerald-700">AgriBot Assistant</span>}
          <span className="text-xs text-gray-500">{message.timestamp}</span>
        </div>
        <div className={`mt-1 p-3.5 rounded-2xl relative group ${message.isBot ? "bg-white border border-gray-200 rounded-tl-none shadow-sm" : "bg-emerald-600 text-white rounded-tr-none"}`} style={{ maxWidth: "min(450px, 85vw)" }}>
          {message.isBot ? (
            <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline" />
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          ) : (
            message.text
          )}
          {message.isBot && !isMobile && (
            <Button type="button" variant="ghost" size="icon"
              className="absolute top-1 right-1 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => { speak(message.text, language, message.id) }
              }>
              {currentSpeakingId === message.id && !isPaused ? (
                <Volume2 className="w-4 h-4 text-gray-500" /> // pause
              ) : (
                <VolumeX className="w-4 h-4 text-gray-500" /> // resume
              )}
            </Button>
          )}
        </div>
      </div>
      {!message.isBot && (<Avatar className="w-10 h-10 flex-shrink-0"><AvatarFallback className="bg-emerald-600 text-white"><User className="w-5 h-5" /></AvatarFallback></Avatar>)}
    </div>
  );

  return (
    <div className="h-[100vh] bg-gray-50 flex flex-col">
      <header className="sticky top-0 px-2 py-4 sm:px-6 sm:py-2 flex justify-between items-center bg-green-700 text-white shadow-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center"><Sprout className="w-6 h-6" /></div>
          <div><h1 className="text-sm sm:text-xl font-semibold">AgriBot Assistant</h1><p className="text-xs sm:text-sm text-green-100">Solusi Cerdas Pertanian Indonesia</p></div>
        </div>
        <div className="flex items-center gap-4">
          {/* --- [PERUBAHAN 3] --- Tombol Mute/Unmute */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsVoiceEnabled(prev => !prev);
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className="text-white hover:bg-green-600">
              {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          )}
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[80px] sm:w-[130px]  bg-white text-emerald-800 focus:ring-2 focus:ring-green-300">
              <Languages className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">
                <>
                  <span className="block sm:hidden">ID</span>
                  <span className="hidden sm:block">Indonesia</span>
                </>
              </SelectItem>
              <SelectItem value="en">
                <>
                  <span className="block sm:hidden">EN</span>
                  <span className="hidden sm:block">English</span>
                </>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>


      <ScrollArea className="flex-grow">
        <div className="pt-6 pb-4">
          <DateDivider date="Today" />
          <div className="space-y-6">
            {messages.map((message) => (<MessageBubble key={message.id} message={message} />))}
            {messages.length === 1 && <ExampleQuestions onQuestionSelect={handleSubmit} />}
            {isLoading && <GrowingPlantLoader />}
          </div>
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </ScrollArea>
      <footer className="sticky bottom-0 p-4 bg-white border-t z-20">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(input); }} className="relative">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tulis pertanyaan Anda di sini..." className="pr-24 h-12 text-base" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={handleMicClick} className={`text-gray-500 hover:bg-emerald-100 ${isListening ? 'text-red-500' : ''}`}>{isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}</Button>
            <Button type="submit" size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full w-9 h-9" disabled={!input || isLoading}>{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}</Button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default ChatbotUI;