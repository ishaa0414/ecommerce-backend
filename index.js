// const express=require("express");
import express from 'express';
import { MongoClient } from 'mongodb';
// const MONGOURL='mongodb://localhost'
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


const app=express();
const PORT=9090;


app.get("/",(req,res)=>{
    res.send("hello world")
})

app.post("/mobile",async(req,res)=>{
    const mobiles=req.body;
    const result=await client.db("mobilecom").collection("mobiles").insertMany(mobiles);
    res.send(result);
})
app.get("/mobile",async(req,res)=>{
    const mobiles=await client.db("mobilecom").collection("mobiles").find();
    res.send(mobiles);
})
app.listen(PORT,()=>{
    console.log("server  is running")
})