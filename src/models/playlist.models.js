import mongoose ,{Schema} from "mongoose";



const playlistSchema =new Schema(
    {
        name :{
            type:String,
            required:true,
        }
,

description :{
    type:String,
    required:true,  }
    ,

    ownerId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

    video :[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video",        
        required:true,

    }
    ]
    

}
,
    
    {timestamps:true});





export const Playlist = mongoose.model("Playlist",playlistSchema);