import asyncHandler from 'express-async-handler';
import {ApiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadImageToCloudinary, uploadOnClodinary} from '../utils/cloudinary.js';
import { use } from 'react';
import Apiresponse from '../utils/ApiResponse.js';
import {jwt } from 'jsonwebtoken';


const registerUser = asynchHandle( async (req,res) => {


    // 1. Get user details from req.body
    // 2. Validate that all fields are provided
    // 3. Check if user with given email or username already exists
    // 4. Upload avatar and cover image to cloudinary
    // 5. Create new user in the database
    // 6. Return success response with created user details (excluding password)


const {fullName,email,password,username} = req.body;

if(

[fullName,username,password,email].some((field) =>{
    field?.trim() === ""
})

)
{

    throw new ApiError(400,"All fields are required");


}



const existedUser = await  User.findOne({

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


const generateAcessAndRefreshTokens = async (userId)  => {

try{

const user = await User.findById(userId);

const accessToken = user.generateAccessToken();

const refreshToken = user.generateRefreshToken(); 

user.refreshToken = refreshToken;
await user.save({validiteBeforeSave : false});

return { accessToken, refreshToken };

}
catch(error){
    throw new ApiError(500,"Token generation failed, please try again");
}



}


const loginUser = asyncHandler(async (req,res) => {

//  1. Get email and username from req.body
// 2. Validate that email or username are provided
// 3. Find the user by email or username
// 4. If user not found, throw error
// 5. Compare provided password with stored hashed password
// 6. If password does not match, throw error
// 7. Generate access token and refresh token
// 8. send cookie

const {email,username,password} = req.body;

if(!(email || username)){
    throw new ApiError(400,"Email or Username is required");
}


const user = await User.findOne({

    $or : [ { email }, { username } ]

})

if(!user){
    
        throw new ApiError(404,"User not found with given email or username");
    }



     const isPasswordValid =   await user.isPasswordCorrect(password)

        if(!isPasswordValid){           
            throw new ApiError(401,"Invalid password");
        }

 const {accessToken,refreshToken} = await generateAcessAndRefreshTokens(user._id)


const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

const options = {
    httpOnly : true,
    secure : true}


return res.status(200).cookie("refreshToken",refreshToken,options).cookie("accessToken",accessToken,options).json(new Apiresponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged in successfully"));                    




}
)


const logOutUser = asyncHandler( async (req,res) => {



 await User.fndByIdandUpdate(req.user._id,{ $set : {refreshToken:null }},{next : true},{validiteBeforeSave:false})

const options = {
    httpOnly : true,
    secure : true}

    return res.status(200).clearCookie("refreshToken",options).clearCookie("accessToken",options).json(new Apiresponse(200,null,"User logged out successfully"));                    


})


const refreshAccessToken = asyncHandler( async (req,res) => {

   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
    throw new ApiError(401,"Refresh token is required");
   }

jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)


const user = await User.findById(decodedToken?._id);

if(!user){
    throw new ApiError(404,"invalid refresh token - User not found");
}


if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(401,"Invalid refresh token - Token mismatch");
}

const options = {
    httpOnly : true,
    secure : true}

   const {accessToken,refreshToken} =  await generateAcessAndRefreshTokens(user._id);

    return res.status(200).cookie("refreshToken",refreshToken,options).cookie("accessToken",accessToken,options).json(new Apiresponse(200,{accessToken,refreshToken : newRefreshToken },"Access token refreshed successfully"));



})


export { registerUser ,loginUser,logOutUser,refreshAccessToken};