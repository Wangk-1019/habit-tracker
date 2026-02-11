'use client';

import { ChatInterface } from '@/components/ai/ChatInterface';

export default function ChatPage() {
  return (
    <div className="min-h-screen pb-24 px-4">
      <div className="container mx-auto max-w-2xl py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">AI Habit Coach</h1>
          <p className="text-sm text-muted-foreground">
            Get personalized tips and insights about your habits
          </p>
        </div>

        {/* Quick prompts */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            'How can I build better habits?',
            'Give me motivation tips',
            'Analyze my streaks',
            'Improve my consistency',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (input) {
                  input.value = prompt;
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                  input.focus();
                }
              }}
              className="px-3 py-1.5 text-sm rounded-full bg-muted/50 hover:bg-muted transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat interface */}
        <ChatInterface />
      </div>
    </div>
  );
}
