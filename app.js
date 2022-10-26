const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");



const serverConfig = require("./src/config/serverConfig");
const dbConfig = require("./src/config/dbConfig");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));


app.use(
    session({
      secret: "We have to remember this for future reference",
      resave: false,
      saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(dbConfig.DB_URL);

const User = require('./src/model/user.model');


passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});


async function init() {
  await User.collection.drop();
  const userObj = {
    email: "abc@gmail.com",
    password: "myPassword",
  };

  let user = await User.create(userObj);
  console.log(user);
}
// init();

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/secrets", (req, res) => {

    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login")
    }
});

app.get('/logout', function(req, res, next) {

    req.logout(function(err) {
      if (err) { 
        return next(err); 
        }
      res.redirect('/');
    });
});

app.post("/register",  (req, res) => {

    User.register({username : req.body.username}, req.body.password, (err, user) => {

        if(err){
            console.log(err)
            res.redirect("/register")
        }else{
            res.redirect("/login")
        }
    })
});

app.post("/login",  (req, res) => {

    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    req.login(user, (err) => {

        if(err){
            console.log(err);
            res.redirect("/login")
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    })
});

app.listen(serverConfig.PORT, () => {
  console.log("App is Runing at Port:  " + serverConfig.PORT);
});
