import {asyncHander} from '../utils/asynHandler.js';
import { ApiError } from '../utils/apiError.js';
import {User} from '../models/user.model.js'
import uplodeCloundnary from '../utils/couldnary.js';
import {ApiRespones} from '../utils/apiRespones.js'

const registerUser = asyncHander(async (req,res,next)=>{

  console.log(process.env.API_KEY);

   const {username,fullname,email,password} = req.body;

   console.log(req.body);
   
   if(!username || !fullname || !email || !password)  throw new ApiError(400,'All fields are required')

   if(
    [username,fullname,email,password].map(val=>(val.trim()==='')).includes(true) 
   ){
     throw new ApiError(400,'All fields are required!')
   }

   const exitedUser =  await User.findOne(
    {$or:[{ username },{ email }]}
   )

   if(exitedUser) throw new ApiError(409,'username or email aready exits')
   
   const localAvatar = req.files?.avatar[0]?.path;
  //  const localCoverImage = req.files?.coverImage[0]?.path;

  let localCoverImage;
  if(req.files && req.files.coverImage && req.files.coverImage.length >= 0 ){ 
    localCoverImage=req.files.coverImage[0].path
  }

   if(!localAvatar) throw new ApiError(409,'Avatar is required')

   const avatar = await uplodeCloundnary(localAvatar);
   const coverimage = await uplodeCloundnary(localCoverImage);

   if(!avatar) throw new ApiError(409,'Avatar is required')

   const user = await User.create({
    fullname,
    username:username.toLowerCase(),
    password,
    email,
    coverImage:coverimage?.url || "",
    avatar:avatar.url
   })

   const createUser = await User.findById(user._id).select( '-password -refreshToken')

   if(!createUser) throw new ApiError(500,'error in register in user')

   return res.status(201).json(new ApiRespones(201,'user register with sucess',createUser))
})

const login = asyncHander(async(req,res,next)=>{

})

export {
    registerUser,
    login
}