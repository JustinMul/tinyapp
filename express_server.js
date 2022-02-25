const express = require("express");
let cookieParser = require('cookie-parser');
const res = require("express/lib/response");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const req = require("express/lib/request");
const bcrypt = require('bcryptjs');
let cookieSession = require('cookie-session');
const helper = require('./helpers.js');

const getUserByEmail = helper.getUserByEmail;


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: "potatoe",
  keys: ["My" , 'secret', 'keys']
}));

let urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const users = {};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
 
  const userURL = urlsForUser(req.session.userID);
  
  const templateVars = { urls: userURL, user: users[req.session.userID]};
  if (req.session.userID) {
    
    res.render("urls_index", templateVars);
  } else {
    
    res.redirect("/login");
    // return res.status(400).send('Required log in to access this page please visit http://localhost:8080/login');
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.session.userID]};
 
  if (req.session.userID) {
    return res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {


  if (!req.session.userID) {

    res.redirect('/urls');
  }
  if (req.session.userID  && req.session.userID === urlDatabase[req.params.shortURL].userID) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], user: users[req.session.userID]};
    res.render("urls_show", templateVars);
  } else {
    return res.status(400).send('Bad Request');
  }
  
});

app.get("/login", (req, res) => {
  const templateVars = {user: users[req.session.userID]};
  res.render("url_login", templateVars);
});
app.get("/register", (req, res) => {
  const templateVars = {user: users[req.session.userID]};
  res.render("url_registrationPage", templateVars);
});

app.post("/urls", (req, res) => {
  
  if (!req.session.userID) {
    res.send("Error: You are not logged in");
  } else {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.userID};
    
    res.redirect('/urls/');
  }  // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  // console.log(longURL)
 
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete',(req,res) => {
  if (!req.session.userID) {
    res.status(400).send("Please log in");
  }
  let sURL = req.params.shortURL;

  delete urlDatabase[sURL];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  if (!req.session.userID) {
    res.status(400).send("Please log in");
  }
  
  const userURL = urlsForUser(req.session.userID, urlDatabase);
 
  // if for the specific id in filteredURLS does not exist, throw error
  if (!userURL[req.params.id]) {
    res.status(400).send("URL does not exist");
  }

  let longURL = req.body.longURL;
  let sURL = req.params.id;

  urlDatabase[sURL] = {longURL: req.body.longURL, userID: req.session.userID};
  
  res.redirect('/urls/');
});

app.post('/login', (req,res) => {
  //take users and look for field that matches the email we have
  let username = req.body['email'];
  let pass = req.body['password'];
 
  // const result = bcrypt.compareSync(pass, users[key]['password']);

  for (const key in users) {
    if (username === users[key]['email'] && bcrypt.compareSync(pass, users[key]['password'])) {
      // res.cookie("user_id",key);
      
      req.session.userID = key;
      return res.redirect('/urls/');
    }
  }

  if (!getUserByEmail(req)) {
    return res.status(403).send('Email not found');
  } else {
    return res.status(403).send('incorrect password');
  }
 
});

app.post('/logout', (req,res) => {
  // res.clearCookie('user_id');
  req.session = null;
  res.redirect('/urls/');
});
app.post('/register', (req,res) => {
  
  let password = req.body['password'];
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (getUserByEmail(req.body['email'],users)) {
    return res.status(400).send('Bad Request');
  }
  let randomID = generateRandomString();
  users[randomID] = {'id': randomID, 'email': req.body['email'], 'password':hashedPassword};

  
  req.session.userID = randomID;
  res.redirect('/urls/');
});

const  generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  let shortURL = [];
  for (let i = 0; i < 6; i++) {
    shortURL.push(characters[Math.floor(Math.random() * 62)]);
  }
  shortURL = shortURL.join('');
  
  return shortURL;
};



const urlsForUser = function(id) {
  const userData = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key]['userID'] === id) {
      userData[key] = {longURL:urlDatabase[key]['longURL'], userID: urlDatabase[key]['userID']};
    }
  }
  return userData;
};

