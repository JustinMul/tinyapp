const express = require("express");
const res = require("express/lib/response");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });
 
// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  
  res.render("urls_show", templateVars);
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


app.post('/urls/:shortURL/edit',(req,res) => {
  let sURL = req.params.shortURL;
  // console.log(sURL);

  // urlDatabase[sURL] = ;
  res.redirect('/urls/' + sURL);
});

app.post('/urls/:id', (req, res) => {
  //need to get to the key and then change the long id which is the value
  let longURL = req.body.longURL;
  let sURL = req.params.id;
  urlDatabase[sURL] = longURL;
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
