require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const axios = require("axios");
const app = express();
const contactRoutes = require("./routes/contactRoutes");
const cookieParser = require("cookie-parser");
const verseSchema = require("./models/verseSchema");
const authRoutes = require("./routes/authRoutes");
const progressRoutes = require("./routes/progressRoutes");
const favouritesRouter = require('./routes/favourites');
const japaCount = require('./routes/japaCountRoutes');

// Enable CORS for specified origins and methods
//app.use(cors({
//  origin: CLIENT_ACCESS_URL
//}));
//import express from "express";
//import dotenv from "dotenv";
//import cors from "cors";
//import axios from "axios";

//import connectDB from "./config/db.js";
//import contactRoutes from "./routes/contactRoutes.js";
//import gitaRouter from "./routes/gita-rag.js"; // <-- your new RAG route
//import verseSchema from "./models/verseSchema.js";




const PORT = process.env.PORT || 4000;


// --- CORRECTED CORS CONFIGURATION ---

// 1. Define the list of websites that are allowed to make requests to your backend.
const allowedOrigins = [
    'http://localhost:3000',      // Your local development frontend
    'http://34.228.62.139'        // Your production frontend - REPLACE WITH YOUR EC2 PUBLIC IP
];

// 2. Configure the CORS middleware
app.use(cors({
    origin: function(origin, callback){
        // Check if the incoming request's origin is in our allowed list
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
        }
    },
    credentials: true
}));



// Establish a connection to the MongoDB database
connectDB();


// app.use(function(req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   next();
// });


// Parse incoming JSON data
app.use(express.json({ limit: "10kb" }));
  

app.use(cookieParser());

app.use("/auth", authRoutes);


app.use('/favourites', favouritesRouter);

app.use("/progress", progressRoutes);
app.use("/japaCount", japaCount)
// Configure options for making API requests
const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": process.env.RAPID_API_KEY,
    "X-RapidAPI-Host": "bhagavad-gita3.p.rapidapi.com",
  },
};

// Route to get all chapters from the Bhagavad Gita API
app.get("/chapters", async (req, res) => {
  try {
    const response = await axios.request(
      "https://bhagavad-gita3.p.rapidapi.com/v2/chapters/",
      options
    );
    const result = response.data;
    // console.log(result);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Function to fetch a random verse and save it to MongoDB
const getRandomVerse = async () => {
  try {
    const slokcount = [
      47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78,
    ];

    const ch = Math.floor(Math.random() * 17) + 1;
    const sl = Math.floor(Math.random() * slokcount[ch - 1]) + 1;

    //Fetch api
    const response = await await axios.get(
      `https://bhagavad-gita3.p.rapidapi.com/v2/chapters/${ch}/verses/${sl}/`,
      options
    ); // Replace API_URL with your actual API endpoint
    const apiData = response.data;

    // Save data to MongoDB
    const newVerse = new verseSchema({
      id: apiData.id,
      verse_number: apiData.verse_number,
      chapter_number: apiData.chapter_number,
      slug: apiData.slug,
      text: apiData.text,
      translations: apiData.translations,
    });

    await newVerse.save();
    // res.status(200).json( result );
    console.log("Data saved successfully");
  } catch (error) {
    console.error("Error:", error);
  }
};

// Route to retrieve a random verse from the MongoDB collection
app.get("/slok", async (req, res) => {
 try {
  const now = new Date();
  const midnight = new Date(now.getFullYear(),now.getMonth(), now.getDate(),0, 0, 0 );

  // Limit the collection size by new older records
  const maxCollectionSize = 1; // Set your desired maximum collection size
  const totalDocuments = await verseSchema.countDocuments();
  console.log(totalDocuments)
  if (totalDocuments == 0) {
    await getRandomVerse()
    console.log("API Fetch Sucessfully")
  } else 
  {
    if (totalDocuments > maxCollectionSize) {
      const oldestVerses = await verseSchema.find().sort({ createdAt: -1 }).limit(totalDocuments - maxCollectionSize);
      await verseSchema.deleteMany({_id: { $in: oldestVerses.map((verse) => verse._id) }, });
      console.log("Newer records deleted successfully");
    }
    if (now >= midnight) {
      await verseSchema.deleteMany({ createdAt: { $lt: midnight } });
      console.log("Old records deleted after 12 AM");
    }
  }
  const result = await verseSchema.find({});
  res.status(200).json(result);
  console.log("show result");
 } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
 }
});

//Route to get all verses of particular chapter
app.get("/chapter/:ch", async (req, res) => {
  const ch = req.params.ch;
  try {
    const response = await axios.get(
      `https://bhagavad-gita3.p.rapidapi.com/v2/chapters/${ch}/`,
      options
    );
    const result = response.data;
    // console.log(result);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

//Route to get all verses of particular chapter
app.get("/chapter/:ch/slok", async (req, res) => {
  const ch = req.params.ch;
  try {
    const response = await axios.get(
      `https://bhagavad-gita3.p.rapidapi.com/v2/chapters/${ch}/verses/`,
      options
    );
    const result = response.data;
    // console.log(result);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

//Route to get particular verses of particular chapter
app.get("/chapter/:ch/slok/:sl", async (req, res) => {
  const ch = req.params.ch;
  const sl = req.params.sl;
  try {
    const response = await axios.get(
      `https://bhagavad-gita3.p.rapidapi.com/v2/chapters/${ch}/verses/${sl}/`,
      options
    );
    const result = response.data;
    // console.log(result);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});


// Use the contactRoutes for handling contact form submissions
app.use("/contact", contactRoutes);


// Basic route for testing server
app.get("/", (req, res) => {
  res.send("hello world");
});

// Start the Express server and listen on port 4000
//app.listen(4000, () => {
//  console.log(`server is running at port 4000`);
//});

app.listen(PORT, () => {
  console.log(`Server started successfully at ${PORT}`);
});