const { instance } = require("../config/razorpay");
const Course = require("../model/Course");
const User = require("../model/User");
const mailSender = require("../utils/mailSender");

// capture the payment and initiate razorpay order

exports.capturePayment = async (req, res) => {
  //fetch user-id and course-id
  //validation
  //valid course-ID
  //user already pay for the course
  //order create and send response
};
