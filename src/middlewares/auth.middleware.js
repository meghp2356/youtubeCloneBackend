import jwt from "jsonwebtoken";
import { asyncHander } from "../utils/asynHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

export const verifyJwt = asyncHander(async (req,_,next)=>{
    try {
        const token = req.cookies?.accessToken  || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) throw new ApiError(401,'Unauthorized Request')
        
        const decodedData = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedData._id).select('-password -refreshToken')

        if(!user)  throw new ApiError(401,'Unauthorized Request')

        req.user=user

        next()
    } catch (error) {
        throw new ApiError(401,error.message || 'invalid token')
    }

})