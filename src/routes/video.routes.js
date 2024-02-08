import { Router } from "express";
import {
  publishVideo,
  getVideoById,
  updateVideoDetails,
  deleteVideo,
  togglePublish
} from "../controller/video.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = new Router();
router.use(verifyJwt);

router.route("/").post(
  upload.fields([
    {
      name: "VideoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),

  publishVideo
);

router
  .route("/:videoId")
  .get(getVideoById)
  .patch(upload.single("thumbnail"), updateVideoDetails)
  .delete(deleteVideo);

router.route('/p/:VideoId')
      .patch(togglePublish)
export default router;
