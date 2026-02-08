export const protect = async(req, res, next) =>{
    try {
        const {userId} = await req.auth();
        console.log("HII Middle ware")
        if(!userId){
            return res.json({success: false, message:"not authenticated"})
        }
        next();
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}