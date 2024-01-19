import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
  cloud_name: 'de2fygxvn', 
  api_key: '718997728127135', 
  api_secret: 'dEmUZLIYC82gQtPbYF4j4s8ZsRk'
});

const uplodeCloundnary = async (filepath) => {
  try {
    if (filepath) {
      const file = await cloudinary.uploader.upload(filepath, {
        public_id:"youtube clone",
        resource_type: "auto",
      });
      
      fs.unlinkSync(filepath);
      console.log("file url is", file.url);
      return file;
    }

    return null;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(filepath);
    return null;
  }
};

export default uplodeCloundnary;
