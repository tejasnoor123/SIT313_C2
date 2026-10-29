
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

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
      // Create the account directly using Firebase Authentication.
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );

      const user = userCredential.user;

      // Save the user's display name in Firebase Authentication.
      await updateProfile(user, {
        displayName: trimmedName,
      });

      // Save additional user information in Cloud Firestore.
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: trimmedName,
        email: trimmedEmail,
        plan: "free",
        createdAt: serverTimestamp(),
      });

      setSuccess("Account created successfully!");

      // Change this path if your application uses a different route.
      navigate("/login");
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
            "Your account was created, but Firestore permissions prevented saving the profile. Check your Firestore security rules."
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
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p>Sign up for DEV@Deakin</p>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message" role="status">
            {success}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

export default SignUp;
