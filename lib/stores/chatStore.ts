import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, MessageRole } from '../types/chat';

interface ChatStore {
  messages: ChatMessage[];
  addMessage: (role: MessageRole, content: string) => string;
  updateMessage: (id: string, content: string) => void;
  deleteMessage: (id: string) => void;
  clearMessages: () => void;
  getLastMessage: () => ChatMessage | undefined;
  getMessagesByRole: (role: MessageRole) => ChatMessage[];
  resetStore: () => void;
}

const initialMessages: ChatMessage[] = [];

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: initialMessages,

      addMessage: (role, content) => {
        const newMessage: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          role,
          content,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));

        return newMessage.id;
      },

      updateMessage: (id, content) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, content, timestamp: new Date().toISOString() } : msg
          ),
        }));
      },

      deleteMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        }));
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      getLastMessage: () => {
        const messages = get().messages;
        return messages[messages.length - 1];
      },

      getMessagesByRole: (role) => {
        return get().messages.filter((msg) => msg.role === role);
      },

      resetStore: () => {
        set({ messages: [] });
      },
    }),
    {
      name: 'chat-storage',
    }
  )
);

// Selector helpers
export const selectConversationHistory = (state: ChatStore) => {
  return state.messages.slice(-10); // Last 10 messages for context
};

export const selectHasUnreadAssistantMessage = (state: ChatStore) => {
  const lastMessage = state.messages[state.messages.length - 1];
  return lastMessage?.role === 'assistant';
};
