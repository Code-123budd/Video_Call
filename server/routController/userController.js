import User from "../schema/userSchema.js";
export const getAllUsers=async(req,res)=>{
    const currentUserId=req.user?._id;
    if(!currentUserId) return res.status(500).json({success:false, message:"Unauthorized"});
    try{
        const users=await User.find({_id:{$ne:currentUserId}},"profilepic email username");
        res.status(200).json({success:true,users});
    }
    catch(error){
        res.status(500).send({
            success:false,
            message:error
        });
        console.log(error);
    }
}
