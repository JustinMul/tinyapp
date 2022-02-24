const express = require("express");
let cookieParser = require('cookie-parser');
const res = require("express/lib/response");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const { cookie } = require("express/lib/response");
const req = require("express/lib/request");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id]};
  
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render("url_login", templateVars);
});
app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render("url_registrationPage", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/' + shortURL);         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete',(req,res) => {
  let sURL = req.params.shortURL;
  delete urlDatabase[sURL];
  res.redirect('/urls');
});


// app.post('/urls/:shortURL/edit',(req,res) => {
//   let sURL = req.params.shortURL;
//   console.log(sURL);
//   res.redirect('/urls/' + sURL);
// });

app.post('/urls/:id', (req, res) => {
  let longURL = req.body.longURL;
  let sURL = req.params.id;
  urlDatabase[sURL] = longURL;
  res.redirect('/urls/');
});

app.post('/login', (req,res) => {
  //take users and look for field that matches the email we have
  let username = req.body['email'];
  let pass = req.body['password'];
  
  for (const key in users) {
    if (username === users[key]['email'] && pass === users[key]['password']) {
      res.cookie("user_id",key);
      return res.redirect('/urls/');
    }
  }

  if (!emailCheck(req)) {
    return res.status(403).send('Email not found');
  } else {
    return res.status(403).send('incorrect password');
  }
  // else if (emailCheck(req)) {
    
  //   if (passwordCheck(req)) {
      
  //     console.log('body', req.body);
  //     console.log('cookies',req.cookies)
  //     console.log('users', users);
  //     res.cookie("user_id",);
  //     return res.redirect('/urls/');
  //   }
  // }
});

app.post('/logout', (req,res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/');
});
app.post('/register', (req,res) => {
  
  if (emailCheck(req)) {
    return res.status(400).send('Bad Request');
  }
  let randomID = generateRandomString();
  users[randomID] = {'id': randomID, 'email': req.body['email'], 'password':req.body['password']};
  res.cookie("user_id",randomID);
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

const emailCheck = function(req) {
  for (const key in users) {
    if (req.body['email'] ===  users[key]['email']) {
      return true;
    }
  }
};

