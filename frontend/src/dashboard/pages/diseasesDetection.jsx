import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Upload, AlertCircle, Leaf, User, Camera, RotateCcw, X, Video, ShieldCheck, TrendingUp, ChevronsRight, Bot } from "lucide-react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const LoadingAnimation = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="relative mb-12">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6"
          style={{
            bottom: "2rem",
            animation: `bounce ${1 + i * 0.2}s infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        >
          <Leaf className={`text-emerald-500 transform ${ i % 2 === 0 ? "rotate-[-45deg]" : "rotate-45deg]" }`} />
        </div>
      ))}
    </div>
    <div className="text-emerald-600 font-medium">Menganalisis Tanaman...</div>
    <div className="text-sm text-emerald-500">Mohon tunggu sebentar.</div>
  </div>
);

// Komponen baru untuk menampilkan hasil analisis
const AnalysisResultDisplay = ({ result }) => (
    <div className="p-4 space-y-6">
        <div>
            <h3 className="text-md sm:text-lg font-semibold text-emerald-800 mb-3">Ringkasan Diagnosis (AI Summary)</h3>
            <div className="space-y-3">
                <div className="flex items-start p-3 bg-emerald-50 rounded-lg">
                    <Bot className="h-5 w-5 text-emerald-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                        <p className="text-xs sm:text-sm text-emerald-500 font-medium">Diagnosis</p>
                        <p className="text-xs text-emerald-900 font-semibold">{result.diagnosis || 'Tidak terdeteksi'}</p>
                    </div>
                </div>
                <div className="flex items-start p-3 bg-red-50 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                        <p className="text-xs sm:text-sm text-red-500 font-medium">Tingkat Risiko</p>
                        <p className="text-xs text-red-900 font-semibold">{result.tingkat_risiko || 'Tidak ada'}</p>
                    </div>
                </div>
                <div className="flex items-start p-3 bg-amber-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-amber-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                        <p className="text-xs sm:text-sm text-amber-500 font-medium">Perkiraan Dampak Panen</p>
                        <p className="text-xs text-amber-900 font-semibold">{result.dampak_panen || 'Tidak ada'}</p>
                    </div>
                </div>
            </div>
        </div>
        {result.penjelasan && (
            <div className="mt-6"> {/* Margin top untuk pemisah */}
                <h3 className="text-md sm:text-lg  font-semibold text-emerald-800 mb-3">Penjelasan Diagnosis</h3>
                <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
                    <p className="text-xs text-gray-700 leading-relaxed">{result.penjelasan}</p>
                </div>
            </div>
        )}
        <div>
            <h3 className="text-md sm:text-lg font-semibold text-emerald-800 mb-3">Rekomendasi Tindakan</h3>
            <ul className="space-y-2">
                {result.rekomendasi && result.rekomendasi.length > 0 ? (
                    result.rekomendasi.map((rec, index) => (
                        <li key={index} className="flex items-start">
                            <ChevronsRight className="h-5 w-5 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-700">{rec}</span>
                        </li>
                    ))
                ) : (
                    <p className="text-xs text-gray-500">Tidak ada rekomendasi tindakan saat ini.</p>
                )}
            </ul>
        </div>
    </div>
);


const PlantHealthAnalysis = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userMessage, setUserMessage] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null); // State baru untuk hasil
  const [language, setLanguage] = useState("english");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); 

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const isMobile = useMemo(() => /Mobi/i.test(navigator.userAgent), []);

  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async (options = {}) => {
    const { deviceId, newFacingMode } = options;
    setCameraLoading(true);
    setCameraError(null);
    stopCurrentStream();

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(({ kind }) => kind === 'videoinput');
      setAvailableCameras(videoDevices);

      const constraints = { video: { width: { ideal: 1280 }, height: { ideal: 720 } } };
      if (isMobile) constraints.video.facingMode = newFacingMode || facingMode;
      else if (deviceId) constraints.video.deviceId = { exact: deviceId };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const currentDeviceId = stream.getVideoTracks()[0].getSettings().deviceId;
        setSelectedCameraId(currentDeviceId || "");
      } else {
        throw new Error("Video element not found.");
      }
    } catch (err) {
      console.error("Camera setup error:", err);
      let errorMessage = "Tidak dapat mengakses kamera. ";
      if (err.name === 'NotAllowedError') errorMessage += "Mohon izinkan akses kamera di browser Anda.";
      else if (err.name === 'NotFoundError') errorMessage += "Tidak ada kamera yang ditemukan.";
      else if (err.name === "OverconstrainedError") errorMessage += "Kamera tidak mendukung resolusi atau mode yang diminta.";
      else errorMessage += "Silakan coba lagi.";
      setCameraError(errorMessage);
    } finally {
      setCameraLoading(false);
    }
  }, [stopCurrentStream, isMobile, facingMode]);

  useEffect(() => {
    if (cameraOpen) startCamera({ deviceId: selectedCameraId || undefined });
    else stopCurrentStream();
    return () => stopCurrentStream();
  }, [cameraOpen]);

  const handleLanguageChange = (e) => setLanguage(e.target.value);

  const clearResults = () => {
    setError(null);
    setAnalysisResult(null);
    setUserMessage("");
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    clearResults();

    const validTypes = ["image/jpeg", "image/jpg"];

    if (!validTypes.includes(file.type)) {
      setError("Mohon unggah file gambar berformat JPEG (.jpg atau .jpeg).");
      return;
    }
    
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setUserMessage(`File dipilih: ${file.name}`);
    } else {
      setError("Mohon unggah file gambar.");
    }
  };

  const handleCameraOpen = () => setCameraOpen(true);
  const handleCameraClose = () => setCameraOpen(false);
  
  const handleSwitchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera({ newFacingMode: newMode });
  };

  const handleCameraSelect = (event) => {
    const newDeviceId = event.target.value;
    setSelectedCameraId(newDeviceId);
    startCamera({ deviceId: newDeviceId });
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.paused) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      clearResults();
      const file = new File([blob], `capture-${Date.now()}.png`, { type: "image/png" });
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setUserMessage(`Gambar diambil dari kamera.`);
      handleCameraClose();
    }, "image/png");
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Mohon pilih atau ambil gambar terlebih dahulu");
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysisResult(null);
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("language", language.toLowerCase().slice(0, 2));

    try {
      const response = await axios.post(
        'http://127.0.0.1:5000/classify_plant_disease',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setAnalysisResult(response.data); // Simpan seluruh objek hasil
    } catch (error) {
      console.error("Error analyzing image:", error);
      setError("Gagal menganalisis gambar. Pastikan server API berjalan dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
            <div className="w-full relative py-4">
              <h1 className="text-lg sm:text-2xl font-bold text-emerald-800 flex items-center justify-center gap-2">
                <Leaf className="h-6 w-6 text-emerald-600" />
                Analisis Kesehatan Tanaman
              </h1>
              {/* <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-800">
                <select value={language} onChange={handleLanguageChange} className="w-[120px] bg-white text-emerald-800 border border-emerald-200 rounded px-3 py-1">
                  <option value="indonesia">Indonesia</option>
                  <option value="english">English</option>
                </select>
              </div> */}
            </div>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow-md border-emerald-100 rounded-lg border">
              <div className="p-3 sm:p-6 text-center border-b border-emerald-100"><h2 className="text-md sm:text-lg text-emerald-700 font-semibold">Unggah Gambar Tanaman</h2></div>
              <div className="p-6"><div className="space-y-6">
                  <button onClick={handleCameraOpen} className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-medium transition-colors">
                    <Camera className="w-5 h-5" /> Gunakan Kamera
                  </button>
                  <div className="border-2 border-dashed border-emerald-200 rounded-xl p-8 text-center hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 cursor-pointer relative">
                    <input type="file" onChange={handleFileSelect} accept="image/*" className="hidden" id="image-upload" />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="h-10 w-10 text-emerald-400" />
                        <div className="text-emerald-600 font-medium">Klik untuk unggah</div>
                        <div className="text-sm text-emerald-500">atau seret gambar ke sini</div>
                        <div className="text-xs text-gray-500 italic">hanya format jpg, jpeg</div>
                      </div>
                    </label>
                  </div>
                  {preview && (<div className="rounded-lg overflow-hidden border-2 border-emerald-100"><img src={preview} alt="Preview" className="w-full h-48 object-cover" /></div>)}
                  <button onClick={handleAnalyze} disabled={!selectedFile || loading} className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow-sm transition-all duration-300 ${!selectedFile || loading ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-md"}`}>
                    {loading ? "Menganalisis..." : "Analisis Tanaman"}
                  </button>
                  {error && (<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"><div className="flex items-center gap-2 text-red-800"><AlertCircle className="h-4 w-4" /><span className="font-medium">Error</span></div><p className="text-red-600 text-sm mt-1">{error}</p></div>)}
              </div></div>
            </div>
  
            <div className="bg-white shadow-md border-emerald-100 rounded-lg border">
              <div className="p-3 sm:p-6 text-center border-b border-emerald-100"><h2 className="text-md sm:text-lg  text-emerald-700  font-semibold">Hasil Analisis</h2></div>
              <div className="h-[465px] overflow-y-auto">
                {loading ? <LoadingAnimation /> : 
                  analysisResult ? <AnalysisResultDisplay result={analysisResult} /> :
                  <div className="h-full flex items-center justify-center text-center text-emerald-500 p-4">
                    {userMessage ? 
                      <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-800 rounded-lg">
                        <User className="h-5 w-5"/>
                        <span>{userMessage}</span>
                      </div> : 
                      "Hasil analisis akan muncul di sini."
                    }
                  </div>
                }
              </div>
            </div>
          </div>
      </div>

      {cameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-emerald-100"><h2 className="text-lg font-semibold text-emerald-700 flex items-center gap-2"><Camera className="w-5 h-5"/> Kamera</h2><button onClick={handleCameraClose} className="p-2 hover:bg-emerald-50 rounded-full transition-colors"><X className="h-5 w-5 text-emerald-600" /></button></div>
            <div className="relative bg-black flex-1 flex items-center justify-center min-h-[300px]">
              {cameraLoading && !cameraError && (<div className="text-center text-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>Memulai kamera...</div>)}
              {cameraError && (<div className="text-center p-4 text-red-400"><AlertCircle className="h-8 w-8 mx-auto mb-2" /><p className="font-semibold">Gagal Memuat Kamera</p><p className="text-sm">{cameraError}</p></div>)}
              <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cameraLoading || cameraError ? 'hidden' : ''}`} />
            </div>
            <div className="p-4 border-t border-emerald-100 bg-gray-50 space-y-4">
              {!cameraError && (<div className="relative flex items-center justify-center">
                  <button onClick={handleCapture} disabled={cameraLoading || !!cameraError} className="bg-emerald-500 text-white p-4 rounded-full hover:bg-emerald-600 disabled:bg-emerald-300 flex items-center justify-center shadow-lg"><Camera className="h-6 w-6" /></button>
                  {isMobile && availableCameras.length > 1 && (<div className="absolute right-0"><button onClick={handleSwitchCamera} className="bg-gray-200 text-gray-800 p-3 rounded-full hover:bg-gray-300"><RotateCcw className="h-6 w-6" /></button></div>)}
              </div>)}
              {!isMobile && availableCameras.length > 1 && !cameraError && (<div className="flex items-center gap-2"><Video className="w-5 h-5 text-gray-600"/><select value={selectedCameraId} onChange={handleCameraSelect} className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700">
                {availableCameras.map((device, index) => (<option key={device.deviceId} value={device.deviceId}>{device.label || `Kamera ${index + 1}`}</option>))}
              </select></div>)}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); } 40%, 43% { transform: translate3d(0, -30px, 0); } 70% { transform: translate3d(0, -15px, 0); } 90% { transform: translate3d(0,-4px,0); } }
        .overflow-y-auto::-webkit-scrollbar { width: 8px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: #f1f5f9; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 4px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
    </div>
  );
};

export default PlantHealthAnalysis;