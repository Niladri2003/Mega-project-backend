const User = require("../model/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from req body
    const email = req.body.email;
    //check user  for this email,email validation
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "Your email is not registered",
      });
    }
    // Token generate
    const token = crypto.randomBytes(20).toString("hex");
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 3600000,
      },
      { new: true }
    );
    console.log("DETAILS", updatedDetails);
    // url create
    const url = `http://localhost:3000/update-password/${token}`;
    //send mail containg url
    await mailSender(
      email,
      "Password Reset",
      `Your Link for email verification is ${url}. Please click this url to reset your password.`
    );
    // return response
    return res.json({
      success: true,
      message:
        "Email sent Succesfully please check your mail to reset your password",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reseting password",
    });
  }
};

//resetPassword
exports.resetPassword = async (req, res) => {
  try {
    //data fetch
    const { password, confirmPassword, token } = req.body;
    //validation upon data
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Password didn't match",
      });
    }
    //get userdetails from db using token
    const userdetails = await User.findOne({ token: token });
    //if no entry-invalid token
    if (!userdetails) {
      return res.json({
        success: false,
        message: "Token invalid",
      });
    }
    //token time check
    if (!(userdetails.resetPasswordExpires > Date.now())) {
      return res.status(403).json({
        success: false,
        message: `Token is Expired, Please Regenerate Your Token`,
      });
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //update password
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    //response return
    return res.status(200).json({
      success: true,
      message: "Password updation succesful",
    });
  } catch (e) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Updating the Password`,
    });
  }
};
