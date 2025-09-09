
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, X, Bot, User as UserIcon, Minimize2, Maximize2, ExternalLink } from 'lucide-react';
import aiAssistantService from '@/components/services/AIAssistantService';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

// A simple component to render message content with clickable links
const MessageContent = ({ content }) => {
  const parts = content.split(/(\[View Details\]\(.*?\))/g);

  return (
    <p className="text-sm whitespace-pre-wrap">
      {parts.map((part, index) => {
        const match = part.match(/\[View Details\]\((.*?)\)/);
        if (match) {
          const url = match[1];
          return (
            <Link key={index} to={url} className="inline-block mt-2">
               <Button variant="outline" size="sm" className="bg-white hover:bg-slate-100 border-blue-300 text-blue-700">
                View Details
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </Link>
          );
        }
        return part;
      })}
    </p>
  );
};

export default function AIAssistant({ onClose, user, organization, userRole }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [context, setContext] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get current page context
  const getCurrentPageContext = () => {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'Dashboard';
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      page: page.charAt(0).toUpperCase() + page.slice(1),
      userRole,
      url: path,
      params: Object.fromEntries(urlParams.entries())
    };
  };

  useEffect(() => {
    if (user && organization) {
      // When user and org are present, initialize fully
      setIsInitialized(false);
      initializeAssistant();
    } else if (user && !organization) {
      // When a platform user has not selected an org, show a message
      setMessages([{
        role: 'assistant',
        content: "I'm ready to help! Please select an organization from the switcher in the header to get started.",
        timestamp: new Date().toISOString(),
      }]);
      setIsInitialized(true); // Mark as initialized to hide the spinner
    }
  }, [user, organization]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeAssistant = async () => {
    try {
      const pageContext = getCurrentPageContext();
      const sessionContext = await aiAssistantService.initializeSession(
        user.id, 
        organization.id, 
        pageContext
      );
      
      setContext(sessionContext);
      
      // Load conversation history
      const history = await aiAssistantService.getConversationHistory(user.id, organization.id);
      setMessages(history);
      
      // Add welcome message if this is a new conversation
      if (history.length === 0) {
        const welcomeMessage = {
          role: 'assistant',
          content: generateWelcomeMessage(userRole, pageContext.page, organization),
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize AI assistant:', error);
      setMessages([{
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try refreshing the page or contact support if the issue persists.",
        timestamp: new Date().toISOString(),
        error: true
      }]);
      setIsInitialized(true);
    }
  };

  const generateWelcomeMessage = (userRole, currentPage, organization) => {
    const roleDisplay = userRole?.role_display_name || 'User';
    const orgName = organization?.name || 'your organization';
    
    let welcome = `👋 Hi there! I'm your AwareCam AI Assistant.`;
    welcome += `\n\nI can now help you search for events and tasks. Try asking:\n- "Show me critical events from today"\n- "How many tasks are overdue?"`;
    
    return welcome;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Remove all location context - just pass null values
      const response = await aiAssistantService.sendMessage(
        user.id,
        organization.id,
        null, // No location context
        true, // Default to all locations
        userMessage.content
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        error: response.error
      };

      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm experiencing technical difficulties. Please try again in a moment.",
        timestamp: new Date().toISOString(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isInitialized) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 20, y: 20 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Card className="w-80 h-96 shadow-2xl border-0">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-slate-600">Initializing AI Assistant...</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 20, y: 20 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Card className={`shadow-2xl border-0 transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      }`}>
        {/* Header */}
        <CardHeader className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-col"
            >
              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto max-h-96 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : message.error
                            ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-sm'
                            : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                      }`}
                    >
                      <MessageContent content={message.content} />
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <UserIcon className="w-4 h-4 text-slate-600" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 animate-spin text-blue-600" />
                    </div>
                    <div className="bg-slate-100 p-3 rounded-lg rounded-bl-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="text-sm text-slate-600">Searching...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input */}
              <div className="p-4 border-t bg-slate-50 rounded-b-lg">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder={!organization ? "Select an organization to begin..." : "Ask about events or tasks..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading || !organization}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={isLoading || !inputValue.trim() || !organization}
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  AI-powered search
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
