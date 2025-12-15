import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlay, FaStop, FaGear, FaChevronRight, FaChevronDown, FaWandMagicSparkles, FaEraser, FaBolt, FaXmark, FaBook, FaAngleLeft } from 'react-icons/fa6';
import { Button } from './ui/Button';

interface P5EditorProps {
  initialCode: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  onExplainSelection?: (selection: string) => void;
  onExplainError?: (error: string) => void;
  lessonTitle?: string;
}

const CHEAT_SHEET = [
  {
    category: 'Shapes',
    items: [
      { label: 'Circle', code: 'circle(200, 200, 50);' },
      { label: 'Rectangle', code: 'rect(100, 100, 50, 50);' },
      { label: 'Line', code: 'line(0, 0, 400, 400);' },
      { label: 'Ellipse', code: 'ellipse(200, 200, 60, 40);' },
      { label: 'Triangle', code: 'triangle(200, 100, 150, 300, 250, 300);' },
    ]
  },
  {
    category: 'Color & Style',
    items: [
      { label: 'Fill Color', code: 'fill(255, 0, 0);' },
      { label: 'No Fill', code: 'noFill();' },
      { label: 'Stroke Color', code: 'stroke(0, 0, 255);' },
      { label: 'No Stroke', code: 'noStroke();' },
      { label: 'Stroke Size', code: 'strokeWeight(4);' },
      { label: 'Background', code: 'background(220);' },
    ]
  },
  {
    category: 'Logic & Loops',
    items: [
      { label: 'If Statement', code: 'if (mouseX > 200) {\n  \n}' },
      { label: 'Else', code: 'else {\n  \n}' },
      { label: 'For Loop', code: 'for (let i = 0; i < 10; i++) {\n  \n}' },
      { label: 'Variable', code: 'let myVar = 0;' },
    ]
  },
  {
    category: 'Interaction',
    items: [
      { label: 'Mouse X', code: 'mouseX' },
      { label: 'Mouse Y', code: 'mouseY' },
      { label: 'Mouse Pressed?', code: 'if (mouseIsPressed) {\n  \n}' },
      { label: 'Random', code: 'random(0, 100)' },
      { label: 'Distance', code: 'dist(x1, y1, x2, y2)' },
    ]
  }
];

