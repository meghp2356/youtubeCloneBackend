import mongoose from 'mongoose';
import { DB_NAME } from '../constant.js';

const connectDB = async () => {
    try{
       const connectionIntance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       console.log(`MongoDb connectes !! Db host ${connectionIntance.Connection.host} \n`);
    }catch(err){
        console.log('error in database connection [file name:db.js]',err);
        process.exit(1);
    }
}

export default connectDB;