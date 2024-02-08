import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema(
    {
        content:{
            type:String,
            require:true
        },
        owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        image:{
            type:String,
            default:""
        }
    },
    {
        timestamps:true
    }
)

export const teweets = mongoose.model("Tweet",tweetSchema)