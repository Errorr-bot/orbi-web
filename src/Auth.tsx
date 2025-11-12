// src/Auth.tsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebaseConfig';

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
        setMessage('✅ Logged in!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage('🎉 Account created!');
      }
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      background: 'linear-gradient(135deg, #C48AF6, #FF71C6)',
      color: 'white', fontFamily: 'Poppins, sans-serif'
    }}>
      <h2>{isLogin ? 'Login to Orbi' : 'Create an Orbi Account'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: 280 }}>
        <input type="email" placeholder="Email" value={email}
               onChange={(e) => setEmail(e.target.value)} required
               style={input}/>
        <input type="password" placeholder="Password" value={password}
               onChange={(e) => setPassword(e.target.value)} required
               style={input}/>
        <button type="submit" style={cta}>{isLogin ? 'Login' : 'Sign Up'}</button>
      </form>
      <p style={{ marginTop: 12, textDecoration: 'underline', cursor: 'pointer' }}
         onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
      </p>
      {message && <p style={{ marginTop: 8 }}>{message}</p>}
    </div>
  );
};

const input: React.CSSProperties = {
  margin: '8px 0', padding: '10px', borderRadius: 8, border: 'none'
};
const cta: React.CSSProperties = {
  marginTop: 10, padding: '10px', borderRadius: 8, border: 'none',
  background: 'white', color: '#C48AF6', fontWeight: 700, cursor: 'pointer'
};

export default Auth;
