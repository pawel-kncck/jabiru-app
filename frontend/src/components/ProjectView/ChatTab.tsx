import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Send as SendIcon,
  ContentCopy as CopyIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
} from '@mui/icons-material';
import { chatService } from '../../services/chat';
import type { ChatMessage } from '../../services/chat';

interface Message extends ChatMessage {
  id: string;
  timestamp: Date;
  isCode?: boolean;
  codeLanguage?: string;
}

interface ChatTabProps {
  projectId: number;
}

export const ChatTab: React.FC<ChatTabProps> = ({ projectId }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m ready to help you analyze your data. You can ask me questions about your uploaded files, request specific analyses, or explore patterns in your data. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    const messageContent = inputValue; // Store the content before clearing
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Prepare conversation history (without the current message)
      const conversationHistory: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Send message to backend
      const response = await chatService.sendMessage(projectId, {
        message: messageContent,
        conversation_history: conversationHistory,
      });

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Show cost if available
      if (response.cost) {
        setSuccessMessage(`Response generated (cost: $${response.cost.toFixed(4)})`);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.response?.data?.detail || 'Failed to send message. Please try again.');
      
      // Remove the user message on error
      setMessages((prev) => prev.filter(msg => msg.id !== userMessage.id));
      setInputValue(messageContent); // Restore the input with the correct content
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyCode = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';

    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        <Avatar
          sx={{
            bgcolor: isUser ? 'primary.main' : 'secondary.main',
            width: 36,
            height: 36,
          }}
        >
          {isUser ? <PersonIcon /> : <BotIcon />}
        </Avatar>
        <Box
          sx={{
            flex: 1,
            maxWidth: '70%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isUser ? 'flex-end' : 'flex-start',
          }}
        >
          <Box
            sx={{
              backgroundColor: isUser ? 'primary.dark' : 'background.paper',
              p: 2,
              borderRadius: 2,
              border: 1,
              borderColor: isUser ? 'primary.main' : 'divider',
            }}
          >
            {message.isCode ? (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Chip
                    label={message.codeLanguage || 'code'}
                    size="small"
                    variant="outlined"
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleCopyCode(message.content)}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2,
                    backgroundColor: 'background.default',
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                  }}
                >
                  <code>{message.content}</code>
                </Box>
              </Box>
            ) : (
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {message.content}
              </Typography>
            )}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, px: 1 }}
          >
            {message.timestamp.toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map(renderMessage)}
        {isLoading && (
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
              <BotIcon />
            </Avatar>
            <Box
              sx={{
                backgroundColor: 'background.paper',
                p: 2,
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
              }}
            >
              <CircularProgress size={20} />
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Paper
        sx={{
          p: 2,
          m: 3,
          mt: 0,
          backgroundColor: 'background.paper',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your data..."
            inputRef={inputRef}
            disabled={isLoading}
            sx={{
              '& .MuiInputBase-root': {
                p: 0,
              },
              '& .MuiInputBase-input': {
                p: 1.5,
              },
              '& fieldset': {
                border: 'none',
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&:disabled': {
                bgcolor: 'action.disabledBackground',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1 }}
        >
          Press Enter to send, Shift+Enter for new line
        </Typography>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="info"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};