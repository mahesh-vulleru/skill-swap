import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Image, MoreVertical, MessageSquare, Circle, CheckCheck, Users } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import { IMessage, IConversation, IUser } from '../../types';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const socket = getSocket(user?._id);

  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations list
  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations || []);
        if (!selectedPartner && res.data.conversations?.length > 0) {
          setSelectedPartner(res.data.conversations[0].partner);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  // Fetch messages for selected partner
  useEffect(() => {
    if (!selectedPartner) return;

    api.get(`/messages/${selectedPartner._id}`)
      .then((res) => {
        if (res.data.success) {
          setMessages(res.data.messages || []);
        }
      })
      .catch(console.error);

    // Listen for incoming messages from Socket.IO
    const handleReceiveMessage = (msg: IMessage) => {
      if (
        (typeof msg.sender === 'object' && msg.sender._id === selectedPartner._id) ||
        (typeof msg.receiver === 'object' && msg.receiver._id === selectedPartner._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
      fetchConversations();
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleReceiveMessage);
    };
  }, [selectedPartner]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedPartner || !user) return;

    const content = inputMessage.trim();
    setInputMessage('');

    try {
      // Emit via socket for instant peer delivery
      socket.emit('send_message', {
        senderId: user._id,
        receiverId: selectedPartner._id,
        content,
      });

      // Also persist to API
      const res = await api.post('/messages', {
        receiverId: selectedPartner._id,
        content,
      });

      if (res.data.success) {
        setMessages((prev) => {
          // Avoid duplicate if socket already echoed
          if (prev.some((m) => m._id === res.data.message._id)) return prev;
          return [...prev, res.data.message];
        });
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title="Real-Time Knowledge Chat"
        subtitle="Coordinate exchange sessions, discuss curriculum, and trade code snippets live"
      />

      <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex-1 bg-white rounded-3xl border border-stone-200/80 shadow-elevated overflow-hidden flex flex-col md:flex-row min-h-[600px]">
          {/* Left: Conversations List */}
          <div className="w-full md:w-80 border-r border-stone-200 bg-stone-50/50 flex flex-col">
            <div className="p-4 border-b border-stone-200 bg-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">Conversations</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                {conversations.length} Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  No chat conversations yet. Propose an exchange to start messaging!
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.partner._id}
                    onClick={() => setSelectedPartner(conv.partner)}
                    className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                      selectedPartner?._id === conv.partner._id
                        ? 'bg-forest-50/80 border-r-4 border-forest-600'
                        : 'hover:bg-white'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={conv.partner.avatar}
                        alt={conv.partner.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-stone-200"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{conv.partner.name}</h4>
                        <span className="text-[10px] text-stone-400">Active</span>
                      </div>
                      <p className="text-xs text-stone-500 truncate mt-0.5">{conv.lastMessage}</p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-action text-white text-[10px] font-bold flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Active Chat Window */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedPartner ? (
              <>
                {/* Chat Top Header */}
                <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white z-10">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedPartner.avatar}
                      alt={selectedPartner.name}
                      className="w-10 h-10 rounded-2xl object-cover border border-stone-200"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{selectedPartner.name}</h4>
                      <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" /> Online • {selectedPartner.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message History Feed */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-stone-50/40">
                  {messages.length === 0 ? (
                    <div className="p-12 text-center text-xs text-stone-400">
                      Say hello to {selectedPartner.name} and plan your first knowledge exchange!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                      const isMe = senderId === user?._id;

                      return (
                        <div
                          key={msg._id}
                          className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMe && (
                            <img
                              src={selectedPartner.avatar}
                              alt={selectedPartner.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          )}

                          <div
                            className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-forest-700 text-white rounded-br-none shadow-sm'
                                : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none shadow-xs'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <div
                              className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                                isMe ? 'text-emerald-200' : 'text-stone-400'
                              }`}
                            >
                              <span>Just now</span>
                              {isMe && <CheckCheck className="w-3 h-3 text-action" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-stone-200 bg-white flex items-center gap-3"
                >
                  <button
                    type="button"
                    onClick={() => alert('Attachment upload ready for cloud storage integration!')}
                    className="p-2 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-100"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    placeholder={`Message ${selectedPartner.name}...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="px-4 py-2.5"
                    disabled={!inputMessage.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-stone-400">
                <MessageSquare className="w-12 h-12 text-stone-300 mb-3" />
                <p className="text-sm font-semibold">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

