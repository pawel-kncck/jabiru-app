export interface FileMetadata {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  project_id: number;
}

export interface FilePreviewResponse {
  preview: {
    data: Record<string, any>[];
    columns: string[];
    preview_rows: number;
    total_rows: number;
  };
  metadata: {
    total_rows: number;
    total_columns: number;
    file_size_bytes: number;
    encoding: string;
    delimiter: string;
    columns: string[];
    column_types: Record<string, string>;
    has_missing_values: boolean;
    missing_values_per_column: Record<string, number>;
  };
}

export interface ColumnStatistics {
  data_type: string;
  total_values: number;
  missing_values: number;
  unique_values: number;
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
  top_values?: Record<string, number>;
}