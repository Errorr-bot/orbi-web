// src/LandingPage.tsx
import React, { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LandingPage.css";
import OrbiAvatar from "./components/OrbiAvatar";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const revealRefs = useRef<(HTMLElement | null)[]>([]);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const ticking = useRef(false);

  // reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("reveal-visible");
        });
      },
      { threshold: 0.15 }
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // parallax avatar motion
  useEffect(() => {
    const onScroll = () => {
      if (!avatarRef.current) return;
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const rect = avatarRef.current!.getBoundingClientRect();
          const mid = window.innerHeight / 2;
          const offset = (mid - rect.top - rect.height / 2) * 0.03;
          avatarRef.current!.style.transform = `translateY(${offset}px)`;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const setRevealRef = (el: HTMLElement | null, i: number) => {
    revealRefs.current[i] = el;
  };

  // helper to animate mouse-follow shimmer on gradient buttons
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--x", `${x}px`);
    target.style.setProperty("--y", `${y}px`);
  };

  return (
    <div className="lp-root">
      {/* Navbar */}
      <nav className="lp-nav">
        <div className="lp-nav-left">
          <div className="lp-logo">
            <span className="lp-logo-icon">🌐</span>
            <span className="lp-logo-text">Orbi</span>
          </div>
        </div>
        <div className="lp-nav-right">
          <button className="lp-login-btn" onClick={() => navigate("/login")}>
            Login
          </button>

          {/* animated gradient shimmer get started */}
          <button
            className="lp-getstarted-btn"
            onMouseMove={handleMouseMove}
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="lp-hero">
        <div className="lp-hero-left reveal" ref={(el) => setRevealRef(el, 0)}>
          <h1 className="lp-title">
            Your world. <span className="lp-highlight">One app.</span>
          </h1>
          <p className="lp-sub">
            Orbi connects tasks, wallet, and life — calm design, powerful
            features, and AI insights.
          </p>

          <div className="lp-hero-cta">
            <button
              className="lp-getstarted-btn"
              onMouseMove={handleMouseMove}
              onClick={() => navigate("/signup")}
            >
              Get Started
            </button>

            <a className="lp-secondary" href="#features">
              Learn More
            </a>
          </div>
        </div>

        <div
          className="lp-hero-right reveal avatar-container"
          ref={(el) => {
            setRevealRef(el, 1);
            avatarRef.current = el;
          }}
        >
          <OrbiAvatar />
        </div>
      </header>

      {/* Scroll Indicator */}
      <div className="lp-scroll-indicator" aria-hidden>
        <div className="arrow" />
      </div>

      {/* Features */}
      <section className="lp-features" id="features">
        <div className="feature-grid">
          {[
            { icon: "📝", title: "Tasks", text: "Organize your day calmly." },
            { icon: "💰", title: "Wallet", text: "Track & split expenses easily." },
            { icon: "📷", title: "Scan", text: "Extract text instantly." },
            { icon: "👤", title: "Profile", text: "Your data, simplified." },
          ].map((f, i) => (
            <div
              key={f.title}
              className="feature-card reveal"
              ref={(el) => setRevealRef(el, i + 2)}
            >
              <div className="feature-emoji">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="lp-cta reveal" ref={(el) => setRevealRef(el, 6)}>
        <div className="lp-cta-card">
          <h3>Ready to make life simpler?</h3>
          <p>Join Orbi — manage your life, money, and moments with ease.</p>
          <button
            className="lp-getstarted-btn"
            onMouseMove={handleMouseMove}
            onClick={() => navigate("/signup")}
          >
            Create Free Account
          </button>
        </div>
      </section>

      <footer className="lp-footer">
        <p>© {new Date().getFullYear()} Orbi — Your world. One app.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
