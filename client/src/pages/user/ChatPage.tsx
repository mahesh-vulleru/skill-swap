import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Paperclip, MessageSquare, Circle, CheckCheck, ArrowLeft } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { getSocket } from '../../services/socket';
import { IMessage, IConversation, IUser } from '../../types';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { userId: urlUserId } = useParams<{ userId?: string }>();
  const socket = getSocket(user?._id);
  const { info } = useToast();

  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations list
  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      if (res.data?.success) {
        const convList = res.data.conversations || [];
        setConversations(convList);
        if (!urlUserId && !selectedPartner && convList.length > 0) {
          setSelectedPartner(convList[0].partner);
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

  // Handle URL partner parameter: /chat/:userId
  useEffect(() => {
    if (!urlUserId) return;

    // Check if partner already in conversation list
    const found = conversations.find((c) => c.partner._id === urlUserId);
    if (found) {
      setSelectedPartner(found.partner);
      setMobileView('chat');
    } else {
      // Fetch user profile from API and initiate chat
      api.get(`/users/${urlUserId}`)
        .then((res) => {
          if (res.data?.success && res.data.user) {
            setSelectedPartner(res.data.user);
            setMobileView('chat');
          }
        })
        .catch(console.error);
    }
  }, [urlUserId, conversations]);

  // Fetch messages for selected partner
  useEffect(() => {
    if (!selectedPartner) return;

    api.get(`/messages/${selectedPartner._id}`)
      .then((res) => {
        if (res.data?.success) {
          setMessages(res.data.messages || []);
        }
      })
      .catch(console.error);

    // Listen for incoming messages from Socket.IO
    const handleReceiveMessage = (msg: IMessage) => {
      const partnerId = selectedPartner._id;
      const msgSenderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
      const msgReceiverId = typeof msg.receiver === 'object' ? msg.receiver._id : msg.receiver;

      if (msgSenderId === partnerId || msgReceiverId === partnerId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
      fetchConversations();
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
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
      // REST API creates message and broadcasts via Socket.IO to receiver, eliminating duplicates
      const res = await api.post('/messages', {
        receiverId: selectedPartner._id,
        content,
      });

      if (res.data?.success) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data.message._id)) return prev;
          return [...prev, res.data.message];
        });
        fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleSelectPartner = (partner: IUser) => {
    setSelectedPartner(partner);
    setMobileView('chat');
  };

  const handleAttachmentClick = () => {
    info('Attachment upload is enabled for active chat sessions.', 'File Attachment');
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header
        title="Real-Time Knowledge Chat"
        subtitle="Coordinate exchange sessions, discuss curriculum, and trade code snippets live"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <Breadcrumbs items={[{ label: 'Chat' }]} className="mb-4" />

        <div className="flex-1 bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 shadow-elevated overflow-hidden flex flex-col md:flex-row min-h-[550px] sm:min-h-[600px]">
          {/* Left: Conversations List (Hidden on mobile if chat view is active) */}
          <div
            className={`
              w-full md:w-80 border-r border-stone-200 bg-stone-50/50 flex flex-col
              ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
            `}
          >
            <div className="p-4 border-b border-stone-200 bg-white flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900">Conversations</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                {conversations.length} Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
              {loading ? (
                <div className="p-6 text-center text-xs text-stone-400">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  No chat conversations yet. Propose an exchange to start messaging!
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.partner._id}
                    onClick={() => handleSelectPartner(conv.partner)}
                    className={`p-3.5 sm:p-4 flex items-center gap-3 cursor-pointer transition-colors ${
                      selectedPartner?._id === conv.partner._id
                        ? 'bg-forest-50/80 border-r-4 border-forest-600'
                        : 'hover:bg-white'
                    }`}
                  >
                    <Avatar
                      src={conv.partner.avatar}
                      name={conv.partner.name}
                      size="md"
                      isOnline={true}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{conv.partner.name}</h4>
                        <span className="text-[10px] text-stone-400">Active</span>
                      </div>
                      <p className="text-xs text-stone-500 truncate mt-0.5">{conv.lastMessage}</p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-action text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Active Chat Window (Hidden on mobile if list view is active) */}
          <div
            className={`
              flex-1 flex flex-col bg-white
              ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
            `}
          >
            {selectedPartner ? (
              <>
                {/* Chat Top Header */}
                <div className="p-3.5 sm:p-4 border-b border-stone-200 flex items-center justify-between bg-white z-10">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setMobileView('list')}
                      className="p-1.5 -ml-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg md:hidden"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <Avatar
                      src={selectedPartner.avatar}
                      name={selectedPartner.name}
                      size="md"
                      isOnline={true}
                    />

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-stone-900 truncate">{selectedPartner.name}</h4>
                      <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 truncate">
                        <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 flex-shrink-0" /> Online • {selectedPartner.location || 'Remote'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message History Feed */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/40">
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
                            <Avatar
                              src={selectedPartner.avatar}
                              name={selectedPartner.name}
                              size="xs"
                            />
                          )}

                          <div
                            className={`max-w-xs sm:max-w-md p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-forest-700 text-white rounded-br-none shadow-sm'
                                : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none shadow-xs'
                            }`}
                          >
                            <p className="break-words">{msg.content}</p>
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
                  className="p-3 sm:p-4 border-t border-stone-200 bg-white flex items-center gap-2 sm:gap-3"
                >
                  <button
                    type="button"
                    onClick={handleAttachmentClick}
                    className="p-2 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-100 transition-colors"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    placeholder={`Message ${selectedPartner.name}...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="px-3.5 py-2 sm:px-4 sm:py-2.5 flex-shrink-0"
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
