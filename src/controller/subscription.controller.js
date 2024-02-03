import { ApiError } from "../utils/apiError.js";
import { ApiRespones } from "../utils/apiRespones.js";
import {asyncHander} from '../utils/asynHandler.js';
import { Subscriber } from "../models/subcriber.model.js";
import mongoose from "mongoose";

const toggleSubcription = asyncHander(async (req,res)=>{
    const {channelId} = req.params;
    
    if(!channelId) throw new ApiError(400,'channel id is required')

    const channels = await Subscriber.findOne({
        channel:channelId,
        subscriber:req.user._id
    });
    
    if(!channels){
        await Subscriber.create({
            channel:channelId,
            subscriber:req.user._id
        })

        return res.status(200)
                  .json(new ApiRespones(200,'user is scribed with success'))
    }

    await Subscriber.deleteOne(channels._id)
    
    return res.status(200).json(new ApiRespones(200,'user is unscribe with success'))
})

const channelSubcribers = asyncHander(async (req,res)=>{
    const {channelId} = req.params;

    if(!channelId) throw new ApiError(400,'channel id is required')

    const subscribers = await Subscriber.find({
        channel:channelId
    })

    return res.status(200)
              .json(new ApiRespones(200,'list of subs that channel has',{
                size:subscribers.length,
                subscribers
              }))

    
})

const getuserChannelSubcriber = asyncHander(async(req,res)=>{
    const channelList = await Subscriber.find({subscriber:req.user._id})

    console.log(channelList);

    return res.status(200).json(new ApiRespones(200,'channel that user has subcribed fetch with success',{
        channelList
    }))
})
export  {
    toggleSubcription,
    channelSubcribers,
    getuserChannelSubcriber
}