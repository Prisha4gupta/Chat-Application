import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, createUserIfNotExists } from '../firebase';

export default function EnhancedLoginPage({ onUserAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }

      await createUserIfNotExists(userCredential.user);
      onUserAuthenticated(userCredential.user);
    } catch (err) {
      console.error("Authentication error:", err.code, err.message);
      setError(getErrorMessage(err.code));
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use': return 'Email already in use';
      case 'auth/invalid-email': return 'Invalid email address';
      case 'auth/weak-password': return 'Password should be at least 6 characters';
      case 'auth/user-not-found': return 'User not found';
      case 'auth/wrong-password': return 'Incorrect password';
      default: return 'Authentication failed. Please try again.';
    }
  };

  const toggleAuthMode = () => {
    setAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setAnimating(false);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      {/* Background bubbles animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10"
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 20}s linear infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Glass card container */}
      <div 
        className={`bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-8 shadow-2xl max-w-md w-full mx-4 transition-all duration-500 ${
          animating ? 'scale-95 opacity-80' : 'scale-100 opacity-100'
        }`}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-white text-opacity-80 mt-2">
            {isLogin 
              ? 'Sign in to continue to your chats' 
              : 'Join our messaging platform today'}
          </p>
          {error && (
            <div className="mt-4 bg-red-400 bg-opacity-20 text-white px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white bg-opacity-20 border border-transparent rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-white bg-opacity-20 border border-transparent rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-purple-600 bg-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-300"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
  <button 
    onClick={toggleAuthMode}
    className="text-sm text-white hover:text-opacity-80 font-medium focus:outline-none bg-white bg-opacity-20 px-4 py-2 rounded-lg shadow-sm"
  >
    {isLogin 
      ? "Don't have an account? Sign up" 
      : 'Already have an account? Sign in'}
  </button>
</div>
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-pink-500 rounded-full opacity-50 blur-xl"></div>
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-purple-500 rounded-full opacity-50 blur-xl"></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(100px, 100px) rotate(180deg);
          }
          100% {
            transform: translate(0, 0) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}