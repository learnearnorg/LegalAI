import React, { useState, useRef, useEffect } from 'react';
import { Network, FileText, Image as ImageIcon, MessageSquare, DollarSign, Plus, Link as LinkIcon, Trash2, LayoutGrid, Upload, Loader2, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import * as d3 from 'd3';
import { analyzeEvidenceForTags } from './geminiService';

interface EvidenceItem {
  id: string;
  title: string;
  type: 'document' | 'statement' | 'image' | 'financial';
  summary: string;
  tags?: string[];
  x: number;
  y: number;
}

interface EvidenceConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export const EvidenceBoard: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [items, setItems] = useState<EvidenceItem[]>([
    { id: '1', title: 'Exhibit A: Initial Contract', type: 'document', summary: 'Signed on Oct 12, contains generic non-compete clause.', x: 100, y: 100 },
    { id: '2', title: 'Witness Statement: J. Doe', type: 'statement', summary: 'Testified that the addendum was never discussed.', x: 400, y: 150 },
    { id: '3', title: 'Bank Transfer Records', type: 'financial', summary: 'Shows $50k transfer on Nov 4, post-dating signing.', x: 150, y: 350 },
  ]);
  
  const [connections, setConnections] = useState<EvidenceConnection[]>([
    { id: 'c1', from: '1', to: '2', label: 'Contradicts' },
    { id: 'c2', from: '1', to: '3', label: 'Payment linked' }
  ]);

  const [linkingFrom, setLinkingFrom] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [boardOffset, setBoardOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      setBoardOffset({ x: rect.left, y: rect.top });
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const buffer = await file.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      
      const analysis = await analyzeEvidenceForTags(file.name, base64Data, file.type);
      
      const newItem: EvidenceItem = {
        id: Date.now().toString(),
        title: file.name,
        type: analysis.type,
        summary: analysis.summary,
        tags: analysis.tags,
        x: boardRef.current ? boardRef.current.offsetWidth / 2 - 100 + (Math.random() * 40 - 20) : 200,
        y: boardRef.current ? boardRef.current.offsetHeight / 2 - 50 + (Math.random() * 40 - 20) : 200,
      };
      
      setItems(prev => [...prev, newItem]);
    } catch (error) {
      console.error("Failed to analyze file", error);
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragEnd = (id: string, info: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          x: item.x + info.offset.x,
          y: item.y + info.offset.y
        };
      }
      return item;
    }));
  };

  const handleItemClick = (id: string) => {
    if (linkingFrom) {
      if (linkingFrom !== id) {
        setConnections([...connections, { id: `c-${Date.now()}`, from: linkingFrom, to: id }]);
      }
      setLinkingFrom(null);
    }
  };

  const addItem = () => {
    const newItem: EvidenceItem = {
      id: Date.now().toString(),
      title: 'New Evidence',
      type: 'document',
      summary: 'Double click to edit. Drag to move.',
      x: boardRef.current ? boardRef.current.offsetWidth / 2 - 100 : 200,
      y: boardRef.current ? boardRef.current.offsetHeight / 2 - 50 : 200,
    };
    setItems([...items, newItem]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'statement': return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-amber-500" />;
      case 'financial': return <DollarSign className="w-4 h-4 text-green-500" />;
      default: return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const autoArrange = () => {
    if (!boardRef.current) return;
    
    const width = boardRef.current.offsetWidth;
    const height = boardRef.current.offsetHeight;
    
    const nodes = items.map(item => ({ id: item.id, x: item.x + 120, y: item.y + 60, item }));
    const links = connections.map(conn => ({ 
      source: conn.from, 
      target: conn.to,
      ...conn
    }));

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links as any).id((d: any) => d.id).distance(250))
      .force('charge', d3.forceManyBody().strength(-1500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(150))
      .stop();

    // Run simulation synchronously
    for (let i = 0; i < 300; ++i) simulation.tick();

    setItems(items.map((item) => {
      const node = nodes.find(n => n.id === item.id);
      if (!node) return item;
      return {
        ...item,
        x: Math.max(10, Math.min(width - 250, (node as any).x - 120)),
        y: Math.max(10, Math.min(height - 150, (node as any).y - 60)),
      };
    }));
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 space-y-6 max-w-[1400px] mx-auto w-full">
      <div className="flex items-end justify-between shrink-0 px-2">
        <div>
          <h3 className="text-3xl font-bold serif mb-2 flex items-center gap-3">
             <Network className="w-8 h-8 text-indigo-500" />
             Spatial Evidence Board
          </h3>
          <p className="text-slate-500 text-sm">Visually organize, map, and connect case evidence on an infinite canvas.</p>
        </div>
        <div className="flex gap-3">
           <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf,text/plain" />
           <button 
             onClick={() => fileInputRef.current?.click()}
             disabled={isAnalyzing}
             className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition"
           >
             {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} 
             {isAnalyzing ? 'Analyzing...' : 'Auto-Tag File'}
           </button>
           <button 
             onClick={autoArrange}
             className={`flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-xl font-bold text-[10px] uppercase tracking-widest transition border border-indigo-200 dark:border-indigo-800`}
           >
             <LayoutGrid className="w-4 h-4" /> Auto-Arrange
           </button>
           <button 
             onClick={addItem}
             className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition"
           >
             <Plus className="w-4 h-4" /> Add Evidence
           </button>
        </div>
      </div>

      <div 
        ref={boardRef}
        className={`flex-1 relative rounded-[2rem] border shadow-inner overflow-hidden ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'}`}
        style={{ 
          backgroundImage: isDarkMode 
            ? 'radial-gradient(#334155 1px, transparent 1px)' 
            : 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* SVG Connections Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {connections.map(conn => {
            const fromItem = items.find(i => i.id === conn.from);
            const toItem = items.find(i => i.id === conn.to);
            if (!fromItem || !toItem) return null;
            
            // simple straight line for now, connecting rough centers (cards are ~200px wide, ~100px tall)
            const x1 = fromItem.x + 120;
            const y1 = fromItem.y + 60;
            const x2 = toItem.x + 120;
            const y2 = toItem.y + 60;
            
            return (
              <g key={conn.id}>
                <line 
                  x1={x1} y1={y1} x2={x2} y2={y2} 
                  stroke={isDarkMode ? '#6366f1' : '#4f46e5'} 
                  strokeWidth="2" 
                  strokeDasharray="4 4"
                  className="opacity-50"
                />
                {conn.label && (
                   <text 
                     x={(x1 + x2) / 2} 
                     y={(y1 + y2) / 2 - 10} 
                     fill={isDarkMode ? '#a5b4fc' : '#4338ca'}
                     fontSize="10"
                     fontWeight="bold"
                     textAnchor="middle"
                     className="uppercase tracking-widest"
                   >
                     {conn.label}
                   </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Draggable Evidence Items */}
        {items.map(item => (
          <motion.div
            key={item.id}
            drag
            dragMomentum={false}
            onDragEnd={(e, info) => handleDragEnd(item.id, info)}
            initial={{ x: item.x, y: item.y }}
            animate={{ x: item.x, y: item.y }}
            className={`absolute z-10 w-60 p-4 rounded-2xl shadow-xl border cursor-grab active:cursor-grabbing backdrop-blur-md ${isDarkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-300'} ${linkingFrom === item.id ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
            onClick={() => handleItemClick(item.id)}
          >
            <div className="flex items-center justify-between mb-2 pb-2 border-b dark:border-slate-700 border-slate-200">
               <div className="flex items-center gap-2">
                 {getTypeIcon(item.type)}
                 <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">{item.type}</span>
               </div>
               <div className="flex gap-1">
                 <button 
                   onClick={(e) => { e.stopPropagation(); setLinkingFrom(linkingFrom === item.id ? null : item.id); }}
                   className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition ${linkingFrom === item.id ? 'text-indigo-500' : 'text-slate-400'}`}
                   title="Link"
                 >
                   <LinkIcon size={14} />
                 </button>
                 <button 
                   onClick={(e) => { 
                     e.stopPropagation(); 
                     setItems(items.filter(i => i.id !== item.id));
                     setConnections(connections.filter(c => c.from !== item.id && c.to !== item.id));
                   }}
                   className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition"
                   title="Delete"
                 >
                   <Trash2 size={14} />
                 </button>
               </div>
            </div>
            
            <h4 className="font-bold text-sm mb-1 leading-tight">{item.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{item.summary}</p>
          </motion.div>
        ))}

        {linkingFrom && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce">
            <LinkIcon size={14} /> Click another item to connect
            <button onClick={() => setLinkingFrom(null)} className="ml-2 bg-indigo-700 hover:bg-indigo-800 p-1 rounded-full"><Plus className="w-3 h-3 rotate-45" /></button>
          </div>
        )}
      </div>
    </div>
  );
};
