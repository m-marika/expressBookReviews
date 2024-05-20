const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    return users.some(user => user.username === username);
  };
  
public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
  
    if (username && password) {
      if (!doesExist(username)) {
        users.push({ username, password });
        return res.status(200).json({ message: "User successfully registered. Now you can login" });
      } else {
        return res.status(404).json({ message: "User already exists!" });
      }
    } 
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,3));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn])
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const matchingBooks = [];

    for (const key in books) {
        if (books[key].author === author) {
            matchingBooks.push(books[key]);
        }
    }

    if (matchingBooks.length > 0) {
        res.json(matchingBooks);
    } else {
        res.status(404).send(`No books found by author: ${author}`);
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const matchingBooks = [];

    for (const key in books) {
        if (books[key].title === title) {
            matchingBooks.push(books[key]);
        }
    }

    if (matchingBooks.length > 0) {
        res.json(matchingBooks);
    } else {
        res.status(404).send(`No books found by title: ${title}`);
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        res.json(books[isbn].reviews);
    } else {
        res.status(404).send(`No book found with ISBN: ${isbn}`);
    }
});

module.exports.general = public_users;
