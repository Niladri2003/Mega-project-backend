const User = require("../model/User");
const OTP = require("../model/OTP");
const otpGenerator = require("otp-generator");
const Profile = require("../model/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//sendOTP

exports.sendOTP = async (req, res) => {
  try {
    //fetch email from request body
    const { email } = req.body;

    //check if user already exist
    const checkUserPresent = await User.findOne({ email });

    //if User already exist
    if (checkUserPresent) {
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
      firstNAme,
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
      !accountType ||
      !contactNumber ||
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

    //find most recent otp
    const recentOTP = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOTP);
    //validate otp
    if (recentOTP.length == 0) {
      //otp not found
      return res.status(400).json({
        success: false,
        message: "OTP Found",
      });
    } else if (otp !== recentOTP.otp) {
      //invalid otp
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    //hash password

    const hashedPassword = await bcrypt.hash(password, 10);
    //create entry in db
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBrith: null,
      about: null,
      contactNumber: null,
    });
    const user = await User.create({
      firstNAme,
      lastName,
      email,
      password: hashedPassword,
      accountType,
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

//Login

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
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      //create cookie and send response
      const Options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, Options).status(200).jsin({
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
    return res.status(500).json({
      success: false,
      message: "Log in failure please try Again",
    });
  }
};

//changePAssword
exports.changePassword = async (req, res) => {
  //get data from req body
  //get oldPassword new PAssword, configurepassword
  //validation
  //update pwd in db
  // send mail --password update
  //return response
};
