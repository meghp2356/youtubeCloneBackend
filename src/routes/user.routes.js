import { Router } from "express";
import {
  registerUser,
  login,
  logout,
  refreshTokenAcessToken,
  updateAvatar,
  getChannelDetailes,
  userHistory,
  getUser
} from "../controller/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const routes = Router();

routes.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

routes.route("/login").post(login);

routes.route("/logout").post(verifyJwt, logout);

routes.route("/refreshToken").post(refreshTokenAcessToken);

routes
  .route("/updateAvatar")
  .patch(verifyJwt, upload.single("avatar"), updateAvatar);

routes.route("/channel:username").get(verifyJwt, getChannelDetailes);

routes.route("/history").get(verifyJwt, userHistory);

routes.route("/get").get(verifyJwt,getUser)
export default routes;
