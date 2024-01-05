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
connectDB()
