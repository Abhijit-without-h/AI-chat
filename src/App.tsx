import React, { useState, useRef, useEffect } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { API_CONFIG } from './config';
import type { ChatState, Message } from './types';

function App() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  const handleSend = async (content: string) => {
    const newMessage: Message = { role: 'user', content };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch(API_CONFIG.OLLAMA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3.2:1b',
          prompt: content,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to Ollama');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: import.meta.env.PROD 
          ? 'Failed to connect to Ollama. Make sure it\'s running locally and accessible at http://localhost:11434'
          : 'Failed to connect to Ollama. Make sure it\'s running locally.',
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Brain className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-semibold">Local AI Chat</h1>
          {import.meta.env.PROD && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Requires local Ollama instance
            </span>
          )}
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-grow overflow-auto">
        <div className="max-w-4xl mx-auto">
          {chatState.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <Brain className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">Welcome to Local AI Chat!</p>
              <p className="text-sm">Start a conversation with your local Ollama model.</p>
              {import.meta.env.PROD && (
                <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-lg max-w-md text-center">
                  <p className="font-medium mb-2">Important:</p>
                  <p className="text-sm">
                    Make sure Ollama is running locally on your machine at http://localhost:11434
                  </p>
                </div>
              )}
            </div>
          ) : (
            chatState.messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))
          )}
          {chatState.isLoading && (
            <div className="flex items-center gap-2 p-4 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          )}
          {chatState.error && (
            <div className="p-4 bg-red-50 text-red-500 border-l-4 border-red-500 m-4">
              {chatState.error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput onSend={handleSend} disabled={chatState.isLoading} />
    </div>
  );
}

export default App;