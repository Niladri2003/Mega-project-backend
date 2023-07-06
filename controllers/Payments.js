const { instance } = require("../config/razorpay");
const Course = require("../model/Course");
const User = require("../model/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollment } = require("../mail/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

// capture the payment and initiate razorpay order

exports.capturePayment = async (req, res) => {
  //fetch user-id and course-id
  const { courseId } = req.body;
  const userId = req.user.id;

  //validation

  //valid course-ID
  if (!courseId) {
    return res.json({
      success: false,
      message: "please provide valid course id",
    });
  }
  //valid course details
  let course;
  try {
    course = await Course.findById(courseId);
    if (!course) {
      return res.json({
        success: false,
        message: "Course coudln't find",
      });
    }
    //user already pay for the course
    //convert user-Id in object id
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(200).json({
        success: false,
        message: "Student alreday enrolled",
      });
    }
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }

  //order create and send response
  const amount = course.price;
  const currency = "INR";
  const options = {
    amount: amount * 100,
    currency,
    receipt: Math.random(Date.now()).toString,
    notes: {
      courseId: courseId,
      userId,
    },
  };

  try {
    //initiate payment using razorpay
    const paymentResponse = await instance.orders(options);
    console.log(paymentResponse);

    //return succes response
    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Could not initiated order",
    });
  }
};

//verify signature of Razorpay and server

exports.verifySignature = async (req, res) => {
  const webhookSecret = "12345678";
  const signature = req.headers["x-razorpay-signature"];

  //here webhook secret is converted in digest(Encrypt form)
  const shasum = crypto.createHmac("sha256", webhookSecret);

  shasum.update(JSON.stringify(req.body));

  const digest = shasum.digest("hex");

  if (signature === digest) {
    console.log("Payment is authorized");

    const { courseId, userId } = req.body.payload.payment.entity.notes;
    try {
      //fulfil the action

      //find the course and enroll the student
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Course not found",
        });
      }
      console.log(enrolledCourse);
      //find the studnet and add course list of enrolled courses
      const enrolledStudent = await User.findOneAndUpdate(
        { _id: userId },
        { $push: { courses: courseId } },
        { new: true }
      );

      console.log(enrolledStudent);

      // confirmation mail send
      const emailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulations from studynation",
        "Congratulations , you are onboarded into new studynation course"
      );

      console.log(emailResponse);
      return res.status(200).json({
        success: true,
        message: "Signature verified",
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid response",
    });
  }
};
