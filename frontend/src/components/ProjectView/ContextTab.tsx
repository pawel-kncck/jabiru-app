import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { projectsService } from '../../services/projects';

interface ContextTabProps {
  projectId: number;
}

export const ContextTab: React.FC<ContextTabProps> = ({ projectId }) => {
  const [context, setContext] = useState('');
  const [originalContext, setOriginalContext] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadContext();
  }, [projectId]);

  const loadContext = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with actual context API call when backend endpoint is ready
      const response = await projectsService.getProject(projectId);
      const projectContext = response.data.context || '';
      setContext(projectContext);
      setOriginalContext(projectContext);
    } catch (error) {
      console.error('Failed to load context:', error);
      setError('Failed to load project context. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContext = async () => {
    try {
      setSaving(true);
      setError(null);
      // TODO: Replace with actual context save API call when backend endpoint is ready
      await projectsService.updateProject(projectId, { context });
      setOriginalContext(context);
      setSuccessMessage('Context saved successfully!');
    } catch (error) {
      console.error('Failed to save context:', error);
      setError('Failed to save context. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = context !== originalContext;

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Paper
        sx={{
          flex: 1,
          p: 3,
          backgroundColor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Project Context
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Provide context about your project, data, and business objectives. This information
            will help the AI understand your specific needs and provide more relevant insights.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          multiline
          fullWidth
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Describe your project, data, and business objectives here. For example:

• What is the purpose of this project?
• What kind of data are you working with?
• What are the key business questions you want to answer?
• Are there any specific metrics or KPIs you're tracking?
• What is the expected outcome or goal?

The more context you provide, the better the AI can assist you with your analysis."
          sx={{
            flex: 1,
            '& .MuiInputBase-root': {
              height: '100%',
              alignItems: 'flex-start',
            },
            '& .MuiInputBase-input': {
              height: '100% !important',
              overflow: 'auto !important',
            },
          }}
          InputProps={{
            sx: {
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            },
          }}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {context.length} characters
          </Typography>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveContext}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Saving...' : 'Save Context'}
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};