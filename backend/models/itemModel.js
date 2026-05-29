import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    householdId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Household',
        required:true
    },addedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },name:{
        type:String,
        required:true
    },category:{
        type:String,
        enum:['produce','dairy','meat','pantry','frozen','other'],
        required:true
    },quantity:{
        type:Number,
        default:1
    },expiryDate:{
        type:Date,
        required:true
    },status:{
        type:String,
        enum:['fresh','expiring-soon','expired','used','wasted']
    }
},{timestamps:true})

const Item = mongoose.model('Item',itemSchema)
export {Item}