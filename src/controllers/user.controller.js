import asyncHandler from 'express-async-handler';

const registerUser = asynchHandle( async (req,res) => {

res.status(200).json({
    meassage : "ok"
})

})


export { registerUser };