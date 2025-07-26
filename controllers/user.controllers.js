import { User } from "../models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../middleware/sendMail.js";

export const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    user = {
      email,
      name,
      password: hashPassword,
    };

    //generate otp
    const otp = Math.floor(Math.random() * 1000000); //  6 digit after 1 to generate 6 digit otp

    const activationToken = jwt.sign(
      {
        user,
        otp,
      },
      process.env.Activation_Secret,
      {
        expiresIn: "10m",
      }
    );

    const data = {
      name,
      otp,
    };

    await sendMail(email, "E learning Otp Verification", data);

    res.status(200).json({
      message: "otp send to your mail",
      activationToken,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { otp, activationToken } = req.body;

    const verify = jwt.verify(activationToken, process.env.Activation_Secret);

    if (!verify) {
      return res.status(400).json({
        message: "Otp expired...",
      });
    }

    if (verify.otp !== otp) {
      //  // stored otp in activation token --> verify.otp
      return res.status(400).json({
        message: "Otp wronged...",
      });
    }

    // create the user
    await User.create({
      name: verify.user.name, // stored user in activation token
      email: verify.user.email,
      password: verify.user.password,
    });

    res.status(200).json({
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        message: "All fields are required.",
      });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({
        message: "No user with this email exists.",
      });

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword)
      return res.status(400).json({
        message: "Wrong password entered",
      });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    res.status(200).json({
        message: `Welcome back ${user.name}`,
        token,
        user,
    })

  } catch (error) {
    res.status(400).json({
      message: "Login Failed",
    });
  }
};

export const myProfile = async(req,res)=>{
    const user = await User.findById(req.user._id);

    res.json({user});
}
