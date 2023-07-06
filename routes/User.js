// Import the required modules
const express = require("express");
const router = express.Router();

//Import the required controllers and middlewares
const {
  login,
  signUp,
  sendOTP,
  changePassword,
} = require("../controllers/Auth");

const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword");
const { auth } = require("../middlewares/Auth");

//route for user login
router.post("/login", login);
//rout for sign up
router.post("/signup", signUp);
//route for sending otp

router.post("/sendotp", sendOTP);

//route for changing passwod
router.post("/changepassword", auth, changePassword);

//                                      Reset Password

router.post("/reset-password-token", resetPasswordToken);

router.post("/reset-password", resetPassword);

module.exports = router;
