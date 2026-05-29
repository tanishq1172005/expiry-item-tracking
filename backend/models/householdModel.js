import mongoose from "mongoose";

const householdSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        min:[2,"name is too short"],
        max:[30,"name can't exceed 30 characters"]
    },inviteCode:{
        type:String,
        unique:true,
        uppercase:true
    },members:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],wasteScore:{
        type:Number,
        default:0
    }
},{timestamps:true})



const Household = mongoose.model('Household',householdSchema)
export {Household}