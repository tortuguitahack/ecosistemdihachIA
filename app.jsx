import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Shield, Zap, CheckCircle, Cpu, Globe, ImageIcon, Loader2, Sparkles, 
  Rocket, Package, Database, Play, Square, Clock, Timer, Terminal
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

const BOT_TOKEN = "8796220586:AAGOPU17XVyep_-4mNdiWGf6ZDY9FKXBg58";
const CHAT_ID = "7374278145";
const apiKey = ""; 

const App = () => {
  const [autopilotActive, setAutopilotActive] = useState(false);
  const [logs, setLogs] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [generatedImg, setGeneratedImg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [marketingCopy, setMarketingCopy] = useState("");
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Mapeo de productos desde el MASTER.json (Precio forzado a 6.99)
  const masterProducts = useMemo(() => [
    { uid: "99bc72dc", title: "Apollo IA Workflow Premium 1000", description: "Flujo pasivo de IA" },
    { uid: "c9365082", title: "Digital Product 13 – IA Premium", description: "Servicio premium de automatización" },
    { uid: "prod_k921", title: "Ecosystem AI Agent v4", description: "Agentes autónomos de capa 7" },
    { uid: "prod_x001", title: "Cyber-Security Suite Yin", description: "Seguridad defensiva proactiva" }
  ].map(p => ({ ...p, price: 6.99 })), []);

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 12));
  };

  // --- MOTOR IA DE AUTOPILOTO ---
  const executeRotation = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const randomProduct = masterProducts[Math.floor(Math.random() * masterProducts.length)];
    setCurrentProduct(randomProduct);
    addLog(`🔄 ROTACIÓN: Seleccionado "${randomProduct.title}"`);

    try {
      // 1. Generar Arte Visual con IA
      addLog("🎨 Renderizando nueva creatividad visual...");
      const imgPrompt = `Futuristic 4k advertisement for ${randomProduct.title}, cyber technology style, neon indigo accents, minimalist.`;
      
      const imgRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instances: [{ prompt: imgPrompt }] })
      });
      
      const imgData = await imgRes.json();
      const b64 = imgData.predictions?.[0]?.bytesBase64Encoded;
      if (b64) {
        setGeneratedImg(`data:image/png;base64,${b64}`);
      }

      // 2. Generar Copy con Gemini para asegurar frescura
      const copyPrompt = `Escribe un copy de venta corto y explosivo para ${randomProduct.title} a solo $6.99. Enfoque tecnológico global.`;
      const copyRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: copyPrompt }] }] })
      });
      const copyData = await copyRes.json();
      const textResult = copyData.candidates?.[0]?.content?.parts?.[0]?.text || "Oferta exclusiva de IA activa.";
      setMarketingCopy(textResult);

      // 3. Publicación Global (Telegram)
      addLog("🚀 Difundiendo en Vercel, Stripe y Telegram...");
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: CHAT_ID, 
          text: `✨ *OFERTA GLOBAL ACTIVA*\n\n📦 *${randomProduct.title}*\n💰 Precio: $${randomProduct.price}\n📝 ${textResult.substring(0, 100)}...\n🌍 Disponible en 120 países.`,
          parse_mode: 'Markdown'
        })
      });

      addLog(`✅ PUBLICADO: ${randomProduct.title} está en vivo.`);
    } catch (e) {
      addLog("❌ Error en el ciclo de IA: " + e.message);
    }
    
    setIsProcessing(false);
    setTimeLeft(20 * 60); 
  };

  // Control del Ciclo
  useEffect(() => {
    if (autopilotActive) {
      executeRotation();
      timerRef.current = setInterval(executeRotation, 20 * 60 * 1000);
      countdownRef.current = setInterval(() => {
        setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      clearInterval(countdownRef.current);
      setTimeLeft(0);
    }
    return () => {
      clearInterval(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, [autopilotActive]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-mono p-6 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER SISTEMA */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-indigo-500/20 pb-10 gap-6">
          <div className="flex items-center gap-6">
            <div className={`p-5 rounded-3xl border transition-all duration-1000 ${autopilotActive ? 'bg-indigo-500/20 border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.4)] animate-pulse' : 'bg-slate-900 border-slate-800'}`}>
              <Cpu size={40} className={autopilotActive ? 'text-indigo-400' : 'text-slate-600'} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Leviatán <span className="text-indigo-500 underline">Autopilot</span></h1>
              <p className="text-[10px] text-indigo-400 font-bold tracking-[0.4em]">BUCLE DE VENTAS INFINITO 24/7</p>
            </div>
          </div>

          <button 
            onClick={() => setAutopilotActive(!autopilotActive)}
            className={`flex items-center gap-4 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${autopilotActive ? 'bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/20'}`}
          >
            {autopilotActive ? <><Square size={16}/> Detener Autopiloto</> : <><Play size={16}/> Activar Capa 7</>}
          </button>
        </div>

        {/* DASHBOARD CENTRAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* MONITOR DE ESTADO */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Siguiente Rotación</span>
                <Clock size={14} className="text-indigo-500" />
              </div>
              <div className="text-5xl font-black text-white tracking-tighter flex items-baseline gap-2">
                {formatTime(timeLeft)} <span className="text-xs text-slate-600 font-normal italic">min</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-1000" 
                  style={{ width: `${(timeLeft / (20 * 60)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-black border border-slate-800 rounded-[2.5rem] p-8 h-[350px] flex flex-col shadow-inner">
              <h3 className="text-[10px] font-black text-indigo-500 mb-6 flex items-center gap-2 uppercase">
                <Terminal size={14} /> Leviathan_Kernel_Output
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide text-[9px]">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-3 opacity-80 border-l border-indigo-500/20 pl-3">
                    <span className={log.includes('✅') ? 'text-green-400' : 'text-slate-400'}>{log}</span>
                  </div>
                ))}
                {logs.length === 0 && <p className="text-slate-700 italic">Esperando inicialización...</p>}
              </div>
            </div>
          </div>

          {/* VISTA PREVIA DE PUBLICACIÓN ACTUAL */}
          <div className="lg:col-span-8">
            <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] p-10 h-full flex flex-col relative overflow-hidden">
              {autopilotActive ? (
                <div className="space-y-8 animate-in fade-in duration-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Producto en Difusión</span>
                      <h2 className="text-2xl font-black text-white mt-2">{currentProduct?.title || "Sincronizando..."}</h2>
                    </div>
                    <div className="text-right">
                       <p className="text-3xl font-black text-green-400 tracking-tighter">$6.99</p>
                       <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Precio Global</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                    <div className="rounded-[2rem] border border-white/5 bg-black overflow-hidden aspect-square relative">
                      {generatedImg ? (
                        <img src={generatedImg} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-800">
                           <ImageIcon size={48} />
                           <p className="text-[10px] font-bold uppercase">Renderizando Arte...</p>
                        </div>
                      )}
                      {isProcessing && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center">
                           <Loader2 className="animate-spin text-indigo-400" size={40} />
                        </div>
                      )}
                    </div>
                    <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 flex flex-col">
                       <p className="text-[10px] font-black text-indigo-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                         <Sparkles size={12}/> Estrategia Gemini
                       </p>
                       <div className="flex-1 overflow-y-auto">
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                          {marketingCopy || "Sincronizando estrategia de mercado para este activo digital..."}
                        </p>
                       </div>
                       <div className="mt-auto pt-6 flex gap-2">
                          <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[8px] font-bold text-indigo-400">GLOBAL_PUSH</div>
                          <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[8px] font-bold text-green-400">LIVE_SALE</div>
                       </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                   <Rocket size={80} strokeWidth={1} className="mb-6" />
                   <p className="text-xs font-black uppercase tracking-[0.5em]">Sistema en Standby</p>
                   <p className="text-[10px] mt-4 italic">Activa el Autopiloto para iniciar la inundación de mercado</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* STATS DE RED */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           <StatBox label="Nodos" val="10/10" />
           <StatBox label="Alcance" val="120 Países" />
           <StatBox label="Frecuencia" val="20 min" />
           <StatBox label="Estatus" val={autopilotActive ? "AUTÓNOMO" : "OFFLINE"} />
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, val }) => (
  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-bold text-white uppercase">{val}</p>
  </div>
);

export default App;
