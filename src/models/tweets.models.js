import mongoose ,{Schema} from "mongoose";



const tweetsSchema =new Schema(
    {
content :{  
            type:String,
            required:true,
        }
,
ownerId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    

}
,
    
    {timestamps:true});





export const Tweets = mongoose.model("Tweets",tweetsSchema);