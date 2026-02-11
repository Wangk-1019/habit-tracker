'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { useChatStore } from '@/lib/stores/chatStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  placeholder?: string;
  maxHeight?: string;
}

export function ChatInterface({ placeholder = 'Ask me anything about your habits...', maxHeight = '500px' }: ChatInterfaceProps) {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addMessage('user', userMessage);

    // Simulate AI response (replace with actual API call)
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context: { messages } }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      addMessage('assistant', data.message || data.content);
    } catch (error) {
      // Fallback response for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      addMessage('assistant', getFallbackResponse(userMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Messages */}
      <Card>
        <CardContent className="p-0">
          <div
            className={cn(
              'flex flex-col gap-4 p-4 overflow-y-auto',
              maxHeight && `max-h-[${maxHeight}]`
            )}
            style={maxHeight ? { maxHeight } : undefined}
          >
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <Sparkles className="w-12 h-12 text-primary/30 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Start a conversation</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Ask about your habits, streaks, or get personalized tips and insights.
                  </p>
                </motion.div>
              ) : (
                messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex gap-3',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}

                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-3',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>

                    {msg.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center gap-1 bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// Helper function for fallback responses
function getFallbackResponse(message: string): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('streak') || lowerMsg.includes('how long')) {
    return "Your streaks are looking great! Consistency is key to building lasting habits. Keep up the good work and remember that missing one day doesn't break your progress - it's getting back on track that matters most.";
  }

  if (lowerMsg.includes('mood') || lowerMsg.includes('feeling')) {
    return "Tracking your mood alongside your habits is a wonderful practice! This helps you understand patterns between your emotional state and your ability to maintain habits. Consider how different moods affect your motivation.";
  }

  if (lowerMsg.includes('tip') || lowerMsg.includes('advice') || lowerMsg.includes('help')) {
    return "Here are a few proven habit-building tips:\n\n1. Start small - begin with habits that take less than 2 minutes\n2. Stack habits - attach new habits to existing ones\n3. Focus on consistency over intensity\n4. Celebrate small wins\n\nWhich of these resonates with you?";
  }

  if (lowerMsg.includes('thank')) {
    return "You're welcome! I'm here to help you on your journey. Remember, building habits is a marathon, not a sprint. Every day is a new opportunity to grow!";
  }

  return "That's a great question! To give you personalized insights based on your actual habit data, make sure you're consistently tracking your habits and moods. Over time, I'll be able to identify patterns and provide tailored recommendations just for you.";
}
