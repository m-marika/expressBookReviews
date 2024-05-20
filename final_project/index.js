const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const doesExist = (username) => {
    return users.some(user => user.username === username);
  };
  
  const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
  };

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    if (req.session.authorization) {
        const token = req.session.authorization['accessToken'];
        jwt.verify(token, "access", (err, user) => {
          if (!err) {
            req.user = user;
            next();
          } else {
            return res.status(403).json({ message: "User not authenticated" });
          }
        });
      } else {
        return res.status(403).json({ message: "User not logged in" });
      }
});

app.post("/login", (req, res) => {
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
  
  app.post("/register", (req, res) => {
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
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
