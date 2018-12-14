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



// function to genereate random string that will become shortkey
function generateRandomString() {
 let randomString = Math.random().toString(36).replace('0.', "")

 let shortkey = randomString.substring(0,6);
 return shortkey
};

//function to check if user exists (by seeing if email present in db)
function isUserEmailPresent(email){

  for (const user_id in users) {
    if (users[user_id].email === email) {
      return users[user_id].id;
    }
  }
  return false;
}

// function to return the user _id object related to a given email
function findUserID(email){

  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId].id;
      // return users[userId].;
    }
  }
  return false;
}

//function to return the associated password to a given email
function returnAssociatedPassword(email){


  for (const userId in users){
    if (users[userId].email === email){
      return users[userId].password;
    }

  }
  return false

}


const urlDatabase = {
  "b2xVn2": {
    shortkey: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    user_id: "userRandomID"
    },
  "9sm5xK": {
    shortkey: "9sm5xK",
    longURL: "http://www.google.com",
    user_id: "userRandomId"
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
}


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {

  let user = req.session.user_id;

  if(user){
    res.redirect("/urls")
  } else {
    res.redirect("/urls/login")
  }

})

// route that gets the registration page
app.get("/urls/register", (req, res) => {

  let templateVars = { urls: urlDatabase,
    userDB: users,
    user_id:req.session.user_id
  };

  res.render("urls_register", templateVars);
  console.log("going to registration page")
});


//route that gets you to the login page

app.get("/urls/login", (req, res) => {

  user = req.session.user_id;

  if (!user){

    let templateVars = { urls: urlDatabase,
      userID: users,
      user_id: req.session.user_id,
    };
    res.render("urls_login", templateVars);

  } else {
    res.redirect("/urls");
  }

});


// route to go to new page where new urls are added
app.get("/urls/new", (req, res) => {

  const user = users[req.session.user_id];

    if(!user){
    res.redirect("/urls/login");

    } else {

    const email = users[req.session.user_id].email

      let templateVars = { urls: urlDatabase,
        userDB: users,
        user_id:req.session.user_id,
        email: email
      };

    res.render("urls_new", templateVars);

  }


});


//route to page that displays single url and its shortened form // only works after registered but if log in and out - give me issues
app.get("/urls/:id", (req, res) => {

  let shortkey = req.params.id;
  const user = req.session.user_id;

  if ( !urlDatabase[shortkey]){
    res.send("url does not exist in database");
      console.log("testing error message")
  } else {

    if (!user){
      res.send("ERROR: User must be logged in to access edit feature");
    } else if ( urlDatabase[shortkey].user_id !== user){
      res.send("ERROR: can only edit user's registered urls")
    } else if (urlDatabase[shortkey].user_id === user){
        let longURL = urlDatabase[shortkey].longURL;
      const email = users[user].email;

      let templateVars = { shortkey: shortkey,
        longURL: longURL,
        urls : urlDatabase,
        userDB: users,
        user_id:req.session.user_id,
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

  let shortkey = req.params.id;
  const user = req.session.user_id;

     const newLongURL = req.body.longURL;
      urlDatabase[shortkey].longURL = newLongURL;
      res.redirect("/urls");
});


//url handler to pass URL data to template
app.get("/urls", (req, res) => {

 const user = req.session.user_id ;


 function returnMatchingURL(id){ //function to return matching posts to user

  var url = [];

  for (shortkey in urlDatabase){
    url.push(urlDatabase[shortkey]);
  }

  var matchingURL = url.filter(function(entryinfo) {
  return entryinfo.user_id === id ;
  });

  return matchingURL;
 };


 if (user){

  const email = users[user].email;


    let templateVars = { urls: urlDatabase,
    userDB: users,
    matchingURL: returnMatchingURL(user),
    user_id:req.session.user_id,
    email: email
    };


    console.log("checking what exactly user[cookies] means when get urls", user)
    console.log("is email present?", users[req.session.user_id].email)
    res.render("urls_index", templateVars);


  } else {
    res.send("Please log in to view your urls")
 };

});

// route that posts information to urls page from new page form --! currently rendering to urls_show.ejs
app.post("/urls", (req, res) => {

  longURL = req.body.longURL;
  let shortkey = generateRandomString();
  const user_id = req.session.user_id;

  urlDatabase[shortkey] = {
    shortkey : shortkey,
    longURL: longURL,
    user_id: user_id
  } ;//adds new key-value to DB

  console.log("url DB thats posts from new page form", urlDatabase)

  res.redirect('http://localhost:8080/urls/' + shortkey)   //redirects to url page
});


// route that allows you to go to the actual url associated with the randomly generated shortkey
app.get("/u/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params.shortURL].longURL;

  res.redirect(longURL);

  console.log(longURL)
});


//route that allows you to delete things from /url page
app.post("/urls/:id/delete",(req,res) => {
 let shortkey = req.params.id;
 const user = req.session.user_id

 if (!user){
  res.send("ERROR: User must be logged in to access delete feature")
 } else {
  delete urlDatabase[shortkey];
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

      user_id = findUserID(email);

      console.log("passwords a match!, " , user_id)
      req.session.user_id = user_id ;


      res.redirect("/urls");

      console.log("passwords a match!, " , user_id)
    } else {
      res.send("Error 403 - Password Incorrect")
    }

  }

});

// post that handles logout action from logout button in header

app.post("/logout", (req,res) =>{

 const user_id = req.body.login
  req.session.user_id = user_id;
  req.session = null;
  res.redirect("/urls");

})

//post that allows us to register new users into the users object
app.post("/register", (req,res) =>{

  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const emailAlreadyExist = isUserEmailPresent(email) //ie: user already registered


  if ( email === "" || password === ""){
    res.send("error : 400 - Bad Request Error - invalid field entry");
  }

  if (!emailAlreadyExist){
    let user_id =  generateRandomString();

    users[user_id] = {
      id: user_id,
      email: email,
      password: hashedPassword
    };
    req.session.user_id = user_id;

    console.log("user object after register new user", users)
    res.redirect("/urls")


  } else {
    res.send("error : 400 - Bad Request Error - email already registered")
  }


})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

