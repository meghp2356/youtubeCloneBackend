import { asyncHander } from "../utils/asynHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiRespones } from "../utils/apiRespones.js";
import { Playlist } from '../models/playlist.model.js';
import mongoose from "mongoose";

//improve add video

const createPlaylist = asyncHander(async (req,res)=>{
    const {name , description} = req.body;

    if(
        [name,description].some(val => val.trim()==='')
    ) throw new ApiError(400,'all fields are required');

    if(!name || !description) throw new ApiError(400,'all fields are required');

    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user._id
    })

    return res.status(200)
              .json(new ApiRespones(200,'playlist created',playlist))
})

const getUserPlaylist=asyncHander(async(req,res)=>{
    const playlists = await Playlist.aggregate([
        {
            $match:{
                owner:mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                foreignField:'_id',
                localField:'videos',
                from:'videos',
                as:"playListVideo",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:'owners',
                            foreignField:"_id",
                            as:"owners",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1,
                                        coverImage:1
                                    }
                                }
                            ]
                        }
                    },
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"playListVideo"
                }
            }
        }
    ])

    if(!playlists || playlists.length < 0) throw new ApiError(400,'playlist does not exits');



    return res.status(200)
              .json(new ApiRespones(200,"playlist fetch with sucess",playlists))
})

const getPlaylistById = asyncHander(async(req,res)=>{
    const {ID} = req.params;

    if(!ID || !mongoose.isValidObjectId(ID)) throw new ApiError(400,"not a valid id")

    const playlist = await Playlist.aggregate([
        {
            $match:{
                _id:mongoose.Types.ObjectId(ID)
            }
        },
        {
            $lookup:{
                foreignField:'_id',
                localField:'videos',
                from:'videos',
                as:"playListVideo",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:'owners',
                            foreignField:"_id",
                            as:"owners",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1,
                                        coverImage:1
                                    }
                                }
                            ]
                        }
                    },
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"playListVideo"
                }
            }
        }
    ])

    if(!playlist || playlist.length < 0) throw new ApiError(400,"playlist does not exits")

    return res.status(200)
              .json(new ApiRespones(200,"playlist getch with sucess",playlist))
})

const addVideoToPlaylist = asyncHander(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId) throw new ApiError(400,"ids not found");

    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)) throw new ApiError(400,"not valid Ids")

    const playlist = await Playlist.findById(playlistId);

    if(!playlist.owner.equals(req.user._id)) throw new ApiError(401,"unauthorized user access the playlist")

    playlist.videos.unshift(videoId)
    await playlist.save({validateBeforeSave:false})

    res.status(200)
       .json(new ApiRespones(200,"video added",))
})

const removeVideoFromPlaylist = asyncHander(async (req, res) => {
    const {playlistId, videoId} = req.params
 
    if(!playlistId || !videoId) throw new ApiError(400,"ids not found");

    if(!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(videoId)) throw new ApiError(400,"not valid Ids")

    const playlist = await Playlist.findById(playlistId);

    if(!playlist.owner.equals(req.user._id)) throw new ApiError(401,"unauthorized user access the playlist")

    if(!playlist.videos.includes(videoId)) throw new ApiError(400,"video does not exits in playlist")
    
    await Playlist.updateOne(
        {
            _id:playlistId
        },
        {
            $pull:{
                videos:mongoose.Types.ObjectId(videoId)
            }
        }
    )

    return res.status(200)
              .json(new ApiRespones(200,"video removed with sucess"))
})

const deletePlaylist = asyncHander(async (req, res) => {
    const {playlistId} = req.params
  
    if(!playlistId) throw new ApiError(400,"ids not found");

    if(!mongoose.isValidObjectId(playlistId)) throw new ApiError(400,"not valid Ids")

    const playlist = await Playlist.findById(playlistId);

    if(!playlist.owner.equals(req.user._id)) throw new ApiError(401,"unauthorized user access the playlist")

    await Playlist.deleteOne({_id:playlistId})

    return res.status(200)
              .json(new ApiRespones(200,'playlist deleted'))

})

const updatePlaylist = asyncHander(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(!playlistId) throw new ApiError(400,"ids not found");

    if(!mongoose.isValidObjectId(playlistId)) throw new ApiError(400,"not valid Ids")

    const playlist = await Playlist.findById(playlistId);

    if(!playlist.owner.equals(req.user._id)) throw new ApiError(401,"unauthorized user access the playlist")

    if(
        [name,description].some(val => val.trim()==='')
    ) throw new ApiError(400,'all fields are required');

    if(!name && !description) throw new ApiError(400,'one field are required');

    await Playlist.updateOne(
        {
            _id:playlistId
        },
        {
            $set:{
                name,
                description
            }
        },
    )

    return res.status(200)
    .json(new ApiRespones(200,'playlist updated'))

})
