var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');

//bcrypt info
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1','key2'],
}));

//intial DB

const urlDatabase = {
  "b2xVn2": {
    shortKey: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
    },
  "9sm5xK": {
    shortKey: "9sm5xK",
    longURL: "http://www.google.com",
    userId: "userRandomId"
    }
};


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// function to genereate random string that will become shortKey
function generateRandomString() {
 const randomString = Math.random().toString(36).replace('0.', "")
 const shortKey = randomString.substring(0,6);
 return shortKey
};

//function to check if user exists (by seeing if email present in db)
function isUserEmailPresent(email){
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId].id;
    }
  }
  return false;
};

// function to return the user _id object related to a given email
function findUserID(email){
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId].id;
    }
  }
  return false;
};

//function to return the associated password to a given email
function returnAssociatedPassword(email){
  for (const userId in users){
    if (users[userId].email === email){
      return users[userId].password;
    }
  }
  return false;
};

//function to edit url so it works regardless of what it starts with
function editURL(url){
  if (url.startsWith('https://') || url.startsWith('http://')){
    return url;
  } else {
    return 'https://' + url;
  }
};

function returnMatchingURL(id){ //function to return matching posts to user
  var url = [];
  for (shortKey in urlDatabase){
    url.push(urlDatabase[shortKey]);
  }
  let matchingURL = url.filter(function(entryinfo) {
  return entryinfo.userId === id ;
  });
  return matchingURL;
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  const user = req.session.userId;
  if(user){
    res.redirect("/urls")
  } else {
    res.redirect("/urls/login")
  }
});

// route that gets the registration page
app.get("/urls/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userDB: users,
    userId:req.session.userId
  };
  res.render("urls_register", templateVars);
});


//route that gets you to the login page
app.get("/urls/login", (req, res) => {
  const user = req.session.userId;
  if (!user){
    const templateVars = {
      urls: urlDatabase,
      usersID: users,
      userId: user,
    };
    res.render("urls_login", templateVars);
  } else {
    res.redirect("/urls");
  }
});


// route to go to new page where new urls are added
app.get("/urls/new", (req, res) => {
  const user = users[req.session.userId];
    if(!user){
    res.redirect("/urls/login");
    } else {
      const email = users[req.session.userId].email
      const templateVars = {
        urls: urlDatabase,
        userDB: users,
        userId:req.session.userId,
        email: email
      };
    res.render("urls_new", templateVars);
  }
});

//route to page that displays single url and its shortened form // only works after registered but if log in and out - give me issues
app.get("/urls/:id", (req, res) => {
  const shortKey = req.params.id;
  const user = req.session.userId;
  if ( !urlDatabase[shortKey]){
    res.send("url does not exist in database");
      console.log("testing error message")
  } else {
    if (!user){
      res.send("ERROR: User must be logged in to access edit feature");
    } else if ( urlDatabase[shortKey].userId !== user){
      res.send("ERROR: can only edit user's registered urls")
    } else if (urlDatabase[shortKey].userId === user){
      const longURL = urlDatabase[shortKey].longURL;
      const email = users[user].email;
      const templateVars = {
        shortKey: shortKey,
        longURL: longURL,
        urls : urlDatabase,
        userDB: users,
        userId:req.session.userId,
        email: email
      };
      res.render("urls_show", templateVars);
   } else {
      console.log("testing error message")
    }
  }
});

// post route that sends info from update page to get you back to /urls
app.post("/urls/:id", (req,res) => {
  const shortKey = req.params.id;
  const user = req.session.userId;
  const newLongURL = req.body.longURL;

  urlDatabase[shortKey].longURL = newLongURL;
  res.redirect("/urls");
});

//url handler to pass URL data to template
app.get("/urls", (req, res) => {
 const user = req.session.userId ;
 if (user){
    const email = users[user].email;
    const templateVars = {
      urls: urlDatabase,
      userDB: users,
      matchingURL: returnMatchingURL(user),
      userId:req.session.userId,
      email: email
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("Please log in to view your urls")
  };
});

// route that posts information to urls page from new page form --! currently rendering to urls_show.ejs
app.post("/urls", (req, res) => {
  longURL = req.body.longURL;
  const shortKey = generateRandomString();
  const userId = req.session.userId;
  urlDatabase[shortKey] = {
    shortKey : shortKey,
    longURL: longURL,
    userId: userId
  } ;//adds new key-value to DB
  res.redirect('/urls/' + shortKey)   //redirects to url page
});

// route that allows you to go to the actual url associated with the randomly generated shortKey
app.get("/u/:shortURL", (req, res) => {
  let longURL = editURL(urlDatabase[req.params.shortURL].longURL);
  res.redirect(longURL);
});

//route that allows you to delete things from /url page
app.post("/urls/:id/delete",(req,res) => {
 const shortKey = req.params.id;
 const user = req.session.userId
 if (!user){
  res.send("ERROR: User must be logged in to access delete feature")
 } else {
  delete urlDatabase[shortKey];
  res.redirect("/urls");
 }
});

// post that handles info from login form now on login page
app.post("/login", (req,res) =>{
  const enteredPassword = req.body.password;
  const email = req.body.email;
  const hashPass = returnAssociatedPassword(email);
  if ( !isUserEmailPresent(email)){
    res.send("Error 403 - User Not found")
  } else {
    if (bcrypt.compareSync(enteredPassword, hashPass)){
      userId = findUserID(email);
      req.session.userId = userId ;
      res.redirect("/urls");
    } else {
      res.send("Error 403 - Password Incorrect")
    }
  }
});

// post that handles logout action from logout button in header
app.post("/logout", (req,res) =>{
 const userId = req.body.login
 req.session.userId = userId;
 req.session = null;
 res.redirect("/urls");
});

//post that allows us to register new users into the users object
app.post("/register", (req,res) =>{
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const emailAlreadyExist = isUserEmailPresent(email) //ie: user already registered
  if ( !email || !password ){
    res.send("error : 400 - Bad Request Error - invalid field entry");
  }
  if (!emailAlreadyExist && email && password){
    const userId =  generateRandomString();
    users[userId] = {
      id: userId,
      email: email,
      password: hashedPassword
    };
    req.session.userId = userId;
    res.redirect("/urls");
  } else {
    res.send("error : 400 - Bad Request Error - email already registered")
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});