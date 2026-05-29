import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        min:[2,"Name is too short"],
        max:[30,"Name can't exceed 30 characters"]
    },email:{
        type:String,
        required:true,
        unique:true
    },password:{
        type:String,
        required:true,
        min:[2,"Password is too short"],
        max:[30,"Password can't exceed 30 characters"]
    },householdId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Household'
    }
},{timestamps:true})

const User =  mongoose.model("User",userSchema)
export {User}
