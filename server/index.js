const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const axios = require("axios"); // Still needed for Self Ping
const app = express();
const cookieParser = require("cookie-parser");
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const progressRoutes = require("./routes/progressRoutes");
const favouritesRouter = require('./routes/favourites');
const japaCount = require('./routes/japaCountRoutes');
const gitaRoutes = require('./routes/gitaRoutes'); 
require("dotenv").config();
const PORT = process.env.PORT || 4000;
app.set("trust proxy", 1);


// --- CORS CONFIGURATION ---
const allowedOrigins = [
  'https://p1-rk-2.netlify.app',
  'http://localhost:3000',
  'http://18.208.218.198',
  'http://localhost:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
    }
  },
  credentials: true
}));

connectDB();

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// --- ROUTES SETUP ---
app.use("/auth", authRoutes);
app.use('/favourites', favouritesRouter);
app.use("/progress", progressRoutes);
app.use("/japaCount", japaCount);
app.use("/contact", contactRoutes);
app.use("/", gitaRoutes); 

// --- SELF PING (Keep in index.js to ensure server stays alive) ---
if (process.env.NODE_ENV === "production") {
  const URL = "https://p1-rk-c2.onrender.com";
  setInterval(() => {
    axios.get(URL).catch(e => console.log("Ping failed"));
  }, 4 * 60 * 1000);
}

app.get("/", (req, res) => res.send("Server is running 🚀"));
app.get("/health", (req, res) => res.status(200).json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server started successfully at ${PORT}`);
});

module.exports = app;