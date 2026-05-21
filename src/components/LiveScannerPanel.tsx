import React, { useRef, useEffect, useState } from 'react';
import { Camera, ScanLine, Loader, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { AnswerStatus } from '../types';

interface LiveScannerPanelProps {
  numQuestions: number;
  onScanResult: (answers: AnswerStatus[]) => void;
}

export function LiveScannerPanel({ numQuestions, onScanResult }: LiveScannerPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastImage, setLastImage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Sila buka aplikasi di tetingkap baru (New Tab) untuk memberikan kebenaran kamera kepada pelayar web.");
      }
      
      // Stop existing stream if any
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().then(() => {
          setIsStreaming(true);
        }).catch(err => {
          console.warn("Video play interrupted or paused:", err);
          setCameraError("Gagal memainkan video dari kamera. Sila semak kebenaran pelayar web anda.");
          setIsStreaming(false);
        });
      }
    } catch (err: any) {
      console.error("Error accessing camera", err);
      setCameraError(err.message || "Akses kamera ditolak atau peranti tidak ditemui. Pastikan anda benarkan akses kamera.");
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleVideoPause = () => {
    setIsStreaming(false);
  };

  const handleVideoPlay = () => {
    setIsStreaming(true);
  };


  const handleSnapAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsAnalyzing(true);
    
    // Draw current video frame to canvas
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Crop center 70% (15% margins) to focus on the answers and remove background
    const marginX = video.videoWidth * 0.15;
    const marginY = video.videoHeight * 0.15;
    const sourceWidth = video.videoWidth * 0.70;
    const sourceHeight = video.videoHeight * 0.70;

    // Downscale the image to reduce upload & processing time
    const maxDimension = 600;
    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;
    
    if (targetWidth > maxDimension || targetHeight > maxDimension) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round(targetHeight * (maxDimension / targetWidth));
        targetWidth = maxDimension;
      } else {
        targetWidth = Math.round(targetWidth * (maxDimension / targetHeight));
        targetHeight = maxDimension;
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        setIsAnalyzing(false);
        return;
    }
    
    // Draw cropped portion
    ctx.drawImage(video, marginX, marginY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    // Use lower quality jpeg to reduce payload size significantly
    const base64Image = canvas.toDataURL('image/jpeg', 0.4);
    setLastImage(base64Image);

    try {
      const response = await fetch('/api/analyze-omr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          numQuestions: numQuestions
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server returned status ' + response.status);
      }

      const data = await response.json();
      const results = data.results;

      // Ensure answers array size matches numQuestions
      const answers: AnswerStatus[] = Array(numQuestions).fill('BLANK');
      if (Array.isArray(results)) {
        results.forEach((res: any) => {
          // ensure 1-based indexing map to 0-based
          const idx = res.question - 1;
          if (idx >= 0 && idx < numQuestions) {
            answers[idx] = res.answer as AnswerStatus;
          }
        });
      }
      
      onScanResult(answers);
    } catch (error: any) {
      console.error('API Error:', error);
      alert('Ralat sistem: ' + (error.message || 'Sila cuba lagi.'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden flex flex-col">
        <div className="bg-indigo-50/50 px-5 py-4 border-b border-indigo-100 flex justify-between items-center">
            <h3 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-500" /> Imbas Kertas (Kamera)
            </h3>
            {isAnalyzing && (
              <span className="text-[10px] bg-fuchsia-100 text-fuchsia-800 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm border border-fuchsia-200">
                <Loader className="w-3.5 h-3.5 animate-spin" /> Sedang Menganalisis...
              </span>
            )}
        </div>
        
        <div className="relative bg-slate-900 w-full h-[500px] flex justify-center items-center overflow-hidden">
          {cameraError ? (
            <div className="text-rose-400 absolute px-6 text-center text-sm font-semibold italic bg-black bg-opacity-80 p-4 rounded-xl shadow-lg z-20 mx-4 border border-rose-500/30">
              {cameraError}
            </div>
          ) : !isStreaming ? (
            <div className="flex flex-col items-center justify-center absolute z-20 gap-4">
               <div className="text-slate-400 font-medium tracking-widest text-sm uppercase">
                 Kamera Tidak Aktif
               </div>
               <button onClick={startCamera} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 transition-transform transform active:scale-95">
                 <Camera className="w-4 h-4" /> Hidupkan Semula
               </button>
             </div>
          ) : null}
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-contain" 
            playsInline muted 
            onPause={handleVideoPause}
            onPlay={handleVideoPlay}
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Snap overlay UI (Guides) */}
          {isStreaming && (
            <>
                <div className="absolute top-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
                <div className="bg-black/70 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full font-bold tracking-wider border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                    Fokuskan jawapan dan tekan "Snap"
                </div>
                </div>
                {/* Visual border hints - representing the crop area */}
                <div className="absolute top-[15%] bottom-[15%] left-[15%] right-[15%] border-2 border-indigo-400/80 border-dashed rounded-xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"></div>
            </>
          )}
        </div>
        
        <div className="p-5 bg-gradient-to-b from-indigo-50 to-white text-center border-t border-indigo-100 flex justify-center items-center">
            <button
              onClick={handleSnapAndAnalyze}
              disabled={!isStreaming || isAnalyzing}
              className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-black py-3.5 px-8 rounded-full shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 text-lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" /> Menganalisis Gambar...
                </>
              ) : (
                <>
                  <ScanLine className="w-6 h-6" /> Snap & Analisa Jawapan
                </>
              )}
            </button>
        </div>
      </div>
      
      {/* Captured Image Preview */}
      <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden flex flex-col">
          <div className="bg-indigo-50/50 px-5 py-4 border-b border-indigo-100 flex justify-between items-center">
              <h3 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-500" /> Paparan Imej AI
              </h3>
              {lastImage && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm border border-emerald-200"><CheckCircle className="w-3.5 h-3.5" /> Berjaya Diproses</span>}
          </div>
          <div className="p-4 flex-grow flex flex-col items-center justify-center bg-slate-50 min-h-[350px]">
              {lastImage ? (
                 <img src={lastImage} alt="Captured OMR" className="max-h-[450px] object-contain border border-indigo-100 rounded-xl shadow-lg ring-4 ring-white" />
              ) : (
                  <div className="text-slate-400 text-sm flex flex-col items-center gap-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-indigo-200" />
                      </div>
                      <p className="font-medium tracking-wide">Gambar penganalisaan akan dipaparkan di sini</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
