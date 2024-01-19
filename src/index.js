/* if error occuure from dotenv then include
{
    import dotenv from 'dotenv';
    dotenv.confic({
        path:'./.env'
    });
} 
            or
{
    require('dotenv').confic({
        path:path:'./.env'
    });
}

*/

import  connectDB from "./connection/db.js";
import app from "./app.js";
import dotenv from 'dotenv';

dotenv.config({
    path:'./.env'
});

connectDB()
.then(()=>{

    app.on('error',(err)=>{
        console.log('error at confic apps',err);
        throw err;
    });

    app.listen( process.env.PORT || 8000 , ()=>{
        console.log(` server is running at port http://localhost:${process.env.PORT||8000}`);
    }); 

})
.catch(err => {
    console.log("Mongo db connection failed !",err);
})
