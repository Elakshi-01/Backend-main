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



 await User.fndByIdandUpdate(req.user._id,{ $unset : {refreshToken:1}},{next : true},{validiteBeforeSave:false})

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



const changePassword = asyncHandler( async (req,res) => {

const {currentPassword,newPassword} = req.body;

const user = await User.findById(req.user?._id);

const isPasswordValid = await user.isPasswordCorrect(currentPassword);

if(!isPasswordValid){
    throw new ApiError(401,"Current password is incorrect");    

}

user.password = newPassword;
await user.save({validiteBeforeSave : false});

return res.status(200).json(new Apiresponse(200,null,"Password changed successfully")); 





})



const getCurrentUser = asyncHandler( async (req,res) => {

return res.status(200).json(new Apiresponse(200,req.user,"Current user fetched successfully"));


})


const updateAccountDetails = asyncHandler( async (req,res) => {

    const {fullName,email} = req.body;

    if(!fullName || !email){
        throw new ApiError(400,"Full name and email are required");
    }

    const user=await User.findByIdAndUpdate(req.user._id,{fullName,email:email},{new : true}).select("-password -refreshToken");
return res.status(200).json(new Apiresponse(200,user,"Account details updated successfully"));

})




const updateAvatar = asyncHandler( async (req,res) => {

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar image is required");
    }   
    const avatar = await uploadOnClodinary(avatarLocalPath);
    if(!avatar){
        throw new ApiError(500,"Avatar upload failed, please try again");
    }

    await User.findByIdAndUpdate(req.user._id, { $set:{avatar:avatar.url}},{new : true}).select("-password -refreshToken");

    return res.status(200).json(new Apiresponse(200,avatar.url,"Avatar updated successfully"));



})


const updateCoverImage = asyncHandler( async (req,res) => {

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"Avatar image is required");
    }   
    const coverImage = await uploadOnClodinary(coverImageLocalPath);
    if(!coverImage){
        throw new ApiError(500,"coverImage upload failed, please try again");
    }

    await User.findByIdAndUpdate(req.user._id, { $set:{coverImage:coverImage.url}},{new : true}).select("-password -refreshToken");

    return res.status(200).json(new Apiresponse(200,coverImage.url,"CoverImage updated successfully"));



})


const getChannelProfile = asyncHandler( async (req,res) => {

const {username} = req.params;

if(!username?.trim())      {

    throw new ApiError(400,"Username is required");
            }



const channel = await User.aggregate([
    { $match : { username : username.toLowerCase() } },

    {

   $lookup : {
    from : "subscriptions",
    localField : "_id",
    foreignField : "channel",
    as : "subscribers"
   }



    },



    {


$lookup : {
    from : "subscriptions",
    localField : "_id",
    foreignField : "subscriber",
    as : "subscribedTo"
   }




    },{

$addFields : {

        subscribersCount : { $size : "$subscribers" },
        subscribedToCount : { $size : "$subscribedTo" }


}




    },{

isSubcribed : {

$cond :{

    if : { $in : [ req.user?._id , "$subscribers.subscriber" ] },
    then : true,
    else : false



}

}




    },{

$project : {

fullName : 1,
username : 1,
subscribersCount : 1,
subscribedToCount : 1,
isSubcribed : 1, 
avatar : 1,
coverImage : 1,


}




    }


]
);




if(!channel || channel.length === 0){
throw new ApiError(404,"Channel not found with given username");

}





return res.status(200).json(new Apiresponse(200,channel[0],"Channel profile fetched successfully"));






})



const getWatchHistory = asyncHandler( async (req,res) => {

const user =await User.aggregate([


{
$match : { _id : new mongoose.Types.ObjectId(req.user._id) }

}
,{
$lookup : {
    from : "videos",
    localField : "watchHistory.video",
    foreignField : "_id",
    as : "watchHistoryVideos",
    pipeline : [
{
    $lookup :  {
        from : "users",
        localField : "owner",
        foreignField : "_id",
        as : "ownerDetails",
        pipeline : [
          {
            $project : {
                fullName : 1,
                username : 1,
avatar : 1
            }
          }

        ]
    }
}


    ]
}
}
,{
    $addFields : {
         
owner :{
$first: "$owner"
}


    }
}



]);
return res.status(200).json(new Apiresponse(200,user[0].watchHistoryVideos,"Watch history fetched successfully"));

})







export { registerUser ,loginUser,logOutUser,refreshAccessToken,getCurrentUser,changePassword,updateAccountDetails,updateAvatar,updateCoverImage,getChannelProfile,getWatchHistory} ;