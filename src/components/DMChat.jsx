import React, { useEffect, useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { motion } from 'framer-motion';

const DMChat = ({ selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const currentId = auth.currentUser.uid;
  const otherId = selectedUser.uid;
  const chatId = [currentId, otherId].sort().join('_');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt'),
      limit(100)
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);
    }, (err) => {
      setError('Failed to load messages');
      setLoading(false);
      console.error(err);
    });

    return () => unsub();
  }, [chatId]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmedText = text.trim();
    
    if (!trimmedText) return;
    if (trimmedText.length > 500) {
      setError('Message too long (max 500 characters)');
      return;
    }

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: trimmedText,
        createdAt: serverTimestamp(),
        from: currentId,
        to: otherId,
        status: 'sent'
      });
      setText('');
      setError('');
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="dm-chat-container chat-background-pattern-1">
        <div className="loading-messages">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="dm-chat-container chat-background-gradient-2">
      <div className="dm-chat-header">
        <h3>Chat with {selectedUser.displayName || selectedUser.email}</h3>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="messages-container">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`message-wrapper ${msg.from === currentId ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              {msg.text}
              <div className="message-time">
                {msg.createdAt?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-form" onSubmit={handleSend}>
        <input
          type="text"
          className="message-input"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default DMChat;