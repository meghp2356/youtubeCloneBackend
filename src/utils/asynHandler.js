const asyncHander = (fun)=> (async (req,res,next)=>{
    try {
        await fun(req,res,next);
    } catch (error) {
        res.status(error || 500).json({
            success : false,
            message : error.message
        });
    }
})

export {asyncHander} ;