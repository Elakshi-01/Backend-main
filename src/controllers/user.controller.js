import asyncHandler from 'express-async-handler';
import {ApiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadImageToCloudinary, uploadOnClodinary} from '../utils/cloudinary.js';
import { use } from 'react';
import Apiresponse from '../utils/ApiResponse.js';

const registerUser = asynchHandle( async (req,res) => {


const {fullName,email,password,username} = req.body;

if(

[fullName,username,password,email].some((field) =>{
    field?.trim() === ""
})

)
{

    throw new ApiError(400,"All fields are required");


}



const existedUser = User.findOne({

   $or : [ { email }, { username } ] }
)


if(existedUser){
    throw new ApiError(409,"User with given email or username already exists");
}


const avatarLocalPath = req.file?.avatar[o]?.path;
const coverImageLocalPath = req.file?.coverImage[o]?.path;

if(!avatarLocalPath || !coverImageLocalPath){
    throw new ApiError(400,"Avatar and Cover Image are required");
}


const avatar=await uploadOnClodinary(avatarLocalPath);

const coverImage = await uploadOnClodinary(coverImageLocalPath);

if(!avatar || !coverImage){
    throw new ApiError(500,"Image upload failed, please try again");}




const user = await User.create({

fullName,
email,
password    ,
username: username.toLowerCase(),
avatar: avatar.url,
coverImage: coverImage.url

})


const createdUser  =await User.findbyId(user._id).select("-password -refreshToken");

if(!createdUser){
    throw new ApiError(500,"User creation failed, please try again");}


return res.status(201).json(new Apiresponse(201,createdUser,"User registered successfully"));


})


export { registerUser };