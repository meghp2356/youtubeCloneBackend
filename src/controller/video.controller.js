import { asyncHander } from "../utils/asynHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiRespones } from "../utils/apiRespones.js";
import { Video } from '../models/video.model.js';
import uplodeCloundnary from '../utils/couldnary.js';
import mongoose from "mongoose";

const publishVideo = asyncHander(async(req,res)=>{
    const {title , descprition} = req.body;

    if(!title || !descprition) throw new ApiError(400,'all fields are required')

    if(
        [title,descprition].some(val => val.trim()==="")
    ) throw new ApiError(400,'all firlds are required')

    const localeVideo = req.files?.VideoFile[0]?.path
    const localeThumbnail = req.files?.thumbnail[0]?.path

    if(!localeThumbnail || !localeVideo) throw new ApiError(400,'video or thumnail not found')

    const video = await uplodeCloundnary(localeVideo);

    console.log(video);

    const thumnail = await uplodeCloundnary(localeThumbnail);

    if(!video || !thumnail) throw new ApiError(400,'error while uploading video or thumnail')

     const videoObj = await Video.create({
        title,
        descprition,
        thumnaile:thumnail.url,
        videoFile:video.url,
        duration:video.duration,
        owner:req.user._id
    })

    res.status(200)
       .json(new ApiRespones(200,'video uploaded', videoObj))
})

const getVideoById = asyncHander(async(req,res)=>{

    const {videoId} = req.params //65be2e6c3c0a370453ef7e20

    if(!videoId) throw new ApiError(400,'video id is required that has not given')

    const video = await Video.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:'users',
                foreignField:'_id',
                localField:'owner',
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullname:1,
                            avatar:1,
                            coverImage:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $first:'$owner'
                }
            }
        }
      
    ])

    if(!video || video.length <=0) throw new ApiError('video does not exits')

    res.status(200)
       .json(new ApiRespones(200,'video fetch with sucess', video))
})

const updateVideoDetails = asyncHander(async(req,res)=>{
    const {videoId} = req.params 

    if(!videoId) throw new ApiError(400,'video id is required')

    const check = await Video.findById(videoId)

    if(!check) throw new ApiError(400,'no such a video exits')

    if(!check.owner.equals(req.user._id)) throw new ApiError(402,'unauthorized update')

    const {title , descprition } = req.body

    const localeThumbnail =  req.file?.path

    let thumbnail;
    if(localeThumbnail){
        thumbnail = await uplodeCloundnary(localeThumbnail)
    }

    if(!title && !descprition && !thumbnail) throw new ApiError(400,'at least one field is required')

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title,
                descprition,
                thumnaile:thumbnail?.url
            }
        },
        {
            new:true
        }
    )

    res.json(video)
})

const deleteVideo = asyncHander(async(req,res)=>{
    const {videoId} = req.params

    if(!videoId) throw new ApiError(400,'video id is required')

    const check = await Video.findById(videoId)

    if(!check) throw new ApiError(400,'no such a video exits')

    if(!check.owner.equals(req.user._id)) throw ApiError(400,'unauthorized delete ')

    await Video.deleteOne(videoId)

    res.status(200)
       .ApiRespones(200,'video deleted')
})

export{
    publishVideo,
    getVideoById,
    updateVideoDetails
}