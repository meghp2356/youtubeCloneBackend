import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema=new mongoose.Schema({
    videoFile:{
        type:String,
        require:true
    },
    thumnaile:{
        type:String,
        require:true
    },
    descprition:{
        type:String,
        require:true
    },
    title:{
        type:String,
        require:true
    },
    duration:{
        type:Number,
        require:true
    },
    view:{
        type:Number,
        default:0
    },
    isPublic:{
        type:Boolean,
        default:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
},{timestamps:true})

mongoose.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video', videoSchema)