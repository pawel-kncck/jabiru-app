import React, { useState, useRef, DragEvent } from 'react';
import { filesService } from '../services/files';
import './FileUpload.css';

interface FileUploadProps {
  projectId: string;
  onUploadSuccess: () => void;
  accept?: string;
  maxSize?: number;
}

export function FileUpload({
  projectId,
  onUploadSuccess,
  accept = '.csv',
  maxSize = 10 * 1024 * 1024, // 10MB
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const allowedExtensions = accept.split(',').map((ext) => ext.trim());
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;

    if (!allowedExtensions.includes(fileExtension)) {
      return `File type not allowed. Please upload ${allowedExtensions.join(
        ', '
      )} files only.`;
    }

    if (file.size > maxSize) {
      return `File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(
        0
      )}MB.`;
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);

    try {
      // Use the filesService to upload the file
      await filesService.uploadFile(projectId, file);

      setTimeout(() => {
        setIsUploading(false);
        onUploadSuccess();
      }, 500);
    } catch (err) {
      // getErrorMessage is not exported from api.ts, so we'll handle it simply
      const errorMessage =
        (err as any)?.response?.data?.detail ||
        (err as Error).message ||
        'Upload failed';
      setError(errorMessage);
      setIsUploading(false);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-dropzone ${isDragging ? 'dragging' : ''} ${
          isUploading ? 'uploading' : ''
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {isUploading ? (
          <div className="upload-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p>Uploading... {uploadProgress}%</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <p className="upload-text">
              Drag and drop your CSV file here, or click to browse
            </p>
            <p className="upload-hint">
              Maximum file size: {(maxSize / 1024 / 1024).toFixed(0)}MB
            </p>
          </>
        )}
      </div>

      {error && <div className="upload-error">⚠️ {error}</div>}
    </div>
  );
}
