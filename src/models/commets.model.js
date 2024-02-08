import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema(
    {
        content:{
            type:String,
            require:true
        },
        video:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Video'
        },
        Owner:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    },
    {
        timestamps:true
    }
);

mongoose.plugin(mongooseAggregatePaginate);

export const comment = mongoose.model("Comment",commentSchema);