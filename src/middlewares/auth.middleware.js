import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import jwt from "jsonwebtoken";
    import {User} from "../models/user.models.js";

export const verifyJWT = asyncHandler( async (req,res,next) => {
try{
const token =     req.cookies?.accessToken || req.headers?.authorization?.replace("Bearer ","")

if(!token){
    throw new ApiError(401,"Unauthorized access - No token provided");  
}


const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)



const user= await User.findById(decodedToken._id).select("-password -refreshToken")


if(!user){
    throw new ApiError(401,"Unauthorized access - User not found");  
}

req.user = user;

next();
}
catch(error){
throw new ApiError(401,"Unauthorized access - Invalid token");
}



}) 