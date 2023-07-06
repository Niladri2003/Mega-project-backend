const User = require("../model/User");
const OTP = require("../model/OTP");
const otpGenerator = require("otp-generator");
const Profile = require("../model/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailsender = require("../utils/mailSender");
const { passwordUpdate } = require("../mail/passwordUpdate");
require("dotenv").config();

//send OTP For Email Verification

exports.sendOTP = async (req, res) => {
  try {
    //fetch email from request body
    const { email } = req.body;

    //check if user already exist
    // Find user with provided email
    const checkUserPresent = await User.findOne({ email });

    //if User already exist
    if (checkUserPresent) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: "User already exist .Sign in",
      });
    }

    // generate otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("Otp generated:", otp);

    //check unique otp or not

    const result = await OTP.findOne({ otp: otp });
    console.log("Result is Generate otp Func");
    console.log("OTP", otp);
    console.log("Result", result);

    while (result) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      const result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    // create an entry in db for otp validation

    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);
    res.status(200).json({
      success: true,
      message: "OTP sent Succesfully",
      otp,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//signup

exports.signUp = async (req, res) => {
  try {
    //data fetch from request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //validate data

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    //check two passwords are same or not

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and confirmPassword value does not math , please try again",
      });
    }
    //check user already exist or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registerd",
      });
    }

    //find most recent otp for the mail
    const recentOTP = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log("recent otp", recentOTP);
    //validate otp
    console.log("User otp", otp);
    console.log("db otp", recentOTP[0].otp);
    if (recentOTP.length === 0) {
      //otp not found for the email
      return res.status(400).json({
        success: false,
        message: "OTP is not valid",
      });
    } else if (otp !== recentOTP[0].otp) {
      //invalid otp
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }
    //hash password

    const hashedPassword = await bcrypt.hash(password, 10);
    //create the user
    const approved = "";
    approved === "Instructor" ? (approved = false) : (approved = true);

    //create the additional profile for user
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBrith: null,
      about: null,
      contactNumber: null,
    });
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType: accountType,
      contactNumber,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstNAme}${lastName}`,
    });
    //return res
    return res.status(200).json({
      success: true,
      message: "User is registered Succesfully",
      user,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "USer cannot be registered. Please try again",
    });
  }
};

//Login controller for authenticationg users

exports.login = async (req, res) => {
  try {
    //get data from req body
    const { email, password } = req.body;
    //data validation
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    //check user is already exist or not
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "USer is not registered, please sign UP",
      });
    }

    // generate jwt, after password matching
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { email: user.email, id: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      // Save token to user document in database
      user.token = token;
      user.password = undefined;

      //create cookie and send response
      const Options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, Options).status(200).json({
        success: true,
        token,
        user,
        message: "Looged in succesfully",
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (e) {
    console.log(e);
    // Return 500 Internal Server Error status code with error message
    return res.status(500).json({
      success: false,
      message: "Log in failure please try Again",
    });
  }
};

//changePAssword
exports.changePassword = async (req, res) => {
  try {
    //get data from req body
    const userDetails = await User.findById(req.user.id);

    //get oldPassword new PAssword, configurepassword
    const { oldPassword, newPassword, confirmPassword } = req.body;

    //validation
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );

    // If old password does not match, return a 401 (Unauthorized) error
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" });
    }

    // Match new password and confirm new password
    if (newPassword !== confirmPassword) {
      // If new password and confirm new password do not match, return a 400 (Bad Request) error
      return res.status(400).json({
        success: false,
        message: "The password and confirm password does not match",
      });
    }
    //update pwd in db
    const encryptPassword = await bcrypt.hash(newPassword, 10);
    const updateUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptPassword },
      { new: true }
    );
    // send mail --password update
    try {
      const emailResponse = await mailsender(
        updateUserDetails.email,
        passwordUpdate(
          updateUserDetails.email,
          `Password updated succesfully for ${updateUserDetails.firstName} ${updateUserDetails.lastName}`
        )
      );
      console.log("Email sent succesfully:", emailResponse.response);
    } catch (e) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }
    //return success response
    return res.status(200).json({
      success: true,
      message: "Password updated succesfully",
    });
  } catch (e) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};
