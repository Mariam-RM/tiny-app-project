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

//function to check if user exists (by seeing if email present in db)
function isUserEmailPresent(email){

  for (const user_id in users) {
    if (users[user_id].email === email) {
      return users[user_id];
    }
  }
  return false;
}

// function to return the user _id object (user_id, email and password) related to a given email
function findUserID(email){

  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
      // return users[userId].;
    }
  }
  return false;
}

//function to return the associated password to a given email
function isPasswordCorrect(email){


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

// route that gets the registration page
app.get("/urls/register", (req, res) => {

  let templateVars = { urls: urlDatabase,
    userDB: users,
    user_id:req.cookies["user_id"]
  };

  res.render("urls_register", templateVars);
  console.log("going to registration page")
});


//route that gets you to the login page

app.get("/urls/login", (req, res) => {

  let templateVars = { urls: urlDatabase,
    userDB: users,
    user_id:req.cookies["user_id"]
  };

  res.render("urls_login", templateVars);
  console.log("can we login now?")
});


// route to go to new page where new urls are added
app.get("/urls/new", (req, res) => {

  let templateVars = { urls: urlDatabase,
    userDB: users,
    user_id:req.cookies["user_id"]
  };

    if(!templateVars.user_id){
    res.render("urls_login", templateVars);
  } else {
    res.render("urls_new", templateVars);
  }


});


//route to page that displays single url and its shortened form
app.get("/urls/:id", (req, res) => {

let shortkey = req.params.id
let newlongURL = urlDatabase[shortkey].longURL

  let templateVars = { shortkey: shortkey,
    longURL: newlongURL,
    userDB: users,
    user_id:req.cookies["user_id"]
  };

  // console.log("")

  res.render("urls_show", templateVars);
});

//url handler to pass URL data to template
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
    userDB: users,
    user_id:req.cookies["user_id"]
};

  res.render("urls_index", templateVars);
});

// route that posts information to urls page from new page form --! currently rendering to urls_show.ejs
app.post("/urls", (req, res) => {

  longURL = req.body.longURL;
  let shortkey = generateRandomString();


    // users[user_id] = {
    //   id: user_id,
    //   email: email,
    //   password: password
    // };

  urlDatabase[shortkey] = {
    shortkey : shortkey,
    longURL: longURL,
    user_id: "userid"
  } ;//adds new key-value to DB

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
  let newlongURL = urlDatabase[shortkey],longURL;


  // console.log(req.body)
  //  let templateVars = { urls: urlDatabase,
  //   shortkey: req.params.id,
  //   longURL: urlDatabase[req.params.id],
  //  user_id:req.cookies["user_id"]
  // };

   let templateVars = {
    shortkey: shortkey,
    newlongURL: urlDatabase,
   user_id:req.cookies["user_id"]
  };


  res.redirect("/urls") //templateVars)
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

// post that handles info from login form now on login page
app.post("/login", (req,res) =>{

 // // let name = req.body.username;
 // // res.cookie("username", name);
 //  const email = req.body.email;
 //  let user_id = findUserID(email);
 //    res.cookie("user_id", user_id)
 //    res.redirect("/urls");


 //  // res.cookie("username", name);
 //  res.redirect("/urls");



// let username = req.body.username

  const email = req.body.email;
  const password = req.body.password;

  if ( !isUserEmailPresent(email)){
    res.send("Error 403 - User Not found")
  } else {
    let checkpassword = isPasswordCorrect(email);
    if (checkpassword !== password){
      res.send("Error 403 - Password Incorrect");
    } else {
      user_id = findUserID(email);
      res.cookie("user_id", user_id)
      res.redirect("/urls");
    }
  }

  // console.log("can we login?")

});

// post that handles logout action from logout button in header

app.post("/logout", (req,res) =>{

 const user_id = req.body.login
  res.cookie("user_id", user_id);
  res.clearCookie("user_id")
  res.redirect("/urls");

})

//post that allows us to register new users into the users object
app.post("/register", (req,res) =>{

  const email = req.body.email;
  const password = req.body.password;

  const emailAlreadyExist = isUserEmailPresent(email) //ie: user already registered


  if ( email === "" || password === ""){
    res.send("error : 400 - Bad Request Error - invalid field entry");
  }

  if (!emailAlreadyExist){
    let user_id =  generateRandomString();
    users[user_id] = {
      id: user_id,
      email: email,
      password: password
    };
    res.cookie("user_id", user_id);
    res.redirect("/urls")

    console.log(users);
    // console.log([user_id].email);
    // console.log(user_id)
    // console.log(users[user_id])

  } else {
    res.send("error : 400 - Bad Request Error - email already registered")
  }


  //   if (!userExists) {
  //   const id = uuidv4();
  //   users[id] = {id, email, password: bcrypt.hashSync(password, 10)};
  //   req.session.userId = id;
  //   res.redirect('/urls');
  // } else {
  //   res.status(400).send("User already exists");


  // let user_id = generateRandomString();

  // res.cookie("user_id", user_id)

  // if ( email === "" || password === ""){
  //   res.send("error : 400 - Bad Request Error - invalid field entry");
  // } else if (isUserEmailPresent(email)){
  //   res.send("error : 400 - Bad Request Error - email already registered")
  // } else {
  //     let userObject = {
  //     id : user_id,
  //     email : email,
  //     password: password
  //     }
  //    users[user_id] = userObject;
  //    res.redirect("/urls");
  //   }


    // console.log(users);
    // console.log([user_id]);
    // console.log(user_id)
    // console.log(users[user_id])

    // const name = req.body.username
    // res.cookie("username", name);
    // res.clearCookie("username")
    // res.redirect("/urls");


})




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

  // const email = req.body.email;
  // const password = req.body.password;

  // let user_id = generateRandomString();

  // res.cookie("user_id", user_id)

  // if ( email === "" || password === ""){
  //   res.send("error : 400 - Bad Request Error - invalid field entry");
  // } else if (isUserEmailPresent(email)){
  //   res.send("error : 400 - Bad Request Error - email already registered")
  // } else {
  //     let userObject = {
  //     id : user_id,
  //     email : email,
  //     password: password
  //     }
  //    users[user_id] = userObject;
  //    res.redirect("/urls");
  //   }
