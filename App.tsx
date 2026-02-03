
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { processPixelArt } from './services/geminiService';
import { ImageState, ProcessingHistory } from './types';

const STRENGTH_LABELS = [
  "High-Def (32-Bit)",
  "Balanced (16-Bit)",
  "Retro (8-Bit)",
  "Vintage (Atari)"
];

type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

const ASPECT_RATIOS: { label: string; value: AspectRatio }[] = [
  { label: "1:1", value: "1:1" },
  { label: "4:3", value: "4:3" },
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
  { label: "3:4", value: "3:4" },
];

const App: React.FC = () => {
  const [state, setState] = useState<ImageState>({
    originalUrl: null,
    processedUrl: null,
    base64: null,
    isLoading: false,
    error: null,
  });
  
  const [userPrompt, setUserPrompt] = useState('');
  const [strength, setStrength] = useState(2); 
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [useCrtEffect, setUseCrtEffect] = useState(true);
  const [history, setHistory] = useState<ProcessingHistory[]>([]);

  // Function to trigger the pixelation logic
  const startProcessing = useCallback(async (customBase64?: string, promptOverride?: string) => {
    const targetBase64 = customBase64 || state.base64;
    if (!targetBase64) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const resultUrl = await processPixelArt(
        targetBase64, 
        promptOverride || userPrompt,
        strength,
        aspectRatio
      );
      
      setState(prev => ({
        ...prev,
        processedUrl: resultUrl,
        isLoading: false,
      }));
      
      const newHistoryItem: ProcessingHistory = {
        prompt: promptOverride || userPrompt || `${STRENGTH_LABELS[strength - 1]} Conversion`,
        imageUrl: resultUrl,
        timestamp: Date.now(),
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
    } catch (err: any) {
      console.error("PixelGen Error:", err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "Engine failure. Please check your image format or connection.",
      }));
    }
  }, [state.base64, userPrompt, strength, aspectRatio]);

  // Handle image selection - now triggers auto-start
  const handleImageSelect = (base64: string, url: string) => {
    setState({
      originalUrl: url,
      processedUrl: null,
      base64: base64,
      isLoading: false,
      error: null,
    });
    // Small delay to ensure state is set before auto-starting
    setTimeout(() => {
      startProcessing(base64);
    }, 100);
  };

  const handleDownload = () => {
    if (!state.processedUrl) return;
    const link = document.createElement('a');
    link.href = state.processedUrl;
    link.download = `pixelgen-export-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setState({
      originalUrl: null,
      processedUrl: null,
      base64: null,
      isLoading: false,
      error: null,
    });
    setUserPrompt('');
    setStrength(2);
    setAspectRatio("1:1");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f1a]">
      <Header />

      <main className="flex-grow max-w-6xl mx-auto w-full p-4 md:p-8 space-y-12">
        {/* Empty State / Intro */}
        {!state.originalUrl && (
          <section className="text-center space-y-8 py-20">
            <div className="inline-block px-4 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              Hardware Accelerated v2.5
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter">
              BEYOND THE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">PIXEL LIMIT.</span>
            </h2>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium">
              Turn photographic data into high-quality game assets. 
              Authentic 8-bit aesthetic with zero anti-aliasing.
            </p>
            <div className="max-w-lg mx-auto pt-10">
              <ImageUploader onImageSelect={handleImageSelect} disabled={state.isLoading} />
            </div>
          </section>
        )}

        {/* Active Workspace */}
        {state.originalUrl && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Viewport Layer */}
            <div className="space-y-6">
              <div className="relative bg-black rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center bg-slate-900/90 backdrop-blur-md z-30 border-b border-white/5">
                   <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${state.isLoading ? 'bg-blue-500 animate-ping' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}></div>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
                       {state.isLoading ? 'Processing...' : 'Buffer: Valid'}
                     </span>
                   </div>
                   <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setUseCrtEffect(!useCrtEffect)}
                        className={`text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded transition-colors ${useCrtEffect ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 border border-slate-800'}`}
                      >
                        CRT
                      </button>
                      <button onClick={reset} className="text-[9px] font-black text-slate-500 hover:text-white transition-colors uppercase">Clear</button>
                   </div>
                </div>
                
                {/* Image Display */}
                <div className="aspect-square relative flex items-center justify-center bg-[#05070a]">
                  {useCrtEffect && state.processedUrl && !state.isLoading && <div className="crt-overlay"></div>}
                  
                  {state.isLoading ? (
                    <div className="flex flex-col items-center gap-8 p-12 w-full">
                        <div className="relative">
                          <div className="w-16 h-16 bg-blue-600 rounded flex items-center justify-center pixel-border animate-pulse shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                            <span className="text-white text-3xl">👾</span>
                          </div>
                        </div>
                        <div className="text-center space-y-3">
                            <p className="text-blue-400 font-black text-xs uppercase tracking-[0.3em] font-mono">Allocating Bits</p>
                            <div className="flex gap-1 justify-center">
                               <div className="w-1 h-1 bg-blue-500 animate-bounce delay-75"></div>
                               <div className="w-1 h-1 bg-blue-500 animate-bounce delay-150"></div>
                               <div className="w-1 h-1 bg-blue-500 animate-bounce delay-300"></div>
                            </div>
                        </div>
                    </div>
                  ) : state.processedUrl ? (
                    <div className="w-full h-full p-4 flex items-center justify-center">
                      <img 
                        src={state.processedUrl} 
                        className="max-w-full max-h-full object-contain pixel-rendering shadow-[0_0_40px_rgba(37,99,235,0.1)]" 
                        alt="Pixel Art Output" 
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-full p-8 group">
                      <img src={state.originalUrl} className="w-full h-full object-contain rounded opacity-30 grayscale blur-[2px]" alt="Original Preview" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Awaiting Signal</p>
                          <button 
                            onClick={() => startProcessing()}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest shadow-xl shadow-blue-500/20"
                          >
                            Initialize Engine
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {state.error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-400 shadow-xl">
                  <div className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded">HALT</div>
                  <p className="text-xs font-bold leading-relaxed">{state.error}</p>
                </div>
              )}
            </div>

            {/* Hardware Terminal */}
            <div className="space-y-8 sticky top-28">
              <div className="bg-[#0f1525] p-8 rounded-[2.5rem] border border-slate-800/50 space-y-10 shadow-3xl shadow-black/50">
                
                {/* Tier Selector */}
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Hardware Tier</label>
                    <span className="text-cyan-400 text-[9px] font-mono font-black bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20 uppercase tracking-[0.1em]">
                      {STRENGTH_LABELS[strength - 1]}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        onClick={() => setStrength(num)}
                        disabled={state.isLoading}
                        className={`py-3 rounded-xl border text-[10px] font-black transition-all ${strength === num ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30 scale-105' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                      >
                        T-{num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aspect Config */}
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Aspect Config</label>
                  <div className="flex flex-wrap gap-2">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.value}
                        disabled={state.isLoading}
                        onClick={() => setAspectRatio(ratio.value)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${
                          aspectRatio === ratio.value 
                            ? 'bg-slate-800 border-slate-600 text-white shadow-inner' 
                            : 'bg-transparent border-slate-800 text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Command Module */}
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Creative Overrides</label>
                  <div className="relative group">
                    <textarea
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        placeholder="Define style overrides (e.g. 'Cyberpunk', 'Snowy', 'Boss Battle')..."
                        className="w-full h-32 bg-slate-950/50 border border-slate-800 rounded-[1.5rem] p-5 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all placeholder:text-slate-700 text-xs font-bold font-mono tracking-tight"
                        disabled={state.isLoading}
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <button 
                            onClick={() => setUserPrompt('Hard Black Outlines')}
                            className="px-3 py-1 bg-slate-800/80 text-[8px] rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors text-slate-400 hover:text-white font-black uppercase"
                        >Outline</button>
                        <button 
                            onClick={() => setUserPrompt('Vibrant Neon')}
                            className="px-3 py-1 bg-slate-800/80 text-[8px] rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors text-slate-400 hover:text-white font-black uppercase"
                        >Neon</button>
                    </div>
                  </div>
                </div>

                {/* Execute Button */}
                <div className="flex flex-col gap-4 pt-2">
                  <button
                    onClick={() => startProcessing()}
                    disabled={state.isLoading || !state.base64}
                    className="w-full py-6 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 disabled:grayscale text-white font-black rounded-3xl transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-600/40 uppercase tracking-[0.2em] text-xs"
                  >
                    {state.isLoading ? 'Calculating...' : (state.processedUrl ? 'Regenerate Image' : 'Initialize Engine')}
                  </button>

                  {state.processedUrl && (
                    <button
                        onClick={handleDownload}
                        className="w-full py-4 px-8 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-2xl border border-slate-800 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.15em] hover:text-white"
                    >
                        Download Image 💾
                    </button>
                  )}
                </div>
              </div>

              {/* Memory History */}
              {history.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-2">VRAM Buffer (Recent)</h4>
                  <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
                    {history.map((item, idx) => (
                      <div key={idx} className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-900 hover:border-blue-500 transition-all cursor-pointer bg-slate-900 group shadow-lg">
                        <img 
                          src={item.imageUrl} 
                          className="w-full h-full object-cover pixel-rendering transition-transform group-hover:scale-110" 
                          alt="Recent result" 
                          onClick={() => setState(prev => ({...prev, processedUrl: item.imageUrl}))} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="py-16 px-4 border-t border-white/5 text-center">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Hardware: Gemini Flash Image // Engine: PixelGen 2.5</p>
           <div className="flex gap-6">
              <span className="text-[9px] font-black text-slate-600 uppercase">System Ready</span>
              <span className="text-[9px] font-black text-slate-600 uppercase">License: Free Tier</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
