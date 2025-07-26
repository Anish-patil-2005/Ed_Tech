
import {Course} from "../models/course.models.js"
import {Lecture} from "../models/lecture.models.js";
import {User} from "../models/user.models.js"
import {rm} from 'fs'

import { promisify } from "util";
import fs from "fs"

export const createCourse = async(req,res)=>{
   try {
     const {title,description,category,createdBy, duration, price} = req.body;
 
     const image = req.file;
 
     await Course.create({
         title,
         description,
         category,
         duration,
         image : image?.path,
         price,
         createdBy,
     });


     res.status(201).json({
        message: "Course created successfully"
     });
   } catch (error) {
    res.status(400).json({
        message:error.message
    })
   }
};

export const addLecture = async(req,res)=>{
  try {
    
    const course = await Course.findById(req.params.id);

    if(!course)
    {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const {title,description} = req.body;

    const video = req.file;
    const lecture = await Lecture.create({
      title,
      description,
      video:video?.path,
      course:course._id,
    });

    res.status(201).json({
      message:"Lecture Added successfully",
      lecture
    })

  } catch (error) {
    res.status(400).json({
      message:error.message
    })
  }
}

export const deleteLecture = async(req,res)=>{
  try {

    const lecture = await Lecture.findById(req.params.id);

    // rm is a method from Node.js’s fs module used to delete files.
    // rm(lecture.video, ()=>{
    //   console.log("Video deleted");
    // })
    
    if (lecture.video) {
      rm(lecture.video, (err) => {
        if (err) {
          console.error("Error deleting video:", err);
        } else {
          console.log("Video deleted");
        }
      });
    } 
    else {
      console.warn("No video path found for this lecture.");
    }

    //delete from database
    await lecture.deleteOne();

    res.json({
      message:"Lecture deleted."
    })

  } catch (error) {
    res.status(400).json({
      message: error.message
    })
  }
}

const unlinkSync = promisify(fs.unlink);

export const deleteCourse = async(req,res)=>{
  try {
    
    const course = await Course.findById(req.params.id);

    const lectures = await Lecture.find({course: course._id});

    await Promise.all(
      lectures.map(async(lecture)=>{
        await unlinkSync(lecture?.video);
        console.log("video deleted")
      })
    )


    if (course.image) {
      rm(course.image, (err) => {
        if (err) {
          console.error("Error deleting thumbnail:", err);
        } else {
          console.log("image deleted");
        }
      });
    } 
    else {
      console.warn("No thumbnail path found for this course.");
    }

    await Lecture.find({course:req.params.id}).deleteMany();
    await Course.deleteOne();

    await User.updateMany({},{$pull:{subscription:req.params.id }}) // remove the course from users course array or list

    res.json({
      message:"Course deleted"
    })

  } catch (error) {
     res.status(400).json({
      message: error.message
    })
  }
}

export const getAllStats = async(req,res)=>{
  try {

    const totalCourses = (await Course.find()).length;
    const totalLectures = (await Lecture.find()).length;
    const totalUsers = (await User.find()).length;
    
    const stats = {
      totalCourses,
      totalLectures,
      totalUsers,
    };

    res.json({
      stats,
    })
  } catch (error) {
    res.status(400).json({
      message:error.message
    })
  }
}

export const getAllUsers  = async (req,res)=>{
  try {
    const users = await User.find({_id:{$ne: req.user._id}}).select("-password"); // user info of others, not me who has loggedin and admin

    res.json({users});
  } catch (error) {
    res.status(400).json({
      message:error.message
    })
  }
}

export const updateRole = async (req,res)=>{
  try {

    const user = await User.findById(req.params.id);

    if(user.role==="user"){
      user.role = "admin";
      await user.save();

      return res.status(200).json({ message: "Role updated to admin"})
    }

    if(user.role==="admin"){
      user.role = "user";
      await user.save();

      return res.status(200).json({ message: "Role updated to user"})
    }
    
  } catch (error) {
    res.status(400).json({
      message:error.message
    })
  }
}