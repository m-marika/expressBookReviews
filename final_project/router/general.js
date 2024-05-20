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
public_users.get('/', function (req, res) {
    getBookList()
        .then((booksList) => {
            res.send(JSON.stringify(booksList, null, 3));
        })
        .catch((err) => {
            res.status(500).send("Error fetching book list");
        });
});

// Function to get the book list using Promise callbacks
function getBookList() {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject(new Error("Book list not available"));
        }
    });
}


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBN(isbn)
        .then((book) => {
            if (book) {
                res.json(book);
            } else {
                res.status(404).send(`No book found with ISBN: ${isbn}`);
            }
        })
        .catch((err) => {
            res.status(500).send("Error fetching book details");
        });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    getBooksByAuthor(author)
        .then((matchingBooks) => {
            if (matchingBooks.length > 0) {
                res.json(matchingBooks);
            } else {
                res.status(404).send(`No books found by author: ${author}`);
            }
        })
        .catch((err) => {
            res.status(500).send("Error fetching books by author");
        });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    getBooksByTitle(title)
        .then((matchingBooks) => {
            if (matchingBooks.length > 0) {
                res.json(matchingBooks);
            } else {
                res.status(404).send(`No books found by title: ${title}`);
            }
        })
        .catch((err) => {
            res.status(500).send("Error fetching books by title");
        });
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookReview(isbn)
        .then((review) => {
            if (review) {
                res.json(review);
            } else {
                res.status(404).send(`No book found with ISBN: ${isbn}`);
            }
        })
        .catch((err) => {
            res.status(500).send("Error fetching book review");
        });
});

// Function to get book by ISBN using Promises
function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject(new Error(`No book found with ISBN: ${isbn}`));
        }
    });
}

// Function to get books by author using Promises
function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter(book => book.author === author);
        resolve(matchingBooks);
    });
}

// Function to get books by title using Promises
function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter(book => book.title === title);
        resolve(matchingBooks);
    });
}

// Function to get book review using Promises
function getBookReview(isbn) {
    return new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn].reviews);
        } else {
            reject(new Error(`No book found with ISBN: ${isbn}`));
        }
    });
}


module.exports.general = public_users;
