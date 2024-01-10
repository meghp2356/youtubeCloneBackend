import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      unqiue: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      require: true,
      unqiue: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      require: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      require: true,
    },
    coverImage: {
      type: String,
    },
    password: {
      type: String,
      require: [true, "password is required"],
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },
  },{ timestamps: true,}
);

userSchema.pre('save', async function(next){
  if(this.isModified('password')){
     this.password = await bcrypt.hash(this.password,10); 
  }

  next()
})

userSchema.method.isPasswordCorrect=async function(password){
  return await bcrypt.compare(password,this.password)
}

userSchema.method.genrateRefreshToken=async function(){
  return jwt.sign(
    {
       _id:this._id,
       username:this.username,
       email:this.email,
       fullname : this.fullname
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

userSchema.method.genrateAccessToken=function(){
  return jwt.sign(
    {
       _id:this._id,
       username:this.username,
       email:this.email,
       fullname : this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User", userSchema);
