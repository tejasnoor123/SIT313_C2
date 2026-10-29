
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const styles = {
    page: {
      minHeight: "calc(100vh - 90px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "55px 20px 70px",
      boxSizing: "border-box",
      backgroundColor: "#f8f9fb",
      fontFamily: "Arial, Helvetica, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "646px",
      boxSizing: "border-box",
      backgroundColor: "#ffffff",
      border: "1px solid #4c91ff",
      borderRadius: "10px",
      padding: "36px 54px 42px",
      boxShadow: "0 8px 28px rgba(30, 64, 175, 0.06)",
    },
    header: {
      textAlign: "center",
      marginBottom: "28px",
    },
    title: {
      fontSize: "30px",
      fontWeight: "700",
      color: "#202b3c",
      margin: "0 0 10px",
    },
    subtitle: {
      fontSize: "17px",
      color: "#64748b",
      margin: 0,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "19px",
    },
    group: {
      display: "flex",
      flexDirection: "column",
      gap: "9px",
      width: "100%",
    },
    label: {
      fontSize: "16px",
      fontWeight: "500",
      color: "#263449",
    },
    input: {
      width: "100%",
      height: "52px",
      boxSizing: "border-box",
      padding: "0 16px",
      fontSize: "17px",
      color: "#263449",
      backgroundColor: "#ffffff",
      border: "1px solid #d1d8e2",
      borderRadius: "5px",
      outline: "none",
    },
    submit: {
      width: "100%",
      minHeight: "54px",
      marginTop: "5px",
      padding: "13px 18px",
      backgroundColor: loading ? "#7ca5f8" : "#2860ed",
      color: "#ffffff",
      fontSize: "18px",
      fontWeight: "700",
      border: "none",
      borderRadius: "5px",
      cursor: loading ? "not-allowed" : "pointer",
    },
    alert: {
      padding: "12px 14px",
      borderRadius: "5px",
      fontSize: "14px",
      lineHeight: "1.5",
      overflowWrap: "anywhere",
    },
    error: {
      backgroundColor: "#fef2f2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    },
    success: {
      backgroundColor: "#f0fdf4",
      color: "#166534",
      border: "1px solid #bbf7d0",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      gap: "15px",
      margin: "25px 0",
      color: "#94a3b8",
      fontSize: "15px",
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      backgroundColor: "#e2e8f0",
    },
    footer: {
      textAlign: "center",
      fontSize: "16px",
      color: "#475569",
      margin: "25px 0 0",
    },
    link: {
      color: "#2860ed",
      fontWeight: "600",
      textDecoration: "none",
    },
    switch: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: "28px",
    },
    switchLink: {
      display: "inline-block",
      padding: "10px 20px",
      border: "1px solid #4c91ff",
      borderRadius: "5px",
      color: "#2860ed",
      fontWeight: "600",
      fontSize: "16px",
      textDecoration: "none",
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: trimmedName,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: trimmedName,
        email: trimmedEmail,
        plan: "free",
        createdAt: serverTimestamp(),
      });

      setSuccess("Account created successfully!");

      navigate("/login", {
        state: {
          message: "Account created successfully! Please log in.",
        },
      });
    } catch (err) {
      console.error("Signup error:", err);

      switch (err.code) {
        case "auth/email-already-in-use":
          setError("This email is already registered. Please log in.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Please choose a stronger password.");
          break;
        case "auth/operation-not-allowed":
          setError(
            "Email/password sign-in is disabled in your Firebase Console."
          );
          break;
        case "permission-denied":
        case "firestore/permission-denied":
          setError(
            "Your account may have been created, but its profile could not be saved. Check your Firestore security rules."
          );
          break;
        default:
          setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.switch}>
          <Link to="/login" style={styles.switchLink}>
            Login
          </Link>
        </div>

        <header style={styles.header}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Sign up for DEV@Deakin</p>
        </header>

        {error && (
          <div
            role="alert"
            style={{ ...styles.alert, ...styles.error, marginBottom: "20px" }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            style={{
              ...styles.alert,
              ...styles.success,
              marginBottom: "20px",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.group}>
            <label htmlFor="signup-name" style={styles.label}>
              Full Name
            </label>
            <input
              id="signup-name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.group}>
            <label htmlFor="signup-email" style={styles.label}>
              Email Address
            </label>
            <input
              id="signup-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.group}>
            <label htmlFor="signup-password" style={styles.label}>
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.group}>
            <label htmlFor="signup-confirm-password" style={styles.label}>
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              style={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={styles.submit}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span>or</span>
          <span style={styles.dividerLine} />
        </div>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
