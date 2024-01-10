import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SCERET 
});

const uplodeCloundnary = async (filepath)=>{
    try {
        if (filepath) {

            const file = await cloudinary.uploader.upload(filepath,{
                resource_type:'auto'
            });

            console.log('file url is',file.url);
            return file;
        }

        return null;
    } catch (error) {
        return null;
    }
}

export default uplodeCloundnary;