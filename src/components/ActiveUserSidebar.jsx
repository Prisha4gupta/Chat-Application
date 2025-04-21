import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const ActiveUserSidebar = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userList = snapshot.docs.map(doc => doc.data());
      setUsers(userList);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching users:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="active-users-sidebar">
        <h3>People in Global</h3>
        <div className="loading-users">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="active-users-sidebar">
      <h3>Active Users</h3>
      {users.map(user => (
        <div
          key={user.uid}
          className={`active-user ${user.uid === auth.currentUser?.uid ? 'current-user' : ''}`}
        >
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user.email}`}
            alt="avatar"
            className="active-user-avatar"
            style={{
              borderColor: user.online ? '#4CAF50' : '#ccc'
            }}
          />
          <div className="active-user-info">
            <span className="active-user-name">
              {(user.displayName || user.email?.split('@')[0] || user.email)}
              {user.uid === auth.currentUser?.uid ? ' (You)' : ''}
            </span>
            <span className="active-user-status">
              {user.online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActiveUserSidebar;