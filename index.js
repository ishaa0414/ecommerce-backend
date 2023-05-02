// const express=require("express");
import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {auth} from "./auth.js";
const app=express();
const PORT=9090;
app.use(express.json());
app.use(cors());

const MONGOURL="mongodb://0.0.0.0:27017/"
const connectDB=async()=>{
    try {
        const client=new MongoClient(MONGOURL)
        await client.connect();
        console.log("MongoDb connected");
        return client;
    } catch (error) {
        console.log(error.message)
    }
}

const client=await connectDB();




app.get("/",(req,res)=>{
    res.send("hello world")
})

app.post("/mobile",async(req,res)=>{
    const mobiles=req.body;
    const result=await client.db("mobilecom").collection("mobiles").insertMany(mobiles);
    res.send(result);
})
app.get("/mobile",async(req,res)=>{
    const mobiles=await client.db("mobilecom").collection("mobiles").find().toArray();
    res.send(mobiles);
})
app.get("/cart",auth,async(req,res)=>{
    const mobiles=await client.db("mobilecom").collection("cart").find().toArray();
    res.send(mobiles);
});


app.put("/cart",async(req,res)=>{
    const mobile=req.body;
    const {type}=req.query;
    const isExist= await client
    .db("mobilecom")
    .collection("cart")
    .findOne({_id:mobile._id});

    if(isExist){
        if(type==="decrement"&& isExist.qty<=1){
            client.db("mobilecom")
            .collection("cart")
            .deleteOne({_id:mobile._id});
        }else{
            client.db("mobilecom")
            .collection("cart")
            .updateOne({_id:mobile._id},{$inc:{qty:type==="increment"?+1:-1}});
        }
    }
    else{
        client.db("mobilecom")
        .collection("cart")
        .insertOne({...mobile,qty:1});
    }

    const cart=await client.db("mobilecom").collection("cart").find().toArray();
    res.send(cart);

})
app.post("/signup",async(req,res)=>{
    const {email,password}=req.body;
    const isExist=await client.db("mobilecom").collection("user").findOne({email});
    if(isExist){
        res.send({"msg":"email already exist"});
        return;
    }
const salt=await bcrypt.genSalt(10);
const hashpassword=await bcrypt.hash(password,salt);
console.log(email,hashpassword);
const newuser={
    "email":email,
    "password":hashpassword
}
const result= await client.db("mobilecom").collection("user").insertOne(newuser);
res.send({"msg":"Signup successful"});
})
app.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    const isExist=await client.db("mobilecom").collection("user").findOne({email}); 
    if(!isExist){
        res.send({"msg":"User does not exist"});
    }
    const passwordCheck=bcrypt.compare(password,isExist.hashpassword);
    if(!passwordCheck){
        res.send({"msg":"credentials invalid"})
    }
   const token=jwt.sign(isExist,"MySecret");
   res.send({"msg":"login successful",token});



})
app.listen(PORT,()=>{
    console.log("server  is running")
})