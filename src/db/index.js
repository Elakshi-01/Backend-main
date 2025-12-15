import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectdb = async () => {

    try{

const connectionInstancev = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

console.log(`   MongoDB connected to ${connectionInstancev.connection.host} successfully`);



    }
catch(error){
    console.log("error",error);
    process.exit(1);
}


}


export default connectdb;