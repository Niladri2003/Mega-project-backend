const RatingAndReview = require("../model/RatingAndReview");
const Mongoose = require("mongoose");
const Course = require("../model/Course");

//create Rating
exports.createRating = async (req, res) => {
  try {
    //get user id
    const userId = req.user.id;
    //fetch data from request body
    const { rating, review, courseId } = req.body;
    //check if user is enrolled or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student not enrolled in course",
      });
    }
    //check if user alreday reviewd in course
    const alreadyReviewd = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewd) {
      return res.status(403).json({
        success: false,
        message: "Course is already reviewd by user",
      });
    }

    //create rating and review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });
    //update course with this review and rating
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          ratingAndReview: ratingReview._id,
        },
      },
      { new: true }
    );
    //return succes response
    console.log(updatedCourseDetails);

    return res.status(200).json({
      success: true,
      message: "Rating and Review created succesfully",
      ratingReview,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      menubar: "Error in creating rating and review",
    });
  }
};

//get average rating
exports.getAverageRating = async (req, res) => {
  try {
    //get course ID
    const courseId = req.body.courseId;
    //calculate average rating
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new Mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    //if rating exists
    if (result.length > 0) {
      return res.staus(200).json({
        success: true,
        averageRating: result[0].averageRating,
      });
    }
    //if no raing exist
    return res.status(200).json({
      success: true,
      message: "Average rating is 0, no ratings given till now",
      averageRating: 0,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      menubar: "Error in creating rating and review",
    });
  }
};

//get all rating

exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({ path: "user", select: "firstName lastName email image" })
      .populate({ path: "course", select: "courseName" })
      .exec();

    return res.status(200).json({
      success: true,
      message: "All reviews fetched succesfully",
      allReviews,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      menubar: "Error in creating rating and review",
    });
  }
};
