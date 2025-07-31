import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CloudUpload as CloudUploadIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { filesService } from '../../services/files';
import { FileMetadata } from '../../types/file';
import { FileUpload } from '../FileUpload';
import { DataPreview } from '../DataPreview';

interface DataStudioTabProps {
  projectId: number;
}

export const DataStudioTab: React.FC<DataStudioTabProps> = ({ projectId }) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileMetadata | null>(null);
  const [uploadKey, setUploadKey] = useState(0);

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await filesService.getProjectFiles(projectId);
      setFiles(response.data);
    } catch (error) {
      console.error('Failed to load files:', error);
      setError('Failed to load files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      await filesService.uploadFile(file, projectId);
      await loadFiles();
      setUploadKey(prev => prev + 1);
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      await filesService.deleteFile(fileId);
      await loadFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
      setError('Failed to delete file. Please try again.');
    }
  };

  const handlePreviewFile = (file: FileMetadata) => {
    setPreviewFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      {/* Upload Section */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: 'background.paper',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Upload Data Files
        </Typography>
        <FileUpload
          key={uploadKey}
          onFileSelect={handleFileUpload}
          projectId={projectId}
          accept=".csv,.tsv,.txt,.json"
          maxSize={100 * 1024 * 1024}
        />
      </Paper>

      {/* Files List */}
      <Paper
        sx={{
          flex: 1,
          backgroundColor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Project Files</Typography>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : files.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              p: 3,
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" align="center">
              No files uploaded yet. Upload your first data file to get started.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ flex: 1 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Size</TableCell>
                  <TableCell>Uploaded</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FileIcon fontSize="small" color="action" />
                        <Typography variant="body2">{file.filename}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={file.file_type.toUpperCase()}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatFileSize(file.file_size)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(file.uploaded_at), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handlePreviewFile(file)}
                        sx={{ mr: 1 }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteFile(file.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
        maxWidth="lg"
        fullWidth
      >
        {previewFile && (
          <DataPreview
            fileId={previewFile.id}
            onClose={() => setPreviewFile(null)}
          />
        )}
      </Dialog>
    </Box>
  );
};