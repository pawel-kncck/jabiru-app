import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  DialogTitle,
  DialogContent,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Numbers as NumbersIcon,
  TextFields as TextIcon,
  CalendarMonth as DateIcon,
  CheckBox as BooleanIcon,
  Help as UnknownIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { filesService } from '../services/files';

interface DataPreviewProps {
  fileId: number;
  onClose: () => void;
}

interface PreviewData {
  data: Record<string, any>[];
  columns: string[];
  preview_rows: number;
  total_rows: number;
}

interface FilePreviewMetadata {
  total_rows: number;
  total_columns: number;
  file_size_bytes: number;
  encoding: string;
  delimiter: string;
  columns: string[];
  column_types: Record<string, string>;
  has_missing_values: boolean;
  missing_values_per_column: Record<string, number>;
}

export function DataPreview({ fileId, onClose }: DataPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [metadata, setMetadata] = useState<FilePreviewMetadata | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [columnStats, setColumnStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    loadPreview();
  }, [fileId]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await filesService.getFilePreview(fileId);
      setPreview(response.preview);
      setMetadata(response.metadata);
    } catch (err) {
      setError('Failed to load file preview');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadColumnStats = async (column: string) => {
    try {
      setLoadingStats(true);
      setSelectedColumn(column);
      const stats = await filesService.getColumnStatistics(fileId, column);
      setColumnStats(stats);
    } catch (err) {
      console.error('Failed to load column statistics:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const getColumnTypeIcon = (type: string) => {
    switch (type) {
      case 'integer':
      case 'float':
        return <NumbersIcon fontSize="small" />;
      case 'string':
        return <TextIcon fontSize="small" />;
      case 'datetime':
        return <DateIcon fontSize="small" />;
      case 'boolean':
        return <BooleanIcon fontSize="small" />;
      default:
        return <UnknownIcon fontSize="small" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading preview...</Typography>
      </Box>
    );
  }

  if (error || !preview || !metadata) {
    return (
      <Box sx={{ p: 3 }}>
        <DialogTitle sx={{ p: 0, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Data Preview</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Alert severity="error">{error || 'No data available'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Data Preview</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, pt: 0 }}>
        {/* File Information */}
        <Paper sx={{ p: 2, mb: 3, backgroundColor: 'background.default' }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            File Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant="body2" color="text.secondary">Total Rows</Typography>
              <Typography variant="body1">{metadata.total_rows.toLocaleString()}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant="body2" color="text.secondary">Total Columns</Typography>
              <Typography variant="body1">{metadata.total_columns}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant="body2" color="text.secondary">File Size</Typography>
              <Typography variant="body1">{formatFileSize(metadata.file_size_bytes)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant="body2" color="text.secondary">Encoding</Typography>
              <Typography variant="body1">{metadata.encoding}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant="body2" color="text.secondary">Delimiter</Typography>
              <Typography variant="body1">"{metadata.delimiter}"</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Typography variant="body2" color="text.secondary">Has Missing Values</Typography>
              <Typography variant="body1">{metadata.has_missing_values ? 'Yes' : 'No'}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Data Preview */}
        <Paper sx={{ mb: 3, backgroundColor: 'background.default' }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Data Preview (First {preview.preview_rows} rows)
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {preview.columns.map((column) => (
                    <TableCell
                      key={column}
                      onClick={() => loadColumnStats(column)}
                      sx={{
                        cursor: 'pointer',
                        backgroundColor: 'background.paper',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getColumnTypeIcon(metadata.column_types[column])}
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {column}
                        </Typography>
                        {metadata.missing_values_per_column[column] > 0 && (
                          <Tooltip title={`${metadata.missing_values_per_column[column]} missing values`}>
                            <WarningIcon fontSize="small" color="warning" />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {preview.data.map((row, index) => (
                  <TableRow key={index} hover>
                    {preview.columns.map((column) => (
                      <TableCell key={column}>
                        {row[column] === null ? (
                          <Typography variant="body2" color="text.disabled">
                            NULL
                          </Typography>
                        ) : (
                          <Typography variant="body2">{String(row[column])}</Typography>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Column Statistics */}
        {selectedColumn && columnStats && (
          <Paper sx={{ p: 2, backgroundColor: 'background.default' }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Column Statistics: {selectedColumn}
            </Typography>
            {loadingStats ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">Data Type</Typography>
                    <Typography variant="body1">{columnStats.data_type}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">Total Values</Typography>
                    <Typography variant="body1">{columnStats.total_values.toLocaleString()}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">Missing Values</Typography>
                    <Typography variant="body1">{columnStats.missing_values.toLocaleString()}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Typography variant="body2" color="text.secondary">Unique Values</Typography>
                    <Typography variant="body1">{columnStats.unique_values.toLocaleString()}</Typography>
                  </Grid>
                </Grid>

                {columnStats.mean !== undefined && (
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">Mean</Typography>
                      <Typography variant="body1">{columnStats.mean?.toFixed(2)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">Median</Typography>
                      <Typography variant="body1">{columnStats.median?.toFixed(2)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">Min</Typography>
                      <Typography variant="body1">{columnStats.min?.toFixed(2)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Typography variant="body2" color="text.secondary">Max</Typography>
                      <Typography variant="body1">{columnStats.max?.toFixed(2)}</Typography>
                    </Grid>
                  </Grid>
                )}

                {columnStats.top_values && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Top Values
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {Object.entries(columnStats.top_values).map(([value, count]) => (
                        <Chip
                          key={value}
                          label={`${value}: ${count}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </Paper>
        )}
      </DialogContent>
    </Box>
  );
}