const express = require("express");
const router = express.Router();
const axios = require("axios");
const verseSchema = require("../models/verseSchema");

// --- ⚡️ SMART CACHE STORAGE (24H Expiry) ---
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Hours

const memoryCache = {
  chapters: { data: null, timestamp: 0 },
  chapterDetails: {}, // { "1": { data: ..., timestamp: ... } }
  chapterVerses: {},  // { "1": { data: ..., timestamp: ... } }
  verseDetails: {}    // { "1-5": { data: ..., timestamp: ... } }
};

// Helper: Is cache valid?
const isCacheValid = (entry) => {
  if (!entry || !entry.data) return false;
  const now = Date.now();
  return (now - entry.timestamp) < CACHE_DURATION;
};

// --- API OPTIONS ---
const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": process.env.RAPID_API_KEY,
    "X-RapidAPI-Host": "bhagavad-gita3.p.rapidapi.com",
  },
};

// --- HELPER: Random Verse ---
const getRandomVerse = async () => {
  try {
    const slokcount = [47, 72, 43, 42, 29, 47, 30, 28, 34, 42, 55, 20, 35, 27, 20, 24, 28, 78];
    const ch = Math.floor(Math.random() * 17) + 1;
    const sl = Math.floor(Math.random() * slokcount[ch - 1]) + 1;

    const response = await axios.get(`https://bhagavad-gita3.p.rapidapi.com/v2/chapters/${ch}/verses/${sl}/`, options);
    const apiData = response.data;

    const newVerse = new verseSchema({
      id: apiData.id,
      verse_number: apiData.verse_number,
      chapter_number: apiData.chapter_number,
      slug: apiData.slug,
      text: apiData.text,
      translations: apiData.translations,
    });

    await newVerse.save();
    console.log("Random Verse Saved");
  } catch (error) {
    console.error("Error fetching random verse:", error);
  }
};

// --- ROUTES ---

// 1. Get All Chapters
router.get("/chapters", async (req, res) => {
  try {
    if (isCacheValid(memoryCache.chapters)) {
      console.log("Serving Chapters from Cache ⚡️");
      return res.send(memoryCache.chapters.data);
    }
    
    const response = await axios.request("https://bhagavad-gita3.p.rapidapi.com/v2/chapters/", options);
    
    memoryCache.chapters = { 
      data: response.data, 
      timestamp: Date.now() 
    };
    
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 2. Get Single Chapter
router.get("/chapter/:ch", async (req, res) => {
  const ch = req.params.ch;
  try {
    const cachedItem = memoryCache.chapterDetails[ch];
    
    if (isCacheValid(cachedItem)) {
      console.log(`Serving Chapter ${ch} from Cache ⚡️`);
      return res.send(cachedItem.data);
    }

    const response = await axios.get(`https://bhagavad-gita3.p.rapidapi.com/v2/chapters/${ch}/`, options);
    
    memoryCache.chapterDetails[ch] = { 
      data: response.data, 
      timestamp: Date.now() 
    };
    
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 3. Get All Verses of a Chapter
router.get("/chapter/:ch/slok", async (req, res) => {
  const ch = req.params.ch;
  try {
    const cachedItem = memoryCache.chapterVerses[ch];
    
    if (isCacheValid(cachedItem)) {
      console.log(`Serving Verses for Chapter ${ch} from Cache ⚡️`);
      return res.send(cachedItem.data);
    }

    const response = await axios.get(`https://bhagavad-gita3.p.rapidapi.com/v2/chapters/${ch}/verses/`, options);
    
    memoryCache.chapterVerses[ch] = { 
      data: response.data, 
      timestamp: Date.now() 
    };
    
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 4. Get Particular Verse
router.get("/chapter/:ch/slok/:sl", async (req, res) => {
  const ch = req.params.ch;
  const sl = req.params.sl;
  const key = `${ch}-${sl}`;

  try {
    const cachedItem = memoryCache.verseDetails[key];

    if (isCacheValid(cachedItem)) {
      console.log(`Serving Verse ${key} from Cache ⚡️`);
      return res.send(cachedItem.data);
    }

    const response = await axios.get(`https://bhagavad-gita3.p.rapidapi.com/v2/chapters/${ch}/verses/${sl}/`, options);
    
    memoryCache.verseDetails[key] = { 
      data: response.data, 
      timestamp: Date.now() 
    };
    
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 5. Verse of the Day Route (Unchanged)
router.get("/slok", async (req, res) => {
  try {
    const totalDocuments = await verseSchema.countDocuments();
    
    if (totalDocuments === 0) {
        await getRandomVerse();
    } else {
        const maxCollectionSize = 1;
        if (totalDocuments > maxCollectionSize) {
            const oldest = await verseSchema.find().sort({ createdAt: -1 }).limit(totalDocuments - maxCollectionSize);
            if(oldest.length) await verseSchema.deleteMany({ _id: { $in: oldest.map(v => v._id) } });
        }
        
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        if (now >= midnight) {
             await verseSchema.deleteMany({ createdAt: { $lt: midnight } });
        }
        
        if ((await verseSchema.countDocuments()) === 0) {
            await getRandomVerse();
        }
    }
    
    const result = await verseSchema.find({});
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;