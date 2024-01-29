import { asyncHander } from "../utils/asynHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import uplodeCloundnary from "../utils/couldnary.js";
import { ApiRespones } from "../utils/apiRespones.js";
import JWT from "jsonwebtoken";
import mongoose from "mongoose";

async function genrateAccessRefrenceToken(userObj) {
  try {
    console.log(userObj);

    const accessToken = userObj.genrateAccessToken();
    const refreshToken = userObj.genrateRefreshToken();

    console.log("from method", accessToken, refreshToken);

    userObj.refreshToken = refreshToken;
    await userObj.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong while genrating tokens");
  }
}

const registerUser = asyncHander(async (req, res, next) => {
  const { username, fullname, email, password } = req.body;

  console.log(req.body);

  if (!username || !fullname || !email || !password)
    throw new ApiError(400, "All fields are required");

  if (
    [username, fullname, email, password]
      .map((val) => val.trim() === "")
      .includes(true)
  ) {
    throw new ApiError(400, "All fields are required!");
  }

  const exitedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (exitedUser) throw new ApiError(409, "username or email aready exits");

  const localAvatar = req.files?.avatar[0]?.path;
  //  const localCoverImage = req.files?.coverImage[0]?.path;

  let localCoverImage;
  if (req.files && req.files.coverImage && req.files.coverImage.length >= 0) {
    localCoverImage = req.files.coverImage[0].path;
  }

  if (!localAvatar) throw new ApiError(409, "Avatar is required");

  const avatar = await uplodeCloundnary(localAvatar);
  const coverimage = await uplodeCloundnary(localCoverImage);

  if (!avatar) throw new ApiError(409, "Avatar is required");

  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    password,
    email,
    coverImage: coverimage?.url || "",
    avatar: avatar.url,
  });

  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createUser) throw new ApiError(500, "error in register in user");

  return res
    .status(201)
    .json(new ApiRespones(201, "user register with sucess", createUser));
});

const login = asyncHander(async (req, res, next) => {
  const { email, username, password } = req.body;
  console.log(req.body);
  console.log(`email : ${email} and username : ${username}`);

  if (!username && !email)
    throw new ApiError(400, "username or email required");

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) throw new ApiError(400, "user did not exits");

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) throw new ApiError(400, "password is incorrect!");

  const { accessToken, refreshToken } = await genrateAccessRefrenceToken(user);
  console.log("acces:", accessToken, "\nrefresh", refreshToken);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  console.log(loggedInUser);

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiRespones(200, "user loggedIn", {
        user: loggedInUser,
        refreshToken: refreshToken,
        accessToken: accessToken,
      })
    );
});

const logout = asyncHander(async (req, res, next) => {
  const user = req.user;

  await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiRespones(200, "user logout"));
});

const refreshTokenAcessToken = asyncHander(async (req, res) => {
  console.log(req.cookies);
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  console.log("token = ", token);

  if (!token) throw new ApiError(402, "unauthorized access");

  const decodedData = JWT.verify(token, process.env.REFRESH_TOKEN_SECRET);

  const userData = await User.findById(decodedData._id);

  if (!userData) throw new ApiError(402, "unauthorized user");

  if (userData?.refreshToken !== token)
    throw new ApiError(402, "invalid token or used token");

  const { accessToken, refreshToken } = await genrateAccessRefrenceToken(
    userData
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken:", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiRespones(201, "", {
        accessToken,
        "newRefresh token": refreshToken,
      })
    );
});

const getUser = asyncHander(async (req, res) => {
  const user = req.user;

  return res
    .status(200)
    .json(new ApiRespones(200, "your user data ;)", { user }));
});

const updatePassword = asyncHander(async (req, res) => {
  const { password, newPassword } = req.body;
  const user = await User.findById(req.user?._id);

  const validate = await user.isPasswordCorrect(password);

  if (!validate) throw new ApiError(402, "password is incorrect");

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiRespones(200, "password changes with sucess"));
});

const updateAccountDeatils = asyncHander(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) throw new ApiError(400, "all field are required");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiRespones(200, "accout has been updated successfully", user));
});

const updateAvatar = asyncHander(async (req, res) => {
  const localAvatar = req.files?.avatar[0]?.path;

  if (!localAvatar) throw new ApiError(400, "avtar is required");

  const avatar = await uplodeCloundnary(localAvatar);

  if (!avatar) throw new ApiError(400, "error while updating avatar");

  // await User.findByIdAndUpdate(req.user._id,{
  //   $set:{
  //     avatar:avatar.url
  //   }
  // })
  console.log(req.user);

  req.user.avatar = avatar.url;
  await req.user.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiRespones(200, "avatar has been updated", req.user));
});

const getChannelDetailes = asyncHander(async (req, res) => {
  const { username } = req.params;

  if (!username) throw ApiError(400, "username is missing");

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        form: "subcrpitions",
        localField: "_id",
        foreignField: "channel",
        as: "subrcibers",
      },
    },
    {
      $lookup: {
        form: "subcrpitions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subrciberTo",
      },
    },
    {
      $addFields: {
        subcribersCount: {
          $size: "$subrcibers",
        },
        channelSubcribeToCount: {
          $size: "$subrciberTo",
        },
        isSubcribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subrcibers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project:{
        fullname:1,
        subcribersCount:1,
        channelSubcribeToCount:1,
        username:1,
        avatar:1,
        coverImage:1
      }
    }
  ]);

  console.log(channel);

  if(!channel?.length) throw ApiError(400,'channel does not exits')

  res.status(200)
     .json(new ApiRespones(200,'channel user fetch sucessfully',channel[0]))
});

const userHistory = asyncHander(async (req,ref) => {
  const user = await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
      },
    },
    {
      $lookup:{
        from:'videos',
        localField:'watchHistory',
        foreignField:'_id',
        as:'watchHistory',
        pipeline:[
          {
            $lookup:{
              from:'users',
              localField:'owners',
              foreignField:'_id',
              as:'owner',
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
          {
            $addFields:{
              owner:{
                $first:'$owner'
              }
            }
          }
        ]
      }
    },
  ])

  res.status(200)
     .json(new ApiRespones(200,'the user history has been fetched',user[0].watchHistory))
});

export {
  registerUser,
  login,
  logout,
  refreshTokenAcessToken,
  getUser,
  updatePassword,
  updateAccountDeatils,
  updateAvatar,
  getChannelDetailes,
  userHistory
};