const P5Editor: React.FC<P5EditorProps> = ({ 
  initialCode, 
  onChange, 
  readOnly = false,
  onExplainSelection,
  onExplainError,
  lessonTitle = "Untitled Sketch"
}) => {
  const [code, setCode] = useState(initialCode);
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectionRange, setSelectionRange] = useState<{start: number, end: number} | null>(null);
  const [showExplainTooltip, setShowExplainTooltip] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync props to state
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  // Generate the iframe HTML content
  const generateIframeContent = useCallback((userCode: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
          <style>
            body { margin: 0; overflow: hidden; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f0f0; }
            canvas { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          </style>
        </head>
        <body>
          <script>
            // Capture console logs
            const originalLog = console.log;
            const originalError = console.error;
            
            function sendLog(type, args) {
                const message = Array.from(args).map(arg => String(arg)).join(' ');
                window.parent.postMessage({ type: 'console', level: type, message: message }, '*');
            }

            console.log = function(...args) {
                sendLog('log', args);
                originalLog.apply(console, args);
            };

            console.error = function(...args) {
                sendLog('error', args);
                originalError.apply(console, args);
            };

            // Catch global errors
            window.onerror = function(msg, url, lineNo, columnNo, error) {
              sendLog('error', [msg + ' (Line ' + lineNo + ')']);
              return false;
            };
            
            try {
              ${userCode}
            } catch (e) {
              console.error(e.message);
            }
          </script>
        </body>
      </html>
    `;
  }, []);

  // Handle messages from iframe (console logs)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'console') {
            setLogs(prev => [...prev, `[${event.data.level.toUpperCase()}] ${event.data.message}`]);
            setConsoleOpen(true); // Auto open on log
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auto-run on mount
  useEffect(() => {
    handleRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleRun = () => {
    setLogs([]); // Clear logs on run
    const src = generateIframeContent(code);
    const blob = new Blob([src], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setIframeSrc(url);
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIframeSrc(''); // Clear iframe
    setIsPlaying(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    const newCode = e.target.value;
    setCode(newCode);
    if (onChange) onChange(newCode);
    if (autoRefresh) {
        // Debounce could be added here
        handleRun();
    }
  };

  const handleSelect = () => {
    if (!textareaRef.current || readOnly) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    if (start !== end) {
        setSelectionRange({ start, end });
        setShowExplainTooltip(true);
    } else {
        setShowExplainTooltip(false);
    }
  };

  const triggerExplain = () => {
    if (!selectionRange || !textareaRef.current || !onExplainSelection) return;
    const selectedText = code.substring(selectionRange.start, selectionRange.end);
    onExplainSelection(selectedText);
    setShowExplainTooltip(false);
  };

  const insertCode = (snippet: string) => {
    if (!textareaRef.current || readOnly) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newCode = code.substring(0, start) + snippet + code.substring(end);
    setCode(newCode);
    if (onChange) onChange(newCode);
    
    // Defer focus slightly to ensure DOM update
    setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + snippet.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Line Numbers
  const lineNumbers = code.split('\n').map((_, i) => i + 1);

  return (
    <div id="p5-editor-container" className="flex flex-col h-full w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-sm overflow-hidden font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        textarea::-webkit-scrollbar, .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        textarea, .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      
      {/* Header / Toolbar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-2 flex items-center justify-between h-14 flex-shrink-0">
         <div className="flex items-center gap-4">
            <div id="editor-controls" className="flex gap-1 items-center">
                 <button 
                   onClick={handleRun}
                   className="w-10 h-10 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white shadow-sm transition-transform active:scale-95"
                   title="Play"
                 >
                    {isPlaying ? <FaPlay className="text-sm ml-1" /> : <FaPlay className="text-sm ml-1" />}
                 </button>
                 <button 
                   onClick={handleStop}
                   className="w-10 h-10 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 flex items-center justify-center text-slate-600 transition-colors"
                   title="Stop"
                 >
                    <FaStop />
                 </button>
            </div>
            <div className="flex items-center gap-2 ml-2">
                <input 
                    type="checkbox" 
                    id="autoref" 
                    checked={autoRefresh} 
                    onChange={(e) => setAutoRefresh(e.target.checked)} 
                    className="rounded border-slate-300 text-pink-500 focus:ring-pink-500 bg-white dark:bg-slate-700 dark:border-slate-600"
                />
                <label htmlFor="autoref" className="text-xs text-slate-500 dark:text-slate-400 font-medium cursor-pointer select-none">Auto-refresh</label>
            </div>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
            
            <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{lessonTitle}</span>
                <span className="text-[10px] text-slate-400">by CanvasClassroom</span>
            </div>
         </div>
         
         <div className="flex items-center gap-3 pr-2">
            <button 
                id="cheat-sheet-btn"
                onClick={() => setShowCheatSheet(!showCheatSheet)}
                className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-md transition-all ${showCheatSheet ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:ring-indigo-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}
                title="Toggle Cheat Sheet"
            >
                <FaBook /> Cheat Sheet
            </button>
            <span className="hidden md:inline-block bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                p5.js v1.9.0
            </span>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <FaGear />
            </button>
         </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
          
          {/* Code Column Group */}
          <div className="flex-1 flex min-w-0 bg-white dark:bg-slate-900">
             
             {/* Cheat Sheet Sidebar */}
             <div 
                className={`border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${showCheatSheet ? 'w-48 opacity-100' : 'w-0 opacity-0'}`}
             >
                 <div className="p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                     <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Helpers</span>
                     <button onClick={() => setShowCheatSheet(false)} className="text-slate-400 hover:text-slate-600"><FaAngleLeft/></button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-2 space-y-4 no-scrollbar">
                     {CHEAT_SHEET.map((cat, i) => (
                         <div key={i}>
                             <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 pl-1">{cat.category}</h4>
                             <div className="space-y-1">
                                 {cat.items.map((item, j) => (
                                     <button
                                        key={j}
                                        onClick={() => insertCode(item.code)}
                                        className="w-full text-left px-2 py-1.5 text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:shadow-sm transition-all truncate"
                                        title={item.code}
                                     >
                                         {item.label}
                                     </button>
                                 ))}
                             </div>
                         </div>
                     ))}
                 </div>
             </div>

             {/* Editor */}
             <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 min-w-0 relative group">
                {/* Tabs */}
                <div className="flex bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <div className="px-4 py-2 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 border-t-2 border-t-pink-500">
                        sketch.js
                    </div>
                    <div className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-600 cursor-not-allowed">
                        index.html
                    </div>
                    <div className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-600 cursor-not-allowed">
                        style.css
                    </div>
                </div>

                {/* Editor Area */}
                <div id="code-area" className="flex-1 flex overflow-hidden relative">
                    {/* Floating AI Tooltip */}
                    {showExplainTooltip && !readOnly && (
                        <div className="absolute z-20 top-4 right-4 animate-in fade-in zoom-in-95">
                            <button 
                                onClick={triggerExplain}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl hover:scale-105 transition-all"
                            >
                                <FaWandMagicSparkles /> Explain Selection
                            </button>
                        </div>
                    )}

                    {/* Line Numbers */}
                    <div className="bg-slate-50 dark:bg-slate-900 text-slate-400 text-right pr-2 pl-1 py-4 text-xs font-mono select-none border-r border-slate-100 dark:border-slate-800 min-w-[2rem]">
                        {lineNumbers.map(n => (
                            <div key={n} className="h-5 leading-5">{n}</div>
                        ))}
                    </div>

                    {/* Textarea */}
                    <textarea 
                        ref={textareaRef}
                        className={`flex-1 resize-none p-0 pl-2 py-4 outline-none font-mono text-sm leading-5 whitespace-pre w-full 
                            ${readOnly ? 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-500' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200'}
                        `}
                        value={code}
                        onChange={handleChange}
                        onSelect={handleSelect}
                        readOnly={readOnly}
                        spellCheck={false}
                        wrap="off"
                    />
                </div>

                {/* Console Drawer */}
                <div className={`bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col ${consoleOpen ? 'h-40' : 'h-8'} flex-shrink-0`}>
                    <div 
                        className="flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 h-8"
                        onClick={() => setConsoleOpen(!consoleOpen)}
                    >
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                            {consoleOpen ? <FaChevronDown /> : <FaChevronRight />}
                            Console
                        </div>
                        <div 
                            className="text-xs text-slate-500 hover:text-red-500 px-2"
                            onClick={(e) => { e.stopPropagation(); setLogs([]); }}
                        >
                            <FaEraser title="Clear Console" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 font-mono text-xs bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 space-y-1 no-scrollbar">
                        {logs.length === 0 && <div className="text-slate-300 dark:text-slate-600 italic">Console is empty</div>}
                        {logs.map((log, i) => {
                            const isError = log.includes('[ERROR]');
                            return (
                                <div key={i} className={`flex items-start justify-between group ${isError ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                    <span>{log}</span>
                                    {isError && onExplainError && (
                                        <button 
                                            onClick={() => onExplainError(log)}
                                            className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                                        >
                                            <FaWandMagicSparkles /> Fix?
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
             </div>
          </div>

          {/* Preview Column */}
          <div className="flex-1 bg-slate-200 dark:bg-slate-950 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                  {!iframeSrc && <div className="text-slate-400 dark:text-slate-600 font-medium">Press Play to start</div>}
              </div>
              {iframeSrc && (
                  <iframe 
                    src={iframeSrc} 
                    className="w-full h-full border-none bg-white shadow-sm"
                    title="Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
              )}
              
              {/* Overlay mockup elements from screenshot */}
              {isPlaying && (
                <>
                   <div className="absolute bottom-4 left-4 pointer-events-none opacity-50">
                       <div className="border-l-2 border-b-2 border-black dark:border-slate-500 w-16 h-16 relative">
                           <span className="absolute -top-2 -left-3 font-bold text-xs text-slate-900 dark:text-slate-300">+y</span>
                           <span className="absolute -bottom-2 -right-3 font-bold text-xs text-slate-900 dark:text-slate-300">+x</span>
                       </div>
                   </div>
                </>
              )}
          </div>
      </div>
    </div>
  );
};

export default P5Editor;