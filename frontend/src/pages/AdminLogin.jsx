import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(""); // Clear previous errors

    if (!username || !password) {
      setError("Enter credentials");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!data.success || !data.token) {
        setError(data.message || "Login failed");
        return;
      }

      // ✅ STORE TOKEN + USER
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ DECODE TOKEN TO VERIFY ROLE
      const payload = JSON.parse(atob(data.token.split(".")[1]));

      // 🔥 CHECK ROLE
      if (payload.role !== "admin") {
        setError("Access denied. Admin only.");
        localStorage.clear();
        return;
      }

      // ✅ SUCCESS
      navigate("/admin");

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Server error");
    }
  };

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={styles.card}
      >
        <h2 style={styles.title}>Admin Login</h2>

        <div style={styles.inputGroup}>
          <motion.input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            whileFocus={styles.inputFocus}
          />
        </div>

        <div style={styles.inputGroup}>
          <motion.input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            whileFocus={styles.inputFocus}
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.errorText}
          >
            {error}
          </motion.p>
        )}

        <motion.button
          onClick={handleLogin}
          style={styles.button}
          whileHover={styles.buttonHover}
          whileTap={{ scale: 0.95 }}
        >
          Login
        </motion.button>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#050507", // Dark background
    fontFamily: "'Inter', sans-serif",
    padding: "20px",
  },
  card: {
    background: "rgba(255, 255, 255, 0.03)", // Glassmorphism base
    backdropFilter: "blur(16px)", // Blur effect
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 20px rgba(138, 43, 226, 0.15)", // Subtle purple ambient glow
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  title: {
    textAlign: "center",
    color: "#fff",
    margin: "0 0 10px 0",
    fontSize: "32px",
    fontWeight: "700",
    letterSpacing: "1px",
    textShadow: "0 0 15px rgba(6, 182, 212, 0.8), 0 0 30px rgba(6, 182, 212, 0.4)", // Cyan neon text glow
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    width: "100%",
    padding: "16px",
    background: "rgba(0, 0, 0, 0.6)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    color: "white",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
    transition: "background 0.3s ease",
  },
  inputFocus: {
    borderColor: "#06b6d4",
    boxShadow: "0 0 15px rgba(6, 182, 212, 0.5)", // Cyan border glow on focus
    background: "rgba(0, 0, 0, 0.8)",
  },
  button: {
    marginTop: "8px",
    padding: "16px",
    background: "linear-gradient(90deg, #06b6d4, #8a2be2)", // Cyan to purple gradient
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(138, 43, 226, 0.4)", // Initial neon glow
    width: "100%",
    boxSizing: "border-box",
    textTransform: "uppercase",
    letterSpacing: "2px",
  },
  buttonHover: {
    scale: 1.05,
    boxShadow: "0 0 30px rgba(6, 182, 212, 0.8)", // Enhanced cyan glow on hover
  },
  errorText: {
    color: "#ff4444",
    textAlign: "center",
    margin: "0",
    fontSize: "14px",
    textShadow: "0 0 8px rgba(255, 68, 68, 0.5)", // Red glow for errors
  }
};