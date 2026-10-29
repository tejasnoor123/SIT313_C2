
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
const path = require("path");

// Load local environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Frontend origins allowed to call this backend
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json());

// Configure SendGrid when credentials are available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DEV@Deakin backend is running",
  });
});

// Newsletter subscription
app.post("/subscribe", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (!process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL) {
      return res.status(500).json({
        success: false,
        message: "Email service is not configured.",
      });
    }

    await sgMail.send({
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "Welcome to DEV@Deakin Daily Insider!",
      text: "Thank you for subscribing to our daily insider newsletter!",
      html: `
        <h2>Welcome to DEV@Deakin!</h2>
        <p>Thank you for subscribing to our Daily Insider newsletter.</p>
        <p>You have successfully joined our mailing list.</p>
      `,
    });

    return res.status(201).json({
      success: true,
      message: "Successfully subscribed! Please check your email.",
    });
  } catch (error) {
    console.error(
      "Newsletter error:",
      error.response?.body || error.message
    );

    return res.status(500).json({
      success: false,
      message: "Subscription failed. Please try again later.",
    });
  }
});

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`DEV@Deakin backend running on port ${PORT}`);
});
