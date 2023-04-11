//jshint esversion:6
require('dotenv').config()
const express=require("express");
const ejs=require("ejs")
const bodyParser=require("body-parser");
const { log } = require("console");
const mongoose=require("mongoose");
const md5=require("md5");

const app=express();

app.use(express.static("public"))
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB?directConnection=true&serverSelectionTimeoutMS=2000").
then(value=>{if(value){console.log("connected to database");}else{console.log("Not connected");}})
.catch(err=>{console.log(err);})

const userSchema=new mongoose.Schema({
    email: String,
    password:String
});
const User= mongoose.model("User",userSchema);


app.get("/",function(req,res){
    res.render("home");
})
app.get("/login",function(req,res){
    res.render("login");
})
app.get("/register",function(req,res){
    res.render("register");
})
app.post("/register",function(req,res){
    const newUser=new User({
        email:req.body.username,
        password:md5(req.body.password)
    })
    newUser.save().then(value=>{
        if(value){
            console.log("User Registered");
            res.render("secrets")
    }})
        .catch(err=>{console.log(err);});
})
app.post("/login",function(req,res){
    const username=req.body.username
    const password=md5(req.body.password)
    User.findOne({email:username})
    .then(value=>{if(value){
        if(value.password==password){
            res.render("secrets")
        }
    }})
    .catch(err=>{console.log(err);})
})

app.listen(3000,function(req,res){ 
    console.log("Server started on port 3000");
})