// API base URL for local development and production hosting.
// Set VITE_API_URL in Netlify to your deployed Render service URL.
const configuredUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const API_BASE_URL = configuredUrl.replace(/\/+$/, "");
