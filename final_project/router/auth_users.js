const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
    };

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
    }
  
    if (authenticatedUser(username, password)) {
      const accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });
  
      req.session.authorization = { accessToken, username };
      return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.body.review;
    const username = req.session.authorization.username;
  
    if (!username) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    if (!reviewText) {
      return res.status(400).json({ message: "Review text is required " + req.body.review });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Check if the user has already posted a review for this ISBN
    if (books[isbn].reviews.hasOwnProperty(username)) {
      // If the user has already posted a review, update the existing one
      books[isbn].reviews[username] = reviewText;
      return res.status(200).json({ message: "Review updated successfully" });
    } else {
      // If the user has not posted a review, add a new one
      books[isbn].reviews[username] = reviewText;
      return res.status(201).json({ message: "Review added successfully" });
    }
  });

  regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Retrieve username from session
  
    if (!username) {
      return res.status(401).json({ message: "User not logged in" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Check if the user has posted a review for this ISBN
    if (!books[isbn].reviews.hasOwnProperty(username)) {
      return res.status(404).json({ message: "Review not found" });
    }
  
    // Delete the review associated with the user's session username
    delete books[isbn].reviews[username];
  
    return res.status(200).json({ message: "Review deleted successfully" });
  });


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
