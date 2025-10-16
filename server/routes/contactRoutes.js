const express = require("express");
const { contact } = require("../controller/contactControllers.js");

const router = express.Router();

// Define a route for handling POST requests to '/'
// When a POST request is received at this route, the 'contact' controller function will be executed
router.post("/", contact);

module.exports = router;