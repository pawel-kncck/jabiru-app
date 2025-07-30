import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import tempfile
import os

from src.services.data_processing import DataProcessingService


class TestDataProcessingService:
    
    @pytest.fixture
    def sample_csv_file(self):
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write("name,age,salary,hired_date,is_active\n")
            f.write("John Doe,30,50000.50,2023-01-15,true\n")
            f.write("Jane Smith,25,45000.00,2023-02-20,false\n")
            f.write("Bob Johnson,35,60000.75,2022-12-01,true\n")
            f.write("Alice Brown,,55000.00,2023-03-10,true\n")
            f.write("Charlie Wilson,40,70000.00,2021-06-15,false\n")
            temp_path = f.name
        
        yield Path(temp_path)
        os.unlink(temp_path)
    
    @pytest.fixture
    def sample_csv_semicolon(self):
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write("product;price;quantity\n")
            f.write("Apple;1.50;100\n")
            f.write("Banana;0.75;150\n")
            f.write("Orange;2.00;80\n")
            temp_path = f.name
        
        yield Path(temp_path)
        os.unlink(temp_path)
    
    def test_detect_encoding(self, sample_csv_file):
        encoding = DataProcessingService.detect_encoding(sample_csv_file)
        assert encoding in ['utf-8', 'ascii', 'UTF-8', 'ASCII']
    
    def test_detect_column_types(self):
        df = pd.DataFrame({
            'integers': [1, 2, 3, 4, 5],
            'floats': [1.1, 2.2, 3.3, 4.4, 5.5],
            'strings': ['a', 'b', 'c', 'd', 'e'],
            'dates': pd.to_datetime(['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05']),
            'booleans': [True, False, True, False, True],
            'mixed': [1, 'two', 3.0, '4', 5]
        })
        
        column_types = DataProcessingService.detect_column_types(df)
        
        assert column_types['integers'] == 'integer'
        assert column_types['floats'] == 'float'
        assert column_types['strings'] == 'string'
        assert column_types['dates'] == 'datetime'
        assert column_types['booleans'] == 'boolean'
        assert column_types['mixed'] == 'string'
    
    def test_parse_csv_file(self, sample_csv_file):
        df, metadata = DataProcessingService.parse_csv_file(sample_csv_file)
        
        assert len(df) == 5
        assert len(df.columns) == 5
        assert metadata['total_rows'] == 5
        assert metadata['total_columns'] == 5
        assert 'name' in metadata['columns']
        assert 'age' in metadata['columns']
        assert metadata['delimiter'] == ','
        assert metadata['has_missing_values'] is True
        assert metadata['missing_values_per_column']['age'] == 1
    
    def test_parse_csv_file_with_semicolon(self, sample_csv_semicolon):
        df, metadata = DataProcessingService.parse_csv_file(sample_csv_semicolon)
        
        assert len(df) == 3
        assert len(df.columns) == 3
        assert metadata['delimiter'] == ';'
        assert 'product' in metadata['columns']
        assert 'price' in metadata['columns']
        assert 'quantity' in metadata['columns']
    
    def test_get_data_preview(self, sample_csv_file):
        df, _ = DataProcessingService.parse_csv_file(sample_csv_file)
        preview = DataProcessingService.get_data_preview(df, rows=3)
        
        assert len(preview['data']) == 3
        assert preview['preview_rows'] == 3
        assert preview['total_rows'] == 5
        assert preview['columns'] == ['name', 'age', 'salary', 'hired_date', 'is_active']
        
        first_row = preview['data'][0]
        assert first_row['name'] == 'John Doe'
        assert first_row['age'] == 30
        assert first_row['salary'] == 50000.5
    
    def test_get_column_statistics_numeric(self, sample_csv_file):
        df, _ = DataProcessingService.parse_csv_file(sample_csv_file)
        
        # Test numeric column
        stats = DataProcessingService.get_column_statistics(df, 'salary')
        
        assert stats['column'] == 'salary'
        assert stats['total_values'] == 5
        assert stats['missing_values'] == 0
        assert stats['unique_values'] == 5
        assert 'mean' in stats
        assert 'median' in stats
        assert 'std' in stats
        assert 'min' in stats
        assert 'max' in stats
        assert 'quartiles' in stats
        
        assert stats['min'] == 45000.0
        assert stats['max'] == 70000.0
    
    def test_get_column_statistics_categorical(self, sample_csv_file):
        df, _ = DataProcessingService.parse_csv_file(sample_csv_file)
        
        # Test categorical column
        stats = DataProcessingService.get_column_statistics(df, 'name')
        
        assert stats['column'] == 'name'
        assert stats['total_values'] == 5
        assert stats['missing_values'] == 0
        assert stats['unique_values'] == 5
        assert 'top_values' in stats
        assert 'mode' in stats
        assert len(stats['top_values']) == 5
    
    def test_get_column_statistics_with_missing(self, sample_csv_file):
        df, _ = DataProcessingService.parse_csv_file(sample_csv_file)
        
        # Test column with missing values
        stats = DataProcessingService.get_column_statistics(df, 'age')
        
        assert stats['missing_values'] == 1
        assert stats['total_values'] == 5
    
    def test_get_column_statistics_invalid_column(self, sample_csv_file):
        df, _ = DataProcessingService.parse_csv_file(sample_csv_file)
        
        with pytest.raises(ValueError, match="Column 'invalid_column' not found"):
            DataProcessingService.get_column_statistics(df, 'invalid_column')
    
    def test_handle_special_types(self):
        # Test handling of numpy types and special values
        df = pd.DataFrame({
            'col1': [1, 2, np.nan, 4, 5],
            'col2': [True, False, True, False, True],
            'col3': pd.to_datetime(['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05'])
        })
        
        preview = DataProcessingService.get_data_preview(df, rows=5)
        
        # Check NaN handling
        assert preview['data'][2]['col1'] is None
        
        # Check boolean handling
        assert preview['data'][0]['col2'] is True
        assert preview['data'][1]['col2'] is False
        
        # Check datetime handling
        assert '2023-01-01' in preview['data'][0]['col3']