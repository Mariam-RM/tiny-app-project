var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')
//bcrypt info
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
//cookie-sessions set up;
// var cookieSession = require('cookie-session')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1','key2'],
}))


// app.set("view engine", "ejs");
// // const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({extended: true}));

// //cookie parser info
// var cookieParser = require('cookie-parser')
// app.use(cookieParser())

// //bcrypt info
// const bcrypt = require('bcrypt');

// //cookie-sessions set up;
// var cookieSession = require('cookie-session')
// app.use(cookieSession({
//   name: 'session',
//   keys: ['key1','key2'],
// }))

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
      return users[user_id].id;
    }
  }
  return false;
}

// function to return the user _id object (user_id, email and password) related to a given email
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

  let templateVars = { urls: urlDatabase,
    userID: users,
    user_id: req.session.user_id
  };


  res.render("urls_login", templateVars);
  console.log("loging in")
});


// route to go to new page where new urls are added
app.get("/urls/new", (req, res) => {

  let templateVars = { urls: urlDatabase,
    userDB: users,
    user_id:req.session.user_id
  };

    if(!templateVars.user_id){
    res.redirect("/urls/login");
  } else {
    res.render("urls_new", templateVars);
    console.log("going to new url input page");
  }


});


//route to page that displays single url and its shortened form // only works after registered but if log in and out - give me issues
app.get("/urls/:id", (req, res) => {

let shortkey = req.params.id;
const user = req.session.user_id;
// let longURL = urlDatabase[shortkey].longURL;

  // let templateVars = { shortkey: shortkey,
  //   // longURL: longURL,
  //   urls : urlDatabase,
  //   userDB: users,
  //   user_id:req.cookies["user_id"]
  // };

  // if(templateVars.user_id ==! urlDatabase[shortkey].user_id){
  //   res.send("Error - can only edit own entires");
  //   // res.redirect("/urls/login")
  // } else {
  // let longURL = urlDatabase[shortkey].longURL
  // res.render("urls_show", templateVars);
  // }

  if (!user){
    res.send("ERROR: User must be logged in to access edit feature");
  } else {

       let templateVars = { shortkey: shortkey,
      // longURL: longURL,
      urls : urlDatabase,
      userDB: users,
      user_id:req.session.user_id
    };


    let longURL = urlDatabase[shortkey].longURL;
    res.render("urls_show", templateVars);


  }



//   if (user && urlDatabase[shortkey].user_id === user.id){

//     let templateVars = { shortkey: shortkey,
//       // longURL: longURL,
//       urls : urlDatabase,
//       userDB: users,
//       user_id:req.cookies["user_id"]
//     };


//     let longURL = urlDatabase[shortkey].longURL;
//     res.render("urls_show", templateVars);
//      }
//   } else {
//   res.send("ERROR: user can only edit own url entries")
// }

// console.log("user: ", user);
// console.log("user.id ", user.id)
// console.log("urldb.. ", urlDatabase[shortkey].user_id )

 //   let shortkey = req.params.id;
 // const user = req.cookies["user_id"];

 // if (!user){
 //  res.send("ERROR: User must be logged in to access delete feature")
 // } else if (user && urlDatabase[shortkey].user_id === user){
 //  delete urlDatabase[shortkey];
 //  res.redirect("/urls");
 // } else {
 //  res.send("ERROR: user can only delete own url entries")
 // }



  // console.log("")

  // res.render("urls_show", templateVars);
});

