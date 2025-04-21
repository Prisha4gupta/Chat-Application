import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';
import { motion } from 'framer-motion';

const GlobalChat = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'global-messages'), orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, 'global-messages'), {
      text,
      createdAt: serverTimestamp(),
      user: user.email,
      displayName: user.email.split('@')[0],
      avatar: `https://api.dicebear.com/6.x/pixel-art/svg?seed=${user.email}`
    });

    setText('');
  };

return (
  <div className="chat-feed">
    <div className="chat-title-container">
      <div className="chat-title">🌐 Global Chat</div>
      <div className="chat-subtitle">Talk to everyone in the app</div>
    </div>

    <div className="messages-container chat-background-gradient-2">
      {messages.map((msg) => {
        const isCurrentUser = msg.user === auth.currentUser.email;

        return (
          <div 
            key={msg.id}
            className={`message-row ${isCurrentUser ? 'current-user' : ''}`}
          >
            {!isCurrentUser && (
              <img
                src={msg.avatar}
                alt="avatar"
                className="message-avatar"
              />
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`message-bubble ${isCurrentUser ? 'current-user' : ''}`}
            >
              {!isCurrentUser && (
                <div className="message-sender">
                  {msg.displayName || msg.user}
                </div>
              )}
              <div className="message-text">{msg.text}</div>
              <div className="message-time">
                {msg.createdAt?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>

    <form className="message-input-form" onSubmit={handleSend}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your message..."
      />
      <button type="submit">Send</button>
    </form>
  </div>
);
}

export default GlobalChat;