// src/App.tsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebaseConfig";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import LandingPage from "./LandingPage";


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for login/logout events
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #C48AF6, #FF71C6)",
          color: "white",
          fontFamily: "Poppins, sans-serif",
          fontSize: "1.5rem",
        }}
      >
        Loading...
      </div>
    );
  }

  // If logged in → show Dashboard, else show Auth page
  return user ? <Dashboard email={user.email} /> : <Auth />;

    // 👇 For now, show LandingPage instead of Dashboard/Auth
  return <LandingPage />;
};

export default App;
