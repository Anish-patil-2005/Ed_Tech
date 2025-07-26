import { Course } from "../models/course.models.js"
import {Lecture} from "../models/lecture.models.js"
import {User} from "../models/user.models.js"
import { instance } from "../index.js";
import crypto from "crypto"
import { Payment } from "../models/payment.models.js";

export const getAllCourses = async(req,res)=>{
    try {
        const courses  = await Course.find()

        res.status(200).json({
            courses,
        })
    } catch (error) {
        res.status(200).json({
            message:error.message
        })
    }
};

export const getSingleCourse = async(req,res)=>{
    try {

        const course = await Course.findById(req.params.id)
        res.status(200).json({
            course,
        })
    } catch (error) {
        res.status(200).json({
            message:error.message
        })
    }
}

export const fetchLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find({ course: req.params.id }).lean();
    const user = await User.findById(req.user._id).lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "admin") return res.json({ lectures });

    const isSubscribed = user.subscription?.map(id => id.toString()).includes(req.params.id.toString());

    if (!isSubscribed) {
      return res.status(403).json({
        message: "You have not subscribed to this course",
      });
    }

    res.json({ lectures });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const fetchLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).lean();
    const user = await User.findById(req.user._id).lean();

    if (!user || !lecture)
      return res.status(404).json({ message: "User or Lecture not found" });

    if (user.role === "admin") return res.json({ lecture });

    const isSubscribed = user.subscription?.map(id => id.toString()).includes(lecture.course.toString());

    if (!isSubscribed) {
      return res.status(403).json({
        message: "You have not subscribed to this course",
      });
    }

    res.json({ lecture });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const getMyCourses = async(req,res)=>{
    try {
        
        const courses = await Course.find({
            _id:req.user.subscription
        })

        res.json({courses});

    } catch (error) {
        res.status(400).json({
            message:error.message
        });
    }
}

export const checkout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.params.id);

    // Defensive check: make sure user and course exist
    if (!user || !course) {
      return res.status(404).json({ message: "User or Course not found" });
    }

    // Ensure subscription is an array
    if (Array.isArray(user.subscription)) {
      const alreadySubscribed = user.subscription.some(
        (id) => id.toString() === course._id.toString()
      );

      if (alreadySubscribed) {
        return res.status(400).json({
          message: "You already have this course",
        });
      }
    }

    const options = {
      amount: Number(course.price * 100),
      currency: "INR",
    };

    const order = await instance.orders.create(options);

    res.status(201).json({
      order,
      course,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};



export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.Razorpay_Secret)
      .update(body)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      const user = await User.findById(req.user.id);
      const course = await Course.findById(req.params.id);

      if (!user || !course) {
        return res.status(404).json({ message: "User or Course not found" });
      }

      // Defensive check
      if (!Array.isArray(user.subscription)) {
        user.subscription = [];
      }

      user.subscription.push(course._id);
      await user.save();

      return res.status(200).json({ message: "Course purchased successfully..." });
    } else {
      return res.status(400).json({ message: "Payment failed..." });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
