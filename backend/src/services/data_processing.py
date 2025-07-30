import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import chardet
from datetime import datetime


class DataProcessingService:
    PREVIEW_ROWS = 100
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB for processing
    
    @staticmethod
    def detect_encoding(file_path: Path) -> str:
        with open(file_path, 'rb') as file:
            raw_data = file.read(10000)
            result = chardet.detect(raw_data)
            return result['encoding'] or 'utf-8'
    
    @staticmethod
    def detect_column_types(df: pd.DataFrame) -> Dict[str, str]:
        column_types = {}
        
        for column in df.columns:
            col_data = df[column].dropna()
            
            if col_data.empty:
                column_types[column] = 'unknown'
                continue
            
            # Try to convert to numeric
            try:
                pd.to_numeric(col_data, errors='raise')
                if col_data.dtype == 'int64' or (col_data == col_data.astype(int)).all():
                    column_types[column] = 'integer'
                else:
                    column_types[column] = 'float'
                continue
            except (ValueError, TypeError):
                pass
            
            # Try to convert to datetime
            try:
                pd.to_datetime(col_data, errors='raise')
                column_types[column] = 'datetime'
                continue
            except (ValueError, TypeError):
                pass
            
            # Check if boolean
            unique_values = col_data.unique()
            if len(unique_values) <= 2 and all(
                str(val).lower() in ['true', 'false', '1', '0', 'yes', 'no', 't', 'f']
                for val in unique_values
            ):
                column_types[column] = 'boolean'
                continue
            
            # Default to string
            column_types[column] = 'string'
        
        return column_types
    
    @staticmethod
    def parse_csv_file(
        file_path: Path,
        encoding: Optional[str] = None,
        delimiter: Optional[str] = None
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        
        if not encoding:
            encoding = DataProcessingService.detect_encoding(file_path)
        
        # Try different delimiters if not specified
        delimiters_to_try = [delimiter] if delimiter else [',', ';', '\t', '|']
        
        for delim in delimiters_to_try:
            try:
                df = pd.read_csv(
                    file_path,
                    encoding=encoding,
                    delimiter=delim,
                    on_bad_lines='skip',
                    low_memory=False
                )
                
                # If we got a reasonable number of columns, assume it's correct
                if len(df.columns) > 1 or delimiter:
                    break
                    
            except Exception:
                continue
        else:
            # If all delimiters failed, use comma as default
            df = pd.read_csv(
                file_path,
                encoding=encoding,
                delimiter=',',
                on_bad_lines='skip',
                low_memory=False
            )
        
        metadata = {
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'file_size_bytes': file_path.stat().st_size,
            'encoding': encoding,
            'delimiter': delim,
            'columns': list(df.columns),
            'column_types': DataProcessingService.detect_column_types(df),
            'memory_usage_bytes': df.memory_usage(deep=True).sum(),
            'has_missing_values': df.isnull().any().any(),
            'missing_values_per_column': df.isnull().sum().to_dict()
        }
        
        return df, metadata
    
    @staticmethod
    def get_data_preview(
        df: pd.DataFrame,
        rows: int = PREVIEW_ROWS
    ) -> Dict[str, Any]:
        preview_df = df.head(rows)
        
        # Convert DataFrame to dictionary format for JSON serialization
        preview_data = []
        for _, row in preview_df.iterrows():
            row_dict = {}
            for col in preview_df.columns:
                value = row[col]
                # Handle special types
                if pd.isna(value):
                    row_dict[col] = None
                elif isinstance(value, (np.integer, np.floating)):
                    row_dict[col] = float(value) if np.isnan(value) else value.item()
                elif isinstance(value, np.bool_):
                    row_dict[col] = bool(value)
                elif isinstance(value, pd.Timestamp):
                    row_dict[col] = value.isoformat()
                else:
                    row_dict[col] = str(value)
            preview_data.append(row_dict)
        
        return {
            'data': preview_data,
            'columns': list(df.columns),
            'preview_rows': len(preview_data),
            'total_rows': len(df)
        }
    
    @staticmethod
    def get_column_statistics(df: pd.DataFrame, column: str) -> Dict[str, Any]:
        if column not in df.columns:
            raise ValueError(f"Column '{column}' not found in dataframe")
        
        col_data = df[column]
        stats = {
            'column': column,
            'total_values': len(col_data),
            'missing_values': int(col_data.isnull().sum()),
            'unique_values': int(col_data.nunique()),
            'data_type': str(col_data.dtype)
        }
        
        # For numeric columns
        if pd.api.types.is_numeric_dtype(col_data):
            stats.update({
                'mean': float(col_data.mean()) if not col_data.empty else None,
                'median': float(col_data.median()) if not col_data.empty else None,
                'std': float(col_data.std()) if not col_data.empty else None,
                'min': float(col_data.min()) if not col_data.empty else None,
                'max': float(col_data.max()) if not col_data.empty else None,
                'quartiles': {
                    'q1': float(col_data.quantile(0.25)) if not col_data.empty else None,
                    'q2': float(col_data.quantile(0.5)) if not col_data.empty else None,
                    'q3': float(col_data.quantile(0.75)) if not col_data.empty else None
                }
            })
        
        # For categorical columns
        else:
            value_counts = col_data.value_counts()
            top_values = value_counts.head(10).to_dict()
            stats.update({
                'top_values': {str(k): int(v) for k, v in top_values.items()},
                'mode': str(col_data.mode().iloc[0]) if not col_data.mode().empty else None
            })
        
        return stats