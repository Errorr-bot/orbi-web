import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import app from './firebaseConfig';

const auth = getAuth(app);

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage('✅ Logged in successfully!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage('🎉 Account created successfully!');
      }
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(to bottom right, #C48AF6, #FF71C6)',
      color: 'white',
      fontFamily: 'Poppins, sans-serif'
    }}>
      <h2>{isLogin ? 'Login to Orbi' : 'Create an Orbi Account'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '280px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ margin: '8px 0', padding: '10px', borderRadius: '8px', border: 'none' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ margin: '8px 0', padding: '10px', borderRadius: '8px', border: 'none' }}
        />
        <button type="submit" style={{
          padding: '10px',
          borderRadius: '8px',
          border: 'none',
          background: 'white',
          color: '#C48AF6',
          fontWeight: 'bold',
          marginTop: '10px',
          cursor: 'pointer'
        }}>
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <p style={{ marginTop: '15px', cursor: 'pointer', textDecoration: 'underline' }}
        onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
      </p>

      {message && <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>{message}</p>}
    </div>
  );
};

export default Auth;
