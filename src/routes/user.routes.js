import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controller";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller";

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

export default router;