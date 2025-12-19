import { Router } from "express";
import { getChannelProfile, loginUser, registerUser, updateAccountDetails, updateAvatar, updateCoverImage } from "../controllers/user.controller";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller";
import { changePasswordUser } from "../controllers/user.controller.js";
import { get } from "mongoose"; 
import { getCurrentUser } from "../controllers/user.controller.js";
import { changePassword } from "../controllers/user.controller.js";
import { updateAccountDetails } from "../controllers/user.controller";
import { getWatchHistory } from "../controllers/user.controller.js";

const router =Router();

router.route("/register").post(upload.fields(


[ 

    { name : "avatar", maxCount: 1

    },
    {
 name :     "coverPhoto", maxCount: 1
    }



]

),



registerUser); 

router.route("/login").post(verifyJWT,loginUser);

router.route("/refresh-token").post(refreshAccessToken);





router.route("/change-password").post(verifyJWT,changePasswordUser);

router.route("/current-user").get(verifyJWT,getCurrentUser);

router.route("/update-account").patch(verifyJWT,updateAccountDetails);


router.route("/change-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);


router.route("/change-coverImage").patch(verifyJWT,upload.single("coverPhoto"),updateCoverImage);




router.route("/c/:username").get(verifyJWT,getChannelProfile);


router.route("/history").get(verifyJWT,getWatchHistory);

export default router;