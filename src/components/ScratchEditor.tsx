import React, { useEffect, useRef, useState, useCallback } from 'react';

interface ScratchEditorProps {
  initialCode?: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  onExplainError?: (error: string) => void;
  projectData?: any; // SB3 project data to load directly
}

const ScratchEditor: React.FC<ScratchEditorProps> = ({
  initialCode,
  onChange,
  readOnly = false,
  onExplainError,
  projectData,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [projectLoaded, setProjectLoaded] = useState(false);

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

  const loadProject = useCallback((projectInput: string | any) => {
    // Reset projectLoaded - will be set true when PROJECT_LOADED message arrives
    setProjectLoaded(false);
    console.log('🔍 [DEBUG ScratchEditor] loadProject called with type:', typeof projectInput);

    // Safety timeout: if project doesn't load in 10s, hide the overlay anyway
    const safetyTimeout = setTimeout(() => {
      setProjectLoaded(prev => {
        if (!prev) {
          console.warn('🔍 [DEBUG ScratchEditor] Load timeout reached, forcing projectLoaded = true');
          return true;
        }
        return prev;
      });
    }, 10000);

    if (!iframeRef.current) {
      console.log('🔍 [DEBUG ScratchEditor] No iframe ref, returning');
      clearTimeout(safetyTimeout);
      return;
    }

    try {
      let project;
      if (typeof projectInput === 'string') {
        console.log('🔍 [DEBUG ScratchEditor] Parsing string input...');
        project = JSON.parse(projectInput);
        console.log('🔍 [DEBUG ScratchEditor] First parse result type:', typeof project);

        // Check if it's double-encoded (string containing escaped JSON)
        if (typeof project === 'string') {
          console.log('🔍 [DEBUG ScratchEditor] Result is still a string, trying double parse...');
          project = JSON.parse(project);
          console.log('🔍 [DEBUG ScratchEditor] Double parse successful');
        }
      } else {
        project = projectInput;
        console.log('🔍 [DEBUG ScratchEditor] Input is already an object');
      }

      // Validate project structure - must have targets array with at least a Stage
      if (!project.targets || !Array.isArray(project.targets) || project.targets.length === 0) {
        console.warn('🔍 [DEBUG ScratchEditor] Invalid project data (empty/missing targets), using default project');
        setProjectLoaded(true); // Let the default Scratch project be used
        return;
      }

      const hasStage = project.targets.some((t: any) => t.isStage === true);
      if (!hasStage) {
        console.warn('🔍 [DEBUG ScratchEditor] Invalid project data (no Stage target), using default project');
        setProjectLoaded(true);
        return;
      }

      console.log('🔍 [DEBUG ScratchEditor] Final project structure:', {
        hasTargets: !!project.targets,
        targetsLength: project.targets?.length,
        targetsDetails: project.targets?.map((t: any) => ({ name: t.name, isStage: t.isStage }))
      });

      const messageData = { type: 'LOAD_PROJECT', project };
      console.log('🔍 [DEBUG ScratchEditor] Sending LOAD_PROJECT message with project:', {
        type: 'LOAD_PROJECT',
        projectKeys: Object.keys(project),
        targetsCount: project.targets?.length,
        hasStage: project.targets?.some((t: any) => t.isStage),
        spritesCount: project.targets?.filter((t: any) => !t.isStage).length,
        iframeReady: !!iframeRef.current,
        contentWindowReady: !!iframeRef.current?.contentWindow
      });
      console.log('🔍 [DEBUG ScratchEditor] Full message data:', JSON.stringify(messageData).substring(0, 500) + '...');

      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(messageData, '*');
        console.log('🔍 [DEBUG ScratchEditor] LOAD_PROJECT message sent to iframe successfully');
      } else {
        console.error('🔍 [DEBUG ScratchEditor] Cannot send LOAD_PROJECT message - iframe contentWindow not available');
      }
    } catch (e) {
      console.error('🔍 [DEBUG ScratchEditor] Failed to parse projectInput as JSON:', e);
      // If it's a string that failed to parse as JSON, treat as project ID (legacy behavior)
      if (typeof projectInput === 'string') {
        console.log('🔍 [DEBUG ScratchEditor] Treating as project ID, fetching from API...');
        fetch(`https://api.scratch.mit.edu/projects/${projectInput}`)
          .then(res => res.json())
          .then(data => {
            console.log('🔍 [DEBUG ScratchEditor] Fetched project from API');
            iframeRef.current?.contentWindow?.postMessage({ type: 'LOAD_PROJECT', project: data }, '*');
          })
          .catch(err => onExplainErrorRef.current?.(`Failed to load project: ${err.message}`));
      } else {
        // If it's not a string, assume it's already project data
        console.log('🔍 [DEBUG ScratchEditor] Using as direct project data');
        iframeRef.current.contentWindow?.postMessage({ type: 'LOAD_PROJECT', project: projectInput }, '*');
      }
    }
  }, []);

  // Load Scratch GUI in iframe - only once on mount
  useEffect(() => {
    if (!iframeRef.current) return;
    iframeRef.current.src = '/scratch-editor.html';
  }, []);

  // Load project data when provided directly (e.g., from SB3 file)
  useEffect(() => {
    if (isLoaded && projectData && iframeRef.current) {
      loadProject(projectData);
    }
  }, [isLoaded, projectData, loadProject]);

  // Handle messages from Scratch iframe - stable listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Catch-all log for debugging
      if (event.data?.type) {
        console.log(`📬 [DEBUG ScratchEditor] Message received: ${event.data.type}`, {
          source: event.source === iframeRef.current?.contentWindow ? 'iframe' : 'other',
          data: event.data
        });
      }

      if (event.data?.type === 'SCRATCH_LOADED') {
        setIsLoaded(true);
        // Load project data if provided directly, otherwise use initialCode
        if (projectData) {
          console.log('🔍 [DEBUG ScratchEditor] Triggering loadProject from SCRATCH_LOADED (projectData)');
          loadProject(projectData);
        } else if (initialCodeRef.current && iframeRef.current) {
          const code = initialCodeRef.current;
          const isEmpty = code === '{}' || code === '' || (typeof code === 'object' && Object.keys(code).length === 0);

          if (!isEmpty) {
            console.log('🔍 [DEBUG ScratchEditor] Triggering loadProject from SCRATCH_LOADED (initialCode)');
            loadProject(code);
          } else {
            console.log('🔍 [DEBUG ScratchEditor] No project or empty project to load, using default');
            setProjectLoaded(true);
          }
        } else {
          // No project or empty project to load, use default Scratch project - mark as ready
          console.log('🔍 [DEBUG ScratchEditor] No project or empty project to load, using default');
          setProjectLoaded(true);
        }
      } else if (event.data?.type === 'SCRATCH_ERROR') {
        onExplainErrorRef.current?.(event.data.message);
      } else if (event.data?.type === 'SCRATCH_PROJECT_DATA') {
        const data = event.data.project;
        // VM usually returns string, but handle both for robustness
        const serialized = typeof data === 'string' ? data : JSON.stringify(data);
        onChangeRef.current?.(serialized);
      } else if (event.data?.type === 'PROJECT_LOADED') {
        console.log('🔍 [DEBUG ScratchEditor] PROJECT_LOADED received from iframe');
        setProjectLoaded(true);
      } else if (event.data?.type === 'PROJECT_LOAD_ERROR') {
        console.error('🔍 [DEBUG ScratchEditor] PROJECT_LOAD_ERROR:', event.data.error);
        // On load error, use default project
        setProjectLoaded(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loadProject, projectData]);

  // Auto-save periodically - only after project is fully loaded
  useEffect(() => {
    if (!projectLoaded) return;

    console.log('🔍 [DEBUG ScratchEditor] Starting auto-save interval (project loaded)');
    const interval = setInterval(() => {
      if (onChangeRef.current && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'GET_PROJECT' }, '*');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [projectLoaded]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {(!isLoaded || !projectLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-900 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
            <p className="text-sm text-slate-500">
              {!isLoaded ? 'Loading Scratch...' : 'Preparing Project...'}
            </p>
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
