import { useEffect, useState, useRef } from 'react';
import { Send, User, MessageSquare, Wifi, WifiOff } from 'lucide-react';
import type { Conversation, Message } from '../types/dto';
import { chatApi, sseClient } from '../services/api';

export function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sseConnected, setSseConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();

    // TODO: Replace with actual SSE endpoint when backend is ready
    // connectSSE();

    return () => {
      sseClient.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await chatApi.getConversations({ page: 1, limit: 50 });
      // setConversations(response.data);
      // if (response.data.length > 0) {
      //   setSelectedConversation(response.data[0]);
      // }

      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await chatApi.getMessages(conversationId, { page: 1, limit: 100 });
      // setMessages(response.data);

      // Using mock data for now - generate some sample messages
      await new Promise(resolve => setTimeout(resolve, 300));
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation?.lastMessage) {
        const mockMessages: Message[] = [
          {
            id: 'msg-prev-1',
            conversationId,
            senderId: conversation.participants[1].id,
            senderName: conversation.participants[1].name,
            content: 'Hi, I have a question about my order.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            isRead: true,
          },
          {
            id: 'msg-prev-2',
            conversationId,
            senderId: 'seller-1',
            senderName: 'You',
            content: 'Hello! I\'d be happy to help. What\'s your order number?',
            createdAt: new Date(Date.now() - 3000000).toISOString(),
            isRead: true,
          },
          conversation.lastMessage,
        ];
        setMessages(mockMessages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const connectSSE = () => {
    // TODO: Replace with actual SSE endpoint when backend is ready
    // sseClient.connect(
    //   '/seller/chat/stream',
    //   (event: MessageEvent) => {
    //     const message = JSON.parse(event.data) as Message;
    //     setMessages(prev => [...prev, message]);
    //     
    //     // Update last message in conversation
    //     setConversations(prev => prev.map(c =>
    //       c.id === message.conversationId
    //         ? { ...c, lastMessage: message, unreadCount: c.unreadCount + 1 }
    //         : c
    //     ));
    //   },
    //   (error: Event) => {
    //     console.error('SSE connection error:', error);
    //     setSseConnected(false);
    //   }
    // );
    // setSseConnected(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await chatApi.sendMessage({
      //   conversationId: selectedConversation.id,
      //   content: newMessage.trim(),
      // });
      // setMessages([...messages, response.data]);

      // Using mock data for now
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: selectedConversation.id,
        senderId: 'seller-1',
        senderName: 'You',
        content: newMessage.trim(),
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      setMessages([...messages, mockMessage]);
      
      // Update conversation
      setConversations(conversations.map(c =>
        c.id === selectedConversation.id
          ? { ...c, lastMessage: mockMessage }
          : c
      ));

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const otherParticipant = selectedConversation?.participants.find(p => p.role !== 'seller');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-neutral-900 mb-2">Chat</h1>
          <p className="text-neutral-600">Communicate with your customers</p>
        </div>

        {/* SSE Connection Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-neutral-200">
          {sseConnected ? (
            <>
              <Wifi size={16} className="text-green-600" />
              <span className="text-sm text-neutral-600">Real-time chat active</span>
            </>
          ) : (
            <>
              <WifiOff size={16} className="text-neutral-400" />
              <span className="text-sm text-neutral-600">Real-time chat inactive</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        {/* Conversations List */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="font-semibold text-neutral-900">Conversations</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-neutral-500 text-sm">Loading...</div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center p-6">
                <MessageSquare className="text-neutral-400 mb-2" size={32} />
                <p className="text-sm text-neutral-600">No conversations yet</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {conversations.map((conversation) => {
                  const otherUser = conversation.participants.find(p => p.role !== 'seller');
                  const isSelected = selectedConversation?.id === conversation.id;
                  
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full px-6 py-4 text-left hover:bg-neutral-50 transition-colors ${
                        isSelected ? 'bg-neutral-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                          {otherUser?.avatar ? (
                            <img
                              src={otherUser.avatar}
                              alt={otherUser.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User size={20} className="text-neutral-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                              {otherUser?.name}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="flex-shrink-0 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-xs text-neutral-600 truncate">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col">
          {selectedConversation && otherParticipant ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                    {otherParticipant.avatar ? (
                      <img
                        src={otherParticipant.avatar}
                        alt={otherParticipant.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-neutral-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{otherParticipant.name}</p>
                    <p className="text-xs text-neutral-600 capitalize">{otherParticipant.role}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.senderId === 'seller-1';
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwnMessage
                              ? 'bg-neutral-900 text-white'
                              : 'bg-neutral-100 text-neutral-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className={`text-xs text-neutral-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="px-6 py-4 border-t border-neutral-200">
                <div className="flex items-end gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center p-6">
              <div>
                <MessageSquare className="text-neutral-400 mb-4 mx-auto" size={48} />
                <p className="text-neutral-900 mb-1">No conversation selected</p>
                <p className="text-sm text-neutral-600">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
