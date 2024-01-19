class ApiError extends Error{
    constructor(
        statusCoder,
        message='something went wrong',
        errors=[],
        stack=''
    ){
        super(message)

        this.statusCoder=statusCoder,
        this.data = null,
        this.message=message,
        this.success=false,
    
        this.errors=errors

        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}