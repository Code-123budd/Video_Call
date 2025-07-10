import User from "../schema/userSchema.js";
import bcrypt from "bcryptjs"
import jwtToken from "../utils/jwttoken.js";
export const Signup=async(req,res)=>{
    try{
        const {fullname,username,email,password,gender,profilepic}=req.body;
        const user=await User.findOne({username});
        if(user) return res.status(500).send({success:false ,message:"User already exist with this UserName"});
        const emailpresent=await User.findOne({email});
        if(emailpresent) return res.status(500).send({success:false ,message:"User already exist with this email"});
        const hashPassword=bcrypt.hashSync(password,10);
        const boyppf=profilepic || `https://api.dicebear.com/8.x/adventurer/svg?seed=${username}&gender=female`
        const girlppf=profilepic || `https://api.dicebear.com/8.x/adventurer/svg?seed=${username}&gender=male`

        const newUser= new User({
            fullname,
            username,
            email,
            password:hashPassword,
            gender,
            profilepic:gender ==="male"?boyppf:girlppf
        })
        if(newUser){
            await newUser.save();
        }
        else{
            res.status(500).send({success:false,message:"invalid User data"});
        }
       res.status(201).send({
        message:"Signup Successful"
       }) 
       
    }
    catch(error){
        res.status(500).send({
            success:false,
            message:error});
            console.log(error);
    }
}

export const Login=async(req,res)=>{
    try{
        const {email,password}= req.body;
        const user=await User.findOne({email});
        if(!user) return res.status(500).send({success:false, message:"Email doesn't exist"});
        const comparePassword=bcrypt.compareSync(password,user.password||'');
        if(!comparePassword) return res.status(500).send({success:false, message:"Email or Password doesn't matches"})
        const token=jwtToken(user._id,res);    

        res.status(200).send({
            _id:user._id,
            fullname:user.fullname,
            username:user.username,
            profilepic:user.profilepic,
            email:user.email,
            message:"Successfully Login",
            token
        })
    }
    catch(error){
        res.status(500).send({
            success:false,
            message:error
        });
        console.log(error);
    }
}

export const LogOut=async(req,res)=>{
    try{
        res.clearCookie('jwt',{
            path:'/',
            httpsOnly:true,
            secure:true
        })
        res.status(200).send({message:"User logout"})
    }
    catch(error){
        res.status(500).send({
            success:false,
            message:error
        });
        console.log(error);
    }
}
