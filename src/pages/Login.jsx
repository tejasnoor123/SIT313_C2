
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";
import { useAuth } from "../context/useAuth";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const message = location.state?.message;

    const { login } = useAuth();

    // Save the authenticated Firebase user in your existing AuthContext.
    const saveUserSession = async (user) => {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        let userData;

        if (!userSnapshot.exists()) {
            userData = {
                uid: user.uid,
                name: user.displayName || user.email || "",
                email: user.email || "",
                photoURL: user.photoURL || "",
                plan: "free",
                createdAt: serverTimestamp(),
            };

            await setDoc(userRef, userData);
        } else {
            userData = userSnapshot.data();
        }

        const userSession = {
            id: user.uid,
            uid: user.uid,
            name:
                userData.name ||
                user.displayName ||
                user.email ||
                "",
            email: user.email || "",
            photoURL: userData.photoURL || user.photoURL || "",
            plan: userData.plan || "free",
        };

        // Firebase ID token, not a backend-generated JWT.
        const token = await user.getIdToken();

        // Keep using your existing AuthContext login function.
        login(token, userSession);

        return userSession;
    };

    // Email and password login through Firebase Authentication.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.trim().toLowerCase(),
                password
            );

            await saveUserSession(userCredential.user);

            navigate("/");
        } catch (err) {
            console.error("Email login error:", err);

            switch (err.code) {
                case "auth/invalid-credential":
                case "auth/wrong-password":
                case "auth/user-not-found":
                    setError("Invalid email or password.");
                    break;

                case "auth/invalid-email":
                    setError("Please enter a valid email address.");
                    break;

                case "auth/too-many-requests":
                    setError(
                        "Too many unsuccessful attempts. Please try again later."
                    );
                    break;

                case "auth/operation-not-allowed":
                    setError(
                        "Email/password login is disabled in Firebase Authentication settings."
                    );
                    break;

                default:
                    setError(
                        err.message ||
                        "Login failed. Please try again."
                    );
            }
        } finally {
            setLoading(false);
        }
    };

    // Google sign-in through Firebase Authentication.
    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);

        try {
            const result = await signInWithPopup(auth, googleProvider);

            await saveUserSession(result.user);

            navigate("/");
        } catch (err) {
            console.error("Google sign-in error:", err);

            if (err.code === "auth/popup-blocked") {
                setError(
                    "Your browser blocked the sign-in popup. Allow popups and try again."
                );
            } else if (err.code === "auth/popup-closed-by-user") {
                setError("The sign-in popup was closed before completion.");
            } else if (err.code === "auth/unauthorized-domain") {
                setError(
                    "This website domain is not authorized in Firebase. Add your deployed domain in Firebase Authentication settings."
                );
            } else {
                setError(
                    err.message || "Google sign-in failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card login-card">
                <div className="auth-card-header">
                    <Link to="/signup" className="auth-switch-btn">
                        Sign up
                    </Link>
                </div>

                {message && (
                    <div className="auth-alert success-alert">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="auth-alert error-alert" role="alert">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="login-email">Your email</label>
                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            placeholder="user@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Your password</label>
                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>or</span>
                </div>

                <button
                    type="button"
                    className="google-btn"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                >
                    Continue with Google
                </button>
            </div>
        </div>
    );
}

export default Login;
