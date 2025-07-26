import mongoose, { mongo } from "mongoose"

const lectureSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
         type:String,
        required:true
    },
    video:{
        type:String,
        // required:true
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
})

export const Lecture = mongoose.model("Lecture",lectureSchema)