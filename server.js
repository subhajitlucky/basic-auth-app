// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const plainPassword = 'admin' ;


// Initialize the app
const app = express();

// Middleware to parse incoming request body (form data)
app.use(bodyParser.urlencoded({ extended: true }));

//serve statis files from the "public" directory
app.use(express.static("public"));

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
    console.log(hash);
    bcrypt.compare(plainPassword, hash, (err, result) => {
        console.log(result);
    });
});


// Middleware to parse incoming request body (JSON)
app.use(session ({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false,
    cookie : {secure : false}
}));

// Rate limiting middleware
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 3, // limit each IP to 3 requests per windowMs
    message: "Maximum login attempts exceeded. Please try again later.",
    });

// Set up the server to listen on port 3000
app.get("/", (req, res) => {
  res.send("Welcome to the Authentication App!");
});

//handle login form submission
app.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  const isValidUsername = username === process.env.AUTH_USERNAME;
   const isValidPassword = await bcrypt.compare(password, process.env.AUTH_PASSWORD_HASH);

  if (isValidUsername && isValidPassword) {
    
  req.session.user = username;
    res.send(`Login successful, Welcome ${username}!`);
  } else {
    res.send("Invalid username or password");
  }
});
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
