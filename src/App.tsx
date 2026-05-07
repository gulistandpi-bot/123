/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Pencil, 
  Eraser, 
  Trash2, 
  Download, 
  Undo, 
  ExternalLink,
  Square, 
  Circle, 
  Type,
  Palette,
  Settings2,
  Battery,
  Wifi,
  Signal,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tool = 'pencil' | 'eraser' | 'rect' | 'circle' | 'text';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<Tool>('pencil');
  const [time, setTime] = useState(new Date());
  const [history, setHistory] = useState<string[]>([]);
  const [activeApp, setActiveApp] = useState<string | null>(null);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    contextRef.current = context;

    // Fill background white
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    saveToHistory();
  }, []);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      setHistory(prev => [...prev.slice(-19), canvas.toDataURL()]);
    }
  }, []);

  const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current) return;
    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    
    contextRef.current.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    contextRef.current.lineWidth = brushSize;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
    saveToHistory();
  };

  const getCoordinates = (event: any) => {
    if (event.touches) {
      const rect = canvasRef.current?.getBoundingClientRect();
      return {
        offsetX: event.touches[0].clientX - (rect?.left || 0),
        offsetY: event.touches[0].clientY - (rect?.top || 0)
      };
    }
    return {
      offsetX: event.offsetX,
      offsetY: event.offsetY
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.fillStyle = 'white';
      context.fillRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'planshet-rasm.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const undo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const lastState = newHistory[newHistory.length - 1];
    
    const img = new Image();
    img.src = lastState;
    img.onload = () => {
      contextRef.current?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      contextRef.current?.drawImage(img, 0, 0, canvasRef.current!.width / window.devicePixelRatio, canvasRef.current!.height / window.devicePixelRatio);
      setHistory(newHistory);
    };
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4 font-sans selection:bg-blue-100">
      {/* Tablet Frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-5xl aspect-[4/3] bg-neutral-800 rounded-[3rem] p-4 shadow-2xl border-8 border-neutral-700 overflow-hidden"
      >
        {/* Screen */}
        <div className="relative w-full h-full bg-white rounded-[2rem] overflow-hidden flex flex-col shadow-inner">
          
          {/* Status Bar */}
          <div className="h-8 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 text-xs font-medium text-neutral-600 z-10">
            <div className="flex items-center gap-4">
              <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <div className="flex items-center gap-1">
                <Signal size={12} />
                <span className="font-bold">UZTELECOM</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Wifi size={14} />
              <div className="flex items-center gap-1">
                <span>85%</span>
                <Battery size={14} className="rotate-90" />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 relative flex">
            {/* Sidebar Tools */}
            <div className="w-20 bg-neutral-50 border-r border-neutral-200 flex flex-col items-center py-6 gap-6 z-10">
              <ToolButton 
                active={tool === 'pencil'} 
                onClick={() => setTool('pencil')} 
                icon={<Pencil size={20} />} 
                label="Qalam"
              />
              <ToolButton 
                active={tool === 'eraser'} 
                onClick={() => setTool('eraser')} 
                icon={<Eraser size={20} />} 
                label="O'chirg'ich"
              />
              <div className="w-10 h-px bg-neutral-200 my-2" />
              <div className="flex flex-col items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm cursor-pointer transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  onClick={() => document.getElementById('color-picker')?.click()}
                />
                <input 
                  id="color-picker"
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                  className="sr-only"
                />
                <span className="text-[10px] uppercase font-bold text-neutral-400">Rang</span>
              </div>
              <div className="flex flex-col items-center gap-2 mt-auto">
                <ToolButton 
                  active={activeApp === 'game'} 
                  onClick={() => setActiveApp(activeApp === 'game' ? null : 'game')} 
                  icon={<ExternalLink size={20} />} 
                  label="O'yin"
                />
                <button 
                  onClick={undo}
                  className="p-3 rounded-xl hover:bg-neutral-200 text-neutral-600 transition-colors"
                >
                  <Undo size={20} />
                </button>
                <button 
                  onClick={clearCanvas}
                  className="p-3 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="flex-1 bg-white relative cursor-crosshair touch-none">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full block"
              />
              
              {/* Internal App Overlay */}
              <AnimatePresence>
                {activeApp === 'game' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 bg-white z-30 flex flex-col"
                  >
                    <div className="h-12 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between px-4">
                      <span className="text-sm font-bold text-neutral-600">Hayvonlar Mozaikasi</span>
                      <button 
                        onClick={() => setActiveApp(null)}
                        className="p-2 hover:bg-neutral-200 rounded-lg text-neutral-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <iframe 
                      src="https://drive.google.com/file/d/1usA8vkvz9UjzJTM4oRI9MzjSmRzZtExn/preview" 
                      className="flex-1 w-full border-none"
                      title="Game Content"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Floating Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg border border-neutral-200 z-20">
                <div className="flex items-center gap-3 pr-4 border-r border-neutral-200">
                  <span className="text-xs font-bold text-neutral-500 uppercase">Hajm</span>
                  <input 
                    type="range" 
                    min="1" 
                    max="50" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-32 accent-blue-600"
                  />
                  <span className="text-xs font-mono w-6 text-neutral-600">{brushSize}</span>
                </div>
                <button 
                  onClick={downloadImage}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all active:scale-95"
                >
                  <Download size={16} />
                  Saqlash
                </button>
              </div>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="h-6 flex items-center justify-center bg-white">
            <div className="w-32 h-1.5 bg-neutral-200 rounded-full" />
          </div>
        </div>

        {/* Physical Buttons Mockup */}
        <div className="absolute -right-2 top-24 w-1 h-12 bg-neutral-700 rounded-l-md" />
        <div className="absolute -right-2 top-40 w-1 h-20 bg-neutral-700 rounded-l-md" />
      </motion.div>

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(30,30,30,1)_0%,rgba(10,10,10,1)_100%)]" />
    </div>
  );
}

function ToolButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`
        group relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-200
        ${active ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600'}
      `}
    >
      {icon}
      <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="active-tool"
          className="absolute -left-1 top-1/4 bottom-1/4 w-1 bg-blue-600 rounded-full"
        />
      )}
    </button>
  );
}
