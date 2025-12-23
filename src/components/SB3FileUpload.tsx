import React, { useRef, useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { processSB3File, SB3ProjectData } from '../services/sb3FileProcessor';

interface SB3FileUploadProps {
  onProjectLoaded: (projectData: SB3ProjectData) => void;
  onError: (error: string) => void;
  isLoading?: boolean;
}

const SB3FileUpload: React.FC<SB3FileUploadProps> = ({
  onProjectLoaded,
  onError,
  isLoading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.sb3')) {
      onError('Please select a .sb3 file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      onError('File size must be less than 50MB');
      return;
    }

    try {
      const projectData = await processSB3File(file);
      onProjectLoaded(projectData);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to process file');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload Scratch Project</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${dragActive
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${isLoading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {isLoading ? 'Processing...' : 'Drop your .sb3 file here, or click to browse'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Supports Scratch 3.0 project files (.sb3)
              </p>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".sb3"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={handleButtonClick}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : 'Choose File'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SB3FileUpload;
