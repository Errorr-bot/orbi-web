// src/components/OrbiAvatar.tsx
import React, { useEffect, useRef } from "react";

/**
 * OrbiAvatar — floating AI avatar with interactive glow + aura.
 * - Follows cursor slightly for depth (parallax).
 * - Has breathing, floating, and aura particle animations.
 * - Uses your avatar_orbi.png (transparent background).
 */
const OrbiAvatar: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const avatarRef = useRef<HTMLDivElement | null>(null);

  // subtle parallax based on mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!avatarRef.current) return;
      const rect = avatarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      avatarRef.current.style.setProperty("--x", `${x * 0.03}px`);
      avatarRef.current.style.setProperty("--y", `${y * 0.03}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={avatarRef}
      className="orbi-avatar-wrap"
      style={{
        position: "relative",
        width: 180,
        height: 200,
        margin: "0 auto",
        filter: "drop-shadow(0 0 25px rgba(173, 100, 255, 0.6))",
        animation: "float 4s ease-in-out infinite",
        transform: "translate(var(--x), var(--y))",
        transition: "transform 0.2s ease-out",
        ...style,
      }}
    >
      {/* Avatar Image */}
      <img
        src={process.env.PUBLIC_URL + "/avatar_orbi.png"}
        alt="Orbi Avatar"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          borderRadius: "20px",
          animation: "breath 5s ease-in-out infinite",
          filter: "drop-shadow(0 0 12px rgba(150, 100, 255, 0.7))",
        }}
      />

      {/* Floating aura particles / light crystals */}
      <div
        style={{
          position: "absolute",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.8)",
          top: "25%",
          left: "10%",
          animation: "floatParticle 6s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "rgba(200,150,255,0.9)",
          bottom: "20%",
          right: "15%",
          animation: "floatParticle 7s ease-in-out 1s infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "rgba(255,180,255,0.9)",
          top: "40%",
          right: "25%",
          animation: "floatParticle 5.5s ease-in-out 0.5s infinite",
        }}
      />

      {/* Internal animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }

          @keyframes breath {
            0%, 100% {
              transform: scale(1);
              filter: brightness(1) drop-shadow(0 0 15px rgba(138, 43, 226, 0.6));
            }
            50% {
              transform: scale(1.05);
              filter: brightness(1.15) drop-shadow(0 0 30px rgba(255, 100, 200, 0.9));
            }
          }

          @keyframes floatParticle {
            0%, 100% {
              transform: translateY(0px) scale(1);
              opacity: 0.9;
            }
            50% {
              transform: translateY(-15px) scale(1.2);
              opacity: 0.6;
            }
          }
        `}
      </style>
    </div>
  );
};

export default OrbiAvatar;
