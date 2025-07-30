import React, { useState, useEffect } from 'react';
import { filesService } from '../services/files';
import './DataPreview.css';

interface DataPreviewProps {
  fileId: string;
  onClose: () => void;
}

interface PreviewData {
  data: Record<string, any>[];
  columns: string[];
  preview_rows: number;
  total_rows: number;
}

interface FileMetadata {
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
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
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
        return '🔢';
      case 'string':
        return '📝';
      case 'datetime':
        return '📅';
      case 'boolean':
        return '✓✗';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="data-preview-modal">
        <div className="data-preview-content">
          <div className="loading">Loading preview...</div>
        </div>
      </div>
    );
  }

  if (error || !preview || !metadata) {
    return (
      <div className="data-preview-modal">
        <div className="data-preview-content">
          <div className="preview-header">
            <h2>Data Preview</h2>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
          <div className="error">{error || 'No data available'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="data-preview-modal">
      <div className="data-preview-content">
        <div className="preview-header">
          <h2>Data Preview</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="metadata-section">
          <h3>File Information</h3>
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="label">Total Rows:</span>
              <span className="value">{metadata.total_rows.toLocaleString()}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Total Columns:</span>
              <span className="value">{metadata.total_columns}</span>
            </div>
            <div className="metadata-item">
              <span className="label">File Size:</span>
              <span className="value">{filesService.formatFileSize(metadata.file_size_bytes)}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Encoding:</span>
              <span className="value">{metadata.encoding}</span>
            </div>
            <div className="metadata-item">
              <span className="label">Delimiter:</span>
              <span className="value">"{metadata.delimiter}"</span>
            </div>
            <div className="metadata-item">
              <span className="label">Has Missing Values:</span>
              <span className="value">{metadata.has_missing_values ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h3>Data Preview (First {preview.preview_rows} rows)</h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {preview.columns.map((column) => (
                    <th 
                      key={column}
                      onClick={() => loadColumnStats(column)}
                      className="clickable-header"
                    >
                      <div className="column-header">
                        <span className="column-type-icon">
                          {getColumnTypeIcon(metadata.column_types[column])}
                        </span>
                        <span className="column-name">{column}</span>
                        {metadata.missing_values_per_column[column] > 0 && (
                          <span className="missing-indicator" title={`${metadata.missing_values_per_column[column]} missing values`}>
                            ⚠️
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.data.map((row, index) => (
                  <tr key={index}>
                    {preview.columns.map((column) => (
                      <td key={column} className={row[column] === null ? 'null-value' : ''}>
                        {row[column] === null ? 'NULL' : String(row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedColumn && columnStats && (
          <div className="stats-section">
            <h3>Column Statistics: {selectedColumn}</h3>
            {loadingStats ? (
              <div className="loading">Loading statistics...</div>
            ) : (
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="label">Data Type:</span>
                  <span className="value">{columnStats.data_type}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Total Values:</span>
                  <span className="value">{columnStats.total_values.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Missing Values:</span>
                  <span className="value">{columnStats.missing_values.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Unique Values:</span>
                  <span className="value">{columnStats.unique_values.toLocaleString()}</span>
                </div>

                {columnStats.mean !== undefined && (
                  <>
                    <div className="stat-item">
                      <span className="label">Mean:</span>
                      <span className="value">{columnStats.mean?.toFixed(2)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Median:</span>
                      <span className="value">{columnStats.median?.toFixed(2)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Min:</span>
                      <span className="value">{columnStats.min?.toFixed(2)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="label">Max:</span>
                      <span className="value">{columnStats.max?.toFixed(2)}</span>
                    </div>
                  </>
                )}

                {columnStats.top_values && (
                  <div className="top-values">
                    <h4>Top Values:</h4>
                    <div className="top-values-list">
                      {Object.entries(columnStats.top_values).map(([value, count]) => (
                        <div key={value} className="top-value-item">
                          <span className="value-text">{value}:</span>
                          <span className="value-count">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}