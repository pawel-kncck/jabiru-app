import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { projectsService } from '../../services/projects';
import type { Project } from '../../types/project';

interface SidebarProps {
  onProjectCreate?: () => void;
}

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 65;

export const Sidebar: React.FC<SidebarProps> = ({ onProjectCreate }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const currentProjectId = location.pathname.match(/\/project\/(\d+)/)?.[1];

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsService.getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleProjectClick = (projectId: number) => {
    navigate(`/project/${projectId}`);
  };

  const handleNewProject = () => {
    if (onProjectCreate) {
      onProjectCreate();
    } else {
      navigate('/projects');
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box
      sx={{
        width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        height: '100vh',
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        borderRight: 1,
        borderColor: 'divider',
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2 }}>
        {isCollapsed ? (
          <Tooltip title="New Project" placement="right">
            <IconButton
              onClick={handleNewProject}
              sx={{
                width: '100%',
                borderRadius: 1,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewProject}
            sx={{
              justifyContent: 'flex-start',
              px: 2,
            }}
          >
            New Project
          </Button>
        )}
      </Box>

      {/* Projects List */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <List sx={{ px: 1, overflow: 'auto', height: '100%' }}>
            {projects.map((project) => (
              <ListItem key={project.id} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip
                  title={isCollapsed ? project.name : ''}
                  placement="right"
                  disableHoverListener={!isCollapsed}
                >
                  <ListItemButton
                    selected={currentProjectId === String(project.id)}
                    onClick={() => handleProjectClick(project.id)}
                    sx={{
                      borderRadius: 1,
                      minHeight: 40,
                      px: isCollapsed ? 1.5 : 2,
                    }}
                  >
                    {isCollapsed ? (
                      <Typography
                        variant="body2"
                        sx={{
                          width: '100%',
                          textAlign: 'center',
                          fontWeight: 500,
                        }}
                      >
                        {project.name.slice(0, 2).toUpperCase()}
                      </Typography>
                    ) : (
                      <ListItemText
                        primary={project.name}
                        primaryTypographyProps={{
                          noWrap: true,
                          fontSize: '0.875rem',
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      <Box>
        <Divider />
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
          }}
        >
          {isCollapsed ? (
            <Tooltip title={user?.name || 'User'} placement="right">
              <Avatar sx={{ width: 36, height: 36 }}>
                {getUserInitials()}
              </Avatar>
            </Tooltip>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36 }}>
                  {getUserInitials()}
                </Avatar>
                <Typography variant="body2" noWrap sx={{ maxWidth: 140 }}>
                  {user?.name || 'User'}
                </Typography>
              </Box>
              <IconButton size="small">
                <SettingsIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      {/* Collapse Toggle */}
      <IconButton
        onClick={handleToggle}
        sx={{
          position: 'absolute',
          right: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          width: 32,
          height: 32,
          '&:hover': {
            backgroundColor: 'background.default',
          },
        }}
      >
        {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </IconButton>
    </Box>
  );
};
