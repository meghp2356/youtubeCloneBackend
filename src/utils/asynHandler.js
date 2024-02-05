const asyncHander = (fun)=> (async (req,res,next)=>{
    try {
        await fun(req,res,next);
    } catch (error) {

        console.log(error.stack);
        
        res.status(error.statusCoder || 500).json({
            success : false,
            message : error.message 
        });
    }
})

export {asyncHander} ;