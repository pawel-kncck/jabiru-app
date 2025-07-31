import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import { projectsService } from '../../services/projects';
import { Project } from '../../types/project';
import { DataStudioTab } from './DataStudioTab';
import { ContextTab } from './ContextTab';
import { ChatTab } from './ChatTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      sx={{ height: '100%' }}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </Box>
  );
};

export const ProjectView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsService.getProject(Number(projectId));
      setProject(response.data);
    } catch (error) {
      console.error('Failed to load project:', error);
      setError('Failed to load project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Project not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {project.name}
          </Typography>
          {project.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {project.description}
            </Typography>
          )}
        </Box>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            px: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              minHeight: 48,
            },
          }}
        >
          <Tab label="Data Studio" />
          <Tab label="Context" />
          <Tab label="Chat" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <TabPanel value={activeTab} index={0}>
          <DataStudioTab projectId={project.id} />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <ContextTab projectId={project.id} />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <ChatTab projectId={project.id} />
        </TabPanel>
      </Box>
    </Box>
  );
};