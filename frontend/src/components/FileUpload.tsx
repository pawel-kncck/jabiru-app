import React, { useState, useRef, DragEvent } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { filesService } from '../services/files';

interface FileUploadProps {
  projectId: number;
  onFileSelect: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number;
}

export function FileUpload({
  projectId,
  onFileSelect,
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
    setUploadProgress(0);

    try {
      await onFileSelect(file);
      setIsUploading(false);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 500);
    } catch (err) {
      const errorMessage =
        (err as any)?.response?.data?.detail ||
        (err as Error).message ||
        'Upload failed';
      setError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
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
    <Box>
      <Box
        sx={{
          border: 2,
          borderStyle: 'dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          backgroundColor: isDragging ? 'action.hover' : 'transparent',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
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
          <Box>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1">
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        ) : (
          <>
            <CloudUploadIcon
              sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="body1" sx={{ mb: 1 }}>
              Drag and drop your files here, or click to browse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: {accept} • Maximum size:{' '}
              {(maxSize / 1024 / 1024).toFixed(0)}MB
            </Typography>
          </>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
