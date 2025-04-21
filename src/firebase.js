import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrE8iZjXOnBIAs2FgsJT6cBvdahk5_cVo",
  authDomain: "my-chat-app-d41dd.firebaseapp.com",
  projectId: "my-chat-app-d41dd",
  storageBucket: "my-chat-app-d41dd.appspot.com",
  messagingSenderId: "629764572018",
  appId: "1:629764572018:web:a3c5c347f08eb0acbb53eb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const createUserIfNotExists = async (user) => {
  if (!user) return;
  
  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  if (!docSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      online: true,
      lastSeen: new Date().toISOString(),
      displayName: user.displayName || user.email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user.email}`,
    });
  } else {
    await setDoc(userRef, {
      online: true,
      lastSeen: new Date().toISOString()
    }, { merge: true });
  }
};