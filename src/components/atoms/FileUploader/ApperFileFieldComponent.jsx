import { useState, useRef, useEffect, useMemo } from 'react';

const ApperFileFieldComponent = ({ elementId, config }) => {
  // State for UI-driven values
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for tracking lifecycle and preventing memory leaks
  const mountedRef = useRef(false);
  const elementIdRef = useRef(elementId);
  const existingFilesRef = useRef([]);
  
  // Update elementIdRef when elementId changes
  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);
  
  // Memoize existingFiles to prevent re-renders and detect actual changes
  const memoizedExistingFiles = useMemo(() => {
    if (!config.existingFiles || !Array.isArray(config.existingFiles)) {
      return [];
    }
    return config.existingFiles;
  }, [config.existingFiles?.length, config.existingFiles?.[0]?.Id || config.existingFiles?.[0]?.id]);
  
  // Initial Mount Effect
  useEffect(() => {
    let mounted = true;
    
    const initializeSDK = async () => {
      try {
        // Initialize ApperSDK: 50 attempts × 100ms
        let attempts = 0;
        while (attempts < 50 && (!window.ApperSDK || !window.ApperSDK.ApperFileUploader)) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.ApperSDK || !window.ApperSDK.ApperFileUploader) {
          throw new Error('ApperSDK not loaded. Please ensure the SDK script is included before this component.');
        }
        
        const { ApperFileUploader } = window.ApperSDK;
        elementIdRef.current = `file-uploader-${elementId}`;
        
await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: memoizedExistingFiles,
          acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml'],
          enablePreview: true // Enable image previews
        });
        
        if (mounted) {
          mountedRef.current = true;
          setIsReady(true);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setIsReady(false);
        }
      }
    };
    
    initializeSDK();
    
    // Cleanup on component destruction
    return () => {
      mounted = false;
      try {
        if (mountedRef.current && window.ApperSDK?.ApperFileUploader) {
          window.ApperSDK.ApperFileUploader.FileField.unmount(elementIdRef.current);
        }
        mountedRef.current = false;
        setIsReady(false);
      } catch (err) {
        console.error('Error during unmount:', err);
      }
    };
}, [elementId, config.fieldKey, config.tableName, config.apperProjectId, config.apperPublicKey, config.supportedExtensions]);
  
  // File Update Effect
  useEffect(() => {
    if (!isReady || !window.ApperSDK?.ApperFileUploader || !config.fieldKey) {
      return;
    }
    
    // Deep equality check with JSON.stringify
    const currentFiles = JSON.stringify(existingFilesRef.current);
    const newFiles = JSON.stringify(memoizedExistingFiles);
    
    if (currentFiles === newFiles) {
      return;
    }
    
    const updateFiles = async () => {
      try {
        const { ApperFileUploader } = window.ApperSDK;
        
        // Format detection: check for .Id vs .id property
        let filesToUpdate = memoizedExistingFiles;
        if (filesToUpdate.length > 0 && filesToUpdate[0].Id && !filesToUpdate[0].id) {
          // Convert API format to UI format
          filesToUpdate = ApperFileUploader.toUIFormat(filesToUpdate);
        }
        
        if (filesToUpdate.length > 0) {
          await ApperFileUploader.FileField.updateFiles(config.fieldKey, filesToUpdate);
        } else {
          await ApperFileUploader.FileField.clearField(config.fieldKey);
        }
        
        existingFilesRef.current = [...memoizedExistingFiles];
      } catch (err) {
        setError(`Error updating files: ${err.message}`);
      }
    };
    
    updateFiles();
  }, [memoizedExistingFiles, isReady, config.fieldKey]);
  
  // Error UI
  if (error) {
    return (
      <div className="border-2 border-dashed border-error-300 rounded-lg p-4">
        <div className="text-error-600 text-sm font-medium">File Upload Error</div>
        <div className="text-error-500 text-sm mt-1">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Attach Files
      </label>
      <div 
        id={`file-uploader-${elementId}`}
        className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-primary-400 transition-colors"
      >
        {!isReady && (
          <div className="flex items-center justify-center py-4">
            <div className="text-slate-500 text-sm">Loading file uploader...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApperFileFieldComponent;