import { Router } from "express";
import {
  toggleSubcription,
  channelSubcribers,
  getuserChannelSubcriber,
} from "../controller/subscription.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const routes = new Router();

routes.use(verifyJwt)

routes
  .route("/c/:channelId")
  .post(toggleSubcription)
  .get(channelSubcribers);

routes.route("/u").get(getuserChannelSubcriber);

export default routes;
