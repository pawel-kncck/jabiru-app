import { useState } from 'react';
import { Send, Bot, User, Plus, Mic } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatTab() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for data analysis. I can help you understand your data, create visualizations, and generate insights. What would you like to explore today?',
      timestamp: new Date(),
    },
    {
      id: '2',
      role: 'user',
      content: 'Can you analyze the customer data I uploaded and identify the top customer segments?',
      timestamp: new Date(),
    },
    {
      id: '3',
      role: 'assistant',
      content: 'I\'ve analyzed your customer data and identified several key segments:\n\n1. **High-Value Urban Customers** (30-45 years old, major cities)\n   - Average spend: $2,500/year\n   - Prefer premium products\n   - High brand loyalty\n\n2. **Young Professionals** (25-35 years old)\n   - Tech-savvy\n   - Price-sensitive but quality-conscious\n   - Active on social media\n\n3. **Family Shoppers** (35-50 years old)\n   - Bulk purchases\n   - Value-oriented\n   - Seasonal buying patterns\n\nWould you like me to dive deeper into any of these segments?',
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand your question. Let me analyze that for you... [This is a mock response. In a real application, this would be connected to an AI model that would provide actual analysis based on your data.]',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 pb-32 space-y-6">
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'user' ? (
                  /* User message - right aligned bubble */
                  <div className="flex justify-end">
                    <div className="max-w-[80%]">
                      <div className="bg-gray-600 rounded-2xl rounded-br-md px-4 py-3">
                        <div className="text-[#ECECF1] whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* AI Assistant message - left aligned with avatar */
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-600">
                      <Bot className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-sm text-gray-400">AI Assistant</div>
                      <div className="text-[#ECECF1] whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Input - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#343541]">
        {/* Chat Input Container */}
        <div className="bg-gray-700 rounded-2xl border border-gray-600 p-4">
          <div className="flex items-center space-x-3">
            {/* Plus Icon */}
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-400 hover:text-[#ECECF1] hover:bg-gray-600 h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            {/* Input Field */}
            <div className="flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your data..."
                className="bg-transparent border-none text-[#ECECF1] placeholder-gray-400 focus:ring-0 focus:outline-none p-0 h-auto"
              />
            </div>
            
            {/* Right Side Icons */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-400 hover:text-[#ECECF1] hover:bg-gray-600 h-8 w-8"
              >
                <Mic className="h-4 w-4" />
              </Button>
              
              {input.trim() && (
                <Button 
                  onClick={handleSendMessage}
                  size="icon"
                  className="bg-[#ECECF1] hover:bg-gray-300 text-gray-800 h-8 w-8 rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}