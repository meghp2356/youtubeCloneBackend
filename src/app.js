import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express();
app.use(cors());

app.use(express.json({ limit: "25kb" }));
app.use(express.urlencoded({ extended: true, limit: "25kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRoutes from "./routes/user.routes.js";
import subcriptionRoutes from './routes/subcription.routes.js';
import videoRoutes from './routes/video.routes.js';

app.use('/api/v1/users',userRoutes)
app.use('/api/v1/subcription',subcriptionRoutes )
app.use('/api/v1/video',videoRoutes)


export default app;
