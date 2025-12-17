import React, { useEffect, useRef, useState } from 'react';

interface ScratchEditorProps {
  initialCode?: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  onExplainError?: (error: string) => void;
}

const ScratchEditor: React.FC<ScratchEditorProps> = ({
  initialCode,
  onChange,
  readOnly = false,
  onExplainError,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Scratch GUI in iframe
  useEffect(() => {
    if (!iframeRef.current) return;
    iframeRef.current.src = '/scratch-editor.html';
  }, []);

  // Handle messages from Scratch iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SCRATCH_LOADED') {
        setIsLoaded(true);
        if (initialCode && iframeRef.current) {
          loadProject(initialCode);
        }
      } else if (event.data?.type === 'SCRATCH_ERROR') {
        onExplainError?.(event.data.message);
      } else if (event.data?.type === 'SCRATCH_PROJECT_DATA') {
        onChange?.(JSON.stringify(event.data.project));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [initialCode, onChange, onExplainError]);

  const loadProject = (projectData: string) => {
    if (!iframeRef.current || !isLoaded) return;
    try {
      const project = typeof projectData === 'string' ? JSON.parse(projectData) : projectData;
      iframeRef.current.contentWindow?.postMessage({ type: 'LOAD_PROJECT', project }, '*');
    } catch (e) {
      // Treat as project ID
      fetch(`https://api.scratch.mit.edu/projects/${projectData}`)
        .then(res => res.json())
        .then(data => {
          iframeRef.current?.contentWindow?.postMessage({ type: 'LOAD_PROJECT', project: data }, '*');
        })
        .catch(err => onExplainError?.(`Failed to load project: ${err.message}`));
    }
  };

  // Auto-save periodically
  useEffect(() => {
    if (!isLoaded || !onChange) return;
    const interval = setInterval(() => {
      iframeRef.current?.contentWindow?.postMessage({ type: 'GET_PROJECT' }, '*');
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoaded, onChange]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
            <p className="text-sm text-slate-500">Loading Scratch...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="w-full h-full border-none"
        title="Scratch Editor"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals"
        allow="microphone; camera; serial; usb; bluetooth"
        scrolling="no"
        style={{ overflow: 'hidden' }}
      />
    </div>
  );
};

export default ScratchEditor;
