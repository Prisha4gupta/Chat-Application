import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { motion } from 'framer-motion';

const UserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const filtered = snapshot.docs
        .map(doc => doc.data())
        .filter(u => u.uid !== auth.currentUser?.uid);
      setUsers(filtered);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching users:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="user-list">
        <h3>People</h3>
        <div className="loading-users">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-list">
      <h3 className="user-list-title">People</h3>
      {users.length === 0 ? (
        <div className="no-users">No other users found</div>
      ) : (
        users.map((user) => (
          <motion.div
            key={user.uid}
            whileHover={{ scale: 1.02 }}
            className="user-item"
            onClick={() => onSelectUser(user)}
          >
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user.email}`} 
              alt="avatar" 
              className="user-avatar"
              style={{ 
                borderColor: user.online ? '#4CAF50' : '#ccc' 
              }}
            />
            <span className={`user-name ${!user.online ? 'offline' : ''}`}>
              {user.displayName || user.email?.split('@')[0] || user.email}
            </span>
            {user.online && <span className="online-dot"></span>}
          </motion.div>
        ))
      )}
    </div>
  );
};

export default UserList;