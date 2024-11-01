import React, { useState, useRef, useEffect } from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { generateText } from './services/ollamaService';
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
      const data = await generateText(content);
      
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
        error: 'Failed to connect to AI service. Please try again later.',
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Brain className="w-8 h-8 text-blue-500" />
          <h1 className="text-xl font-semibold">AI Chat (Llama 3.2)</h1>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-grow overflow-auto">
        <div className="max-w-4xl mx-auto">
          {chatState.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <Brain className="w-12 h-12 mb-4" />
              <p className="text-lg font-medium">Welcome to AI Chat!</p>
              <p className="text-sm">Start a conversation with Llama 3.2</p>
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