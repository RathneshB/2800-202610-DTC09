import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useNavigate, Link } from "react-router-dom";
import introJs from "intro.js";
import "intro.js/introjs.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const intro = introJs();

    intro.setOptions({
      steps: [
        {
          element: document.querySelector("#email") as HTMLElement,
          intro: "If you have an account, input your email here.",
          position: "right",
        },
        {
          element: document.querySelector("#signupLink") as HTMLElement,
          intro: "Click Sign Up to create a new account.",
          position: "right",
        },
      ],
    });

    intro.start();

    return () => intro.exit();
  }, []);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setServerError(error.message);
    } else {
      navigate("/");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <span style={styles.logo}>🍔 FoodRoutes</span>
        </div>
        <h2 style={styles.heading}>Welcome back</h2>
        <p style={styles.subheading}>
          Sign in to find affordable food near you
        </p>

        {serverError && <div style={styles.serverError}>{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                ...styles.input,
                borderColor: errors.email ? "#e53e3e" : "#c3d9a0",
              }}
            />
            {errors.email && (
              <span style={styles.errorText}>{errors.email}</span>
            )}
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                ...styles.input,
                borderColor: errors.password ? "#e53e3e" : "#c3d9a0",
              }}
            />
            {errors.password && (
              <span style={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.signupText}>
          Don't have an account?{" "}
          <Link to="/signup" id="signupLink" style={styles.signupLink}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#E6E6FA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #72B01D",
    borderRadius: "12px",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "420px",
    boxSizing: "border-box",
    boxShadow: "0 4px 20px rgba(63, 125, 32, 0.1)",
  },
  logoRow: {
    textAlign: "center",
    marginBottom: "1rem",
  },
  logo: {
    fontSize: "1.4rem",
    fontWeight: "700",
    color: "#3F7D20",
  },
  heading: {
    margin: "0 0 0.25rem",
    fontSize: "1.6rem",
    color: "#1a1a1a",
    textAlign: "center",
    fontWeight: "600",
  },
  subheading: {
    margin: "0 0 1.5rem",
    fontSize: "0.9rem",
    color: "#6b7280",
    textAlign: "center",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "1.2rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#3F7D20",
    marginBottom: "0.4rem",
  },
  input: {
    padding: "0.6rem 0.85rem",
    fontSize: "1rem",
    border: "1.5px solid #c3d9a0",
    borderRadius: "8px",
    outline: "none",
    backgroundColor: "#f9fdf5",
    color: "#1a1a1a",
    transition: "border-color 0.2s",
  },
  errorText: {
    fontSize: "0.8rem",
    color: "#e53e3e",
    marginTop: "0.3rem",
  },
  serverError: {
    backgroundColor: "#fff5f5",
    border: "1px solid #fed7d7",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    color: "#c53030",
    fontSize: "0.875rem",
    marginBottom: "1rem",
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    fontWeight: "600",
    backgroundColor: "#3F7D20",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    marginTop: "0.5rem",
    transition: "background-color 0.2s",
  },
  signupText: {
    textAlign: "center",
    fontSize: "0.875rem",
    color: "#6b7280",
    marginTop: "1.25rem",
  },
  signupLink: {
    color: "#3F7D20",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Login;
