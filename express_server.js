var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//cookie parser info
var cookieParser = require('cookie-parser')
app.use(cookieParser())

// var express = require("express");
// var app = express();
// var PORT = 8080; // default port 8080
// var cookieParser = require('cookie-parser')

// app.use(cookieParser())


// function to genereate random string that will become shortkey
function generateRandomString() {
 let randomString = Math.random().toString(36).replace('0.', "")

 let shortkey = randomString.substring(0,6);
 return shortkey
};

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//url handler to pass URL data to template
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
  username: req.cookies["username"]
};

  res.render("urls_index", templateVars);
});

// route to go to new page where new urls are added
app.get("/urls/new", (req, res) => {

  let templateVars = { urls: urlDatabase,
   username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});


//route to page that displays single url and its shortened form
app.get("/urls/:id", (req, res) => {

let shortkey = req.params.id

  let templateVars = { shortkey: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
};

  res.render("urls_show", templateVars);
});



// route that posts information to urls page from new page form --! currently rendering to urls_show.ejs
app.post("/urls", (req, res) => {

  longURL = req.body.longURL;
  shortkey = generateRandomString();

  urlDatabase[shortkey] = longURL; //adds new key-value to DB

  console.log(urlDatabase)

  res.redirect('http://localhost:8080/urls/' + shortkey)   //redirects to url page
});


// route that allows you to go to the actual url associated with the randomly generated shortkey
app.get("/u/:shortURL", (req, res) => {

  let longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});


//route that allows you to delete things from /url page
app.post("/urls/:id/delete",(req,res) => {
 let shortkey = req.params.id;

 delete urlDatabase[shortkey];
 res.redirect("/urls")
});

// post route that sends info from update page to get you back to /urls
app.post("/urls/:id", (req,res) => {

  let shortkey = req.params.id;

  // console.log(req.body)
  res.redirect("/urls")
  // const shortKey = req.params.id;
  // const LongURL = req.body.longURL;

  // let templateVars = { urls: urlDatabase,
  //  user_id:req.cookies["user_id"]
  // };

  //  // urlDatabase[shortKey].longURL = LongURL;

  // if(!templateVars.user_id){
  //   res.send("Error - can only update if logged in");
  //   // res.redirect("/urls/login")
  // } else {
  //   urlDatabase[shortKey].longURL = LongURL;
  //   res.redirect("/urls", templateVars);
  // }
});

// post that handles info from login form in header
app.post("/login", (req,res) =>{

 let name = req.body.username;
 res.cookie("username", name);


  // res.cookie("username", name);
  res.redirect("/urls");



// let username = req.body.username

// const email = req.body.email;
// const password = req.body.password;

// if ( !isUserEmailPresent(email)){
//   res.send("Error 403 - User Not found")
// } else {
//   let checkpassword = isPasswordCorrect(email);
//   if (checkpassword !== password){
//     res.send("Error 403 - Password Incorrect");
//   } else {
//     user_id = findUserID(email);
//     res.cookie("user_id", user_id)
//     res.redirect("/urls");
//   }
// }

});

// post that handles logout action from logout button in header

app.post("/logout", (req,res) =>{



  const name = req.body.username
  res.cookie("username", name);
  res.clearCookie("username")
  res.redirect("/urls");


})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

