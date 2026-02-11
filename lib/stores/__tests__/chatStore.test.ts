import { renderHook, act } from '@testing-library/react';
import { useChatStore } from '../chatStore';

describe('chatStore', () => {
  beforeEach(() => {
    // Clear store state before each test
    const { clearMessages } = useChatStore.getState();
    clearMessages();
  });

  describe('initial state', () => {
    it('should have empty messages array initially', () => {
      const { result } = renderHook(() => useChatStore());
      expect(result.current.messages).toEqual([]);
    });
  });

  describe('addMessage', () => {
    it('should add user message with generated id and timestamp', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.addMessage('user', 'Hello, AI!');
      });

      const messages = result.current.messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe('user');
      expect(messages[0].content).toBe('Hello, AI!');
      expect(messages[0].id).toMatch(/^msg_\d+_/);
      expect(messages[0].timestamp).toBeTruthy();
    });

    it('should add assistant message', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.addMessage('assistant', 'Hello there!');
      });

      const messages = result.current.messages;
      expect(messages[0].role).toBe('assistant');
      expect(messages[0].content).toBe('Hello there!');
    });

    it('should add system message', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.addMessage('system', 'System message');
      });

      const messages = result.current.messages;
      expect(messages[0].role).toBe('system');
      expect(messages[0].content).toBe('System message');
    });

    it('should generate unique ids for messages', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.addMessage('user', 'First');
        result.current.addMessage('user', 'Second');
      });

      const messages = result.current.messages;
      expect(messages[0].id).not.toBe(messages[1].id);
    });

    it('should return the new message id', () => {
      const { result } = renderHook(() => useChatStore());

      let returnedId = '';
      act(() => {
        returnedId = result.current.addMessage('user', 'Test message');
      });

      expect(returnedId).toBeTruthy();
      expect(result.current.messages[0].id).toBe(returnedId);
    });

    it('should maintain message order', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.addMessage('user', 'First');
        result.current.addMessage('assistant', 'Response 1');
        result.current.addMessage('user', 'Second');
        result.current.addMessage('assistant', 'Response 2');
      });

      const messages = result.current.messages;
      expect(messages[0].content).toBe('First');
      expect(messages[1].content).toBe('Response 1');
      expect(messages[2].content).toBe('Second');
      expect(messages[3].content).toBe('Response 2');
    });
  });

  describe('updateMessage', () => {
    it('should update message content', () => {
      const { result } = renderHook(() => useChatStore());

      let msgId = '';
      act(() => {
        msgId = result.current.addMessage('user', 'Original message');
      });

      act(() => {
        result.current.updateMessage(msgId, 'Updated message');
      });

      const message = result.current.messages[0];
      expect(message.content).toBe('Updated message');
      expect(message.role).toBe('user'); // Unchanged
    });

    it('should update timestamp', () => {
      const { result } = renderHook(() => useChatStore());

      let msgId = '';
      let originalTimestamp = '';
      act(() => {
        msgId = result.current.addMessage('user', 'Message');
        originalTimestamp = result.current.messages[0].timestamp;
      });

      // Wait a bit
      jest.advanceTimersByTime(100);

      act(() => {
        result.current.updateMessage(msgId, 'Updated');
      });

      const message = result.current.messages[0];
      expect(message.timestamp).not.toBe(originalTimestamp);
    });

    it('should not affect other messages', () => {
      const { result } = renderHook(() => useChatStore());

      let id1 = '';
      let id2 = '';
      act(() => {
        id1 = result.current.addMessage('user', 'Message 1');
        id2 = result.current.addMessage('assistant', 'Message 2');
      });

      act(() => {
        result.current.updateMessage(id1, 'Updated 1');
      });

      expect(result.current.messages[0].content).toBe('Updated 1');
      expect(result.current.messages[1].content).toBe('Message 2'); // Unchanged
    });
  });

  describe('deleteMessage', () => {
    it('should remove message by id', () => {
      const { result } = renderHook(() => useChatStore());

      let msgId = '';
      act(() => {
        msgId = result.current.addMessage('user', 'Test');
      });

      expect(result.current.messages).toHaveLength(1);

      act(() => {
        result.current.deleteMessage(msgId);
      });

      expect(result.current.messages).toHaveLength(0);
    });

    it('should keep order when deleting middle message', () => {
      const { result } = renderHook(() => useChatStore());

      let id1 = '';
      let id2 = '';
      let id3 = '';
      act(() => {
        id1 = result.current.addMessage('user', 'First');
        id2 = result.current.addMessage('assistant', 'Second');
        id3 = result.current.addMessage('user', 'Third');
      });

      act(() => {
        result.current.deleteMessage(id2);
      });

      const messages = result.current.messages;
      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('First');
      expect(messages[1].content).toBe('Third');
    });
  });

  describe('clearMessages', () => {
    it('should remove all messages', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.addMessage('user', 'Message 1');
        result.current.addMessage('assistant', 'Message 2');
        result.current.addMessage('user', 'Message 3');
      });

      expect(result.current.messages).toHaveLength(3);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toEqual([]);
    });
  });

  describe('getLastMessage', () => {
    it('should return last message', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.addMessage('user', 'First');
        result.current.addMessage('assistant', 'Last');
      });

      const lastMessage = result.current.getLastMessage();
      expect(lastMessage?.content).toBe('Last');
      expect(lastMessage?.role).toBe('assistant');
    });

    it('should return undefined for empty chat', () => {
      const { result } = renderHook(() => useChatStore());

      const lastMessage = result.current.getLastMessage();
      expect(lastMessage).toBeUndefined();
    });
  });

  describe('getMessagesByRole', () => {
    it('should return messages by role', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.addMessage('user', 'User 1');
        result.current.addMessage('assistant', 'AI 1');
        result.current.addMessage('user', 'User 2');
        result.current.addMessage('assistant', 'AI 2');
      });

      const userMessages = result.current.getMessagesByRole('user');
      const assistantMessages = result.current.getMessagesByRole('assistant');

      expect(userMessages).toHaveLength(2);
      expect(assistantMessages).toHaveLength(2);
      expect(userMessages.every(m => m.role === 'user')).toBe(true);
      expect(assistantMessages.every(m => m.role === 'assistant')).toBe(true);
    });

    it('should return empty array for non-existent role', () => {
      const { result } = renderHook(() => useChatStore());

      const messages = result.current.getMessagesByRole('system');
      expect(messages).toEqual([]);
    });
  });

  describe('resetStore', () => {
    it('should clear all messages', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.addMessage('user', 'Message');
      });

      expect(result.current.messages).toHaveLength(1);

      act(() => {
        result.current.resetStore();
      });

      expect(result.current.messages).toEqual([]);
    });
  });
});
