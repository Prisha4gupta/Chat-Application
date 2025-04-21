import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import EnhancedLoginPage from './components/EnhancedLoginPage';
import GlobalChat from './components/GlobalChat';
import UserList from './components/UserList';
import DMChat from './components/DMChat';
import ActiveUserSidebar from './components/ActiveUserSidebar';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('global');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (user) {
      try {
        await setDoc(
          doc(db, 'users', user.uid),
          { online: false, lastSeen: new Date().toISOString() },
          { merge: true }
        );
        await signOut(auth);
        setUser(null);
        setTab('global');
        setSelectedUser(null);
      } catch (err) {
        console.error("Logout error:", err.message);
      }
    }
  };

  if (loading) return <LoadingScreen />;
  
  if (!user) return <EnhancedLoginPage onUserAuthenticated={setUser} />;

  return (
    <div className="app-container">
      {}
      <header className="app-header">
        <h2>Welcome, {user.email}</h2>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>

      {}
      <div className="tab-container">
        <button
          className={`tab-button ${tab === 'global' ? 'active' : ''}`}
          onClick={() => {
            setTab('global');
            setSelectedUser(null);
          }}
        >
          🌐 Global Chat
        </button>
        <button
          className={`tab-button ${tab === 'dm' ? 'active' : ''}`}
          onClick={() => {
            setTab('dm');
            setSelectedUser(null);
          }}
        >
          💬 Direct Messages
        </button>
      </div>

      {}
      <div className="chat-content-container">
        <AnimatePresence mode="wait">
          {tab === 'global' ? (
            <motion.div
              key="global"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.3 }}
              className="main-container"
            >
              <div className="chat-section">
                <GlobalChat />
              </div>
              <ActiveUserSidebar />
            </motion.div>
          ) : (
            <motion.div
              key="dm"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.3 }}
              className="dm-chat-wrapper"
            >
              <UserList onSelectUser={setSelectedUser} />
              {selectedUser ? (
                <DMChat selectedUser={selectedUser} />
              ) : (
                <div className="empty-dm-state">
                  <h2>👈 Select someone to chat with</h2>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;