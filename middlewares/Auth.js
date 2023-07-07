const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../model/User");

//auth
exports.auth = async (req, res, next) => {
  try {
    //extract token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorisation").replace("Bearer", " ");
    //if token missing , then return response

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found",
      });
    }

    //verify token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
    } catch (e) {
      //verifiaction issue
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }
    next();
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};

//isStudent

exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accoutType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is protected for only students",
      });
    }
    next();
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "User roll cannot be verified",
    });
  }
};

//isInstructor
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is protected for only Instructor",
      });
    }
    next();
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "User roll cannot be verified",
    });
  }
};

// isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is protected for only Admin",
      });
    }
    next();
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "User roll cannot be verified",
    });
  }
};

//
