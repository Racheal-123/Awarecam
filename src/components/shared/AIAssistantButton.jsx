import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIAssistantButton({ onToggle, hasUnreadMessages = false }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative"
    >
      <Button 
        size="lg" 
        className="relative rounded-full w-16 h-16 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0"
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Bot className="w-7 h-7 text-white" />
        
        {/* Status indicator */}
        <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
          <div className="w-full h-full bg-green-500 rounded-full animate-ping opacity-75"></div>
        </div>
        
        {/* Unread messages indicator */}
        {hasUnreadMessages && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
        )}
      </Button>
      
      {/* Tooltip */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg"
        >
          AI Assistant
          <div className="absolute top-1/2 -translate-y-1/2 left-full w-2 h-2 bg-slate-900 rotate-45"></div>
        </motion.div>
      )}
    </motion.div>
  );
}