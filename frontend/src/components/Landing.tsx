import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const handleJoin = () => {
    if (name.trim()) {
      navigate(`/room?name=${encodeURIComponent(name.trim())}`);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center relative overflow-hidden"
      style={{ backgroundImage: "url('/bg.avif')" }}
    >

      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-slate-900/50 to-black/70" />


      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }}
      />


      <div
        className="relative z-10 w-full max-w-md mx-4 rounded-3xl p-12"
        style={{
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.13)",
          boxShadow:
            "0 40px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)",
          animation: "slideUp 0.65s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >

        <div
          className="absolute top-0 left-1/4 right-1/4 h-px rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(148,196,255,0.7), transparent)",
          }}
        />


        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-8"
          style={{
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.25))",
            border: "1px solid rgba(148,196,255,0.2)",
            boxShadow: "0 8px 32px rgba(59,130,246,0.15)",
          }}
        >
          🎥
        </div>


        <h1
          className="text-4xl font-bold text-white mb-2 tracking-tight"
          style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.5px" }}
        >
          Join the Room
        </h1>
        <p className="text-sm text-slate-400 mb-10 leading-relaxed">
          Enter your name to start a crystal-clear video call — no downloads, no
          hassle.
        </p>

        
        <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Your Name
        </label>


        <input
          type="text"
          value={name}
          placeholder="e.g. Arjun Singh"
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          className="w-full px-5 py-4 rounded-xl text-white text-base outline-none transition-all duration-200 mb-5"
          style={{
            background: focused
              ? "rgba(255,255,255,0.1)"
              : "rgba(255,255,255,0.06)",
            border: `1.5px solid ${focused ? "rgba(99,179,255,0.5)" : "rgba(255,255,255,0.1)"}`,
            boxShadow: focused ? "0 0 0 4px rgba(59,130,246,0.1)" : "none",
            caretColor: "#60a5fa",
          }}
        />


        <button
          onClick={handleJoin}
          disabled={!name.trim()}
          className="w-full py-4 rounded-xl font-semibold text-base tracking-wide transition-all duration-200"
          style={{
            background: name.trim()
              ? "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)"
              : "rgba(255,255,255,0.08)",
            color: name.trim() ? "#fff" : "rgba(255,255,255,0.25)",
            border: "none",
            cursor: name.trim() ? "pointer" : "not-allowed",
            boxShadow: name.trim() ? "0 8px 32px rgba(59,130,246,0.4)" : "none",
          }}
          onMouseEnter={(e) => {
            if (name.trim()) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 14px 40px rgba(59,130,246,0.5)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = name.trim()
              ? "0 8px 32px rgba(59,130,246,0.4)"
              : "none";
          }}
        >
          Enter Room →
        </button>


        <p className="text-center text-xs text-slate-600 mt-6">
          No signup required · End-to-end encrypted
        </p>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input::placeholder { color: rgba(148,163,184,0.4); }
      `}</style>
    </div>
  );
};

export default Landing;
