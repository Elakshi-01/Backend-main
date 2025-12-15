// require('dotenv').config({path : './.env'})
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import express from "express";

import connectdb from "./db/index.js";

const app = express();


connectdb()
.then( () => {

app.listen(process.env.PORT || 8000 , () => {
    console.log(`Server started at port ${process.env.PORT}`);
})


})
.catch( (error) => {
console.log("Error in DB connection", error);
})




















/*
;(async () => {


try{

await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

app.on("error", (error) => {
    console.log("Error in starting server");
    throw error;
})

app.listen(process.env.PORT, () => {

    console.log(`Server started at port ${process.env.PORT}`);
})
}

catch(error){
    console.log("Error in DB connection", error);
    throw error;
}


})()
*/