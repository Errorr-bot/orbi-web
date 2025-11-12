import React from "react";

const OrbiAvatar: React.FC = () => {
  return (
    <div
      style={{
        position: "relative",
        width: 180,
        height: 200,
        margin: "0 auto",
        animation: "float 4s ease-in-out infinite",
        filter: "drop-shadow(0 0 25px rgba(173, 100, 255, 0.6))",
      }}
    >
      {/* Avatar Image (floating freely, no circle background) */}
      <img
        src={process.env.PUBLIC_URL + "/avatar_orbi.png"}
        alt="Orbi Avatar"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          borderRadius: "20px",
          animation: "breath 5s ease-in-out infinite",
        }}
      />

      {/* Floating aura particles / crystals */}
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

      {/* Animations */}
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
