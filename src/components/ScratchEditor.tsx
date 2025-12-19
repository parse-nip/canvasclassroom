import React, { useEffect, useRef, useState, useCallback } from 'react';

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
  
  // Use refs to store latest callback values to avoid effect re-runs
  const onChangeRef = useRef(onChange);
  const onExplainErrorRef = useRef(onExplainError);
  const initialCodeRef = useRef(initialCode);
  
  // Update refs when props change
  useEffect(() => {
    onChangeRef.current = onChange;
    onExplainErrorRef.current = onExplainError;
    initialCodeRef.current = initialCode;
  }, [onChange, onExplainError, initialCode]);

  const loadProject = useCallback((projectData: string) => {
    if (!iframeRef.current) return;
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
        .catch(err => onExplainErrorRef.current?.(`Failed to load project: ${err.message}`));
    }
  }, []);

  // Load Scratch GUI in iframe - only once on mount
  useEffect(() => {
    if (!iframeRef.current) return;
    iframeRef.current.src = '/scratch-editor.html';
  }, []);

  // Handle messages from Scratch iframe - stable listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SCRATCH_LOADED') {
        setIsLoaded(true);
        if (initialCodeRef.current && iframeRef.current) {
          loadProject(initialCodeRef.current);
        }
      } else if (event.data?.type === 'SCRATCH_ERROR') {
        onExplainErrorRef.current?.(event.data.message);
      } else if (event.data?.type === 'SCRATCH_PROJECT_DATA') {
        onChangeRef.current?.(JSON.stringify(event.data.project));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loadProject]);

  // Auto-save periodically - stable interval
  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      if (onChangeRef.current) {
        iframeRef.current?.contentWindow?.postMessage({ type: 'GET_PROJECT' }, '*');
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoaded]);

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
        allow="microphone; camera; serial; usb; bluetooth"
      />
    </div>
  );
};

export default ScratchEditor;