// post route that sends info from update page to get you back to /urls
app.post("/urls/:id", (req,res) => {

  let shortkey = req.params.id;
  const user = req.session.user_id// not sure if this is really necessary at this point
  // let originalLongURL = urlDatabase[shortkey].longURL;
  // const newLongURL = req.body.longURL

     const newLongURL = req.body.longURL;
      urlDatabase[shortkey].longURL = newLongURL;
      res.redirect("/urls")


      console.log("updated urlDB: ", urlDatabase);
  // if (user){

  //   if (urlDatabase[shortkey].user_id === user.id) {
  //     const newLongURL = req.body.longURL;
  //     urlDatabase[shortkey].longURL = newLongURL;
  //     res.redirect("/urls")

        // // const { longURL } = req.body;
        // urlDB[id].url = longURL;
        // res.redirect('/urls');
  //   } else {
  //     res.send("Users can only edit their own URL");
  //   }
  // } else {
  //   res.send("Not authorized");
  // }


  // console.log(req.body)
  //  let templateVars = { urls: urlDatabase,
  //   shortkey: req.params.id,
  //   longURL: urlDatabase[req.params.id],
  //  user_id:req.cookies["user_id"]
  // };

  //  if(!templateVars.user_id){
  //   res.render("urls_login", templateVars);
  // } else {
  //   res.render("urls_new", templateVars);
  // }


  // const user = users[req.session.userId];
  // if (user) {
  //   if (urlDB[id].userId === user.id) {
  //     const { longURL } = req.body;
  //     urlDB[id].url = longURL;
  //     res.redirect('/urls');
  //   } else {
  //     res.status(403).send("User does not own the URL");
  //   }
  // } else {
  //   res.status(401).send("Not authorized");
  // }


  // //  let templateVars = {
  // //   shortkey: shortkey,
  // //   originalLongURL: urlDatabase,
  // //  user_id:req.cookies["user_id"]
  // // };


  // res.redirect("/urls") //templateVars)
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


//url handler to pass URL data to template
app.get("/urls", (req, res) => {

 const user = users[req.session.user_id];



 if (user){

    let templateVars = { urls: urlDatabase,
    userDB: users,
    user_id:req.session.user_id
    };


    console.log("checking what exactly userparambody are ", user)

    res.render("urls_index", templateVars);


  } else {
    res.send("Please log in to view your urls")
 };



 // function returnUsersUrl(id){



 // }


//   let templateVars = { urls: urlDatabase,
//     userDB: users,
//     user_id:req.session.user_id
// };

//   res.render("urls_index", templateVars);
});

// route that posts information to urls page from new page form --! currently rendering to urls_show.ejs
app.post("/urls", (req, res) => {

  longURL = req.body.longURL;
  let shortkey = generateRandomString();
  const user_id = req.session.user_id;

  urlDatabase[shortkey] = {
    shortkey : shortkey,
    longURL: longURL,
    user_id: user_id//req.session.user_id// adds associated userID key to urlDB
  } ;//adds new key-value to DB

  console.log("url DB thats posts from new page form", urlDatabase)

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
 const user = req.session.user_id

 if (!user){
  res.send("ERROR: User must be logged in to access delete feature")
 } else {//if (user && urlDatabase[shortkey].user_id === user){
  delete urlDatabase[shortkey];
  res.redirect("/urls");
 } //else {
  //res.send("ERROR: user can only delete own url entries")
 //}

 // delete urlDatabase[shortkey];


// app.delete('/urls/:id/delete', (req, res) => {
//   const { userId } = req.session;
//   const { id } = req.params;

//   if (!userId) {
//     res.status(401).send("User has to be logged in");
//   } else if (userId && urlDB[id].userId === userId) {
//     delete urlDB[id];
//   } else {
//     res.status(403).send("User does not own the URL");
//   }
//   res.redirect('/urls');
// });


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

      // console.log("passwords a match!, " , User_id)
    } else {
      res.send("Error 403 - Password Incorrect")
    }

  }

   // // let name = req.body.username;
 // // res.cookie("username", name);
 //  const email = req.body.email;
 //  let user_id = findUserID(email);
 //    res.cookie("user_id", user_id)
 //    res.redirect("/urls");

//     bcrypt.compareSync(enteredPassword, hashPass);
//  //  // res.cookie("username", name);
//  //  res.redirect("/urls");

//  bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword); // returns true
// bcrypt.compareSync("pink-donkey-minotaur", hashedPassword); // returns fals



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

  //     // console.log("user login info :", user_id)
  //     // console.log(res.cookie("user_id", user_id))
  //   }
  // }

  // console.log("can we login?")

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

    console.log(users)
    res.redirect("/urls")

    // console.log("users db after new registration ", users);
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
