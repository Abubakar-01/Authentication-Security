
require('dotenv').config()
const express=require("express");
const ejs=require("ejs")
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const session =require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const LocalStrategy = require('passport-local');

const app=express();

app.use(express.static("public"))
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: 'Our little secret bro.',
    resave: false,
    saveUninitialized: false,
  }))

  app.use(passport.initialize());
  app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB?directConnection=true&serverSelectionTimeoutMS=2000").
then(value=>{if(value){console.log("connected to database");}else{console.log("Not connected");}})
.catch(err=>{console.log(err);})

const userSchema=new mongoose.Schema({
    email: String,
    password:String
});

userSchema.plugin(passportLocalMongoose)
const User= mongoose.model("User",userSchema);
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
    res.render("home");
})
app.get("/login",function(req,res){
    res.render("login");
})
app.get("/register",function(req,res){
    res.render("register");
})
app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets")
    }
    else{
        res.redirect("/login")
    }
});
app.post("/register",function(req,res){
User.register({username: req.body.username},req.body.password,function(err,user){
if(err){
    console.log(err);
    res.redirect("/register")
}
else{
    passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets")
    })
}
})
})
app.post("/login",function(req,res){
    const user = new User({
        username: req.body.username,
        password:req.body.password
    })
    req.login(user, function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets")
        })
    }
})
})
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
})
app.listen(3000,function(req,res){ 
    console.log("Server started on port 3000");
})