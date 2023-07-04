const Course = require("../model/Course");
const Tag = require("../model/Tag");
const User = require("../model/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//Course create handler function
exports.createCourse = async (req, res) => {
  try {
    //data fetch from body
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;
    //get thumbnail
    const thumbnail = req.files.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //check for instructor to add in course
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor details", instructorDetails);
    //Todo --> verify that user id and instructor details are same or different

    if (!instructorDetails) {
      res.status(404).json({
        success: false,
        message: "Instructor details not found",
      });
    }
    //check given tag is valid or not
    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      res.status(404).json({
        success: false,
        message: "Tag details not found",
      });
    }
    //upload image to cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //entry in db for new course

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });
    //add the new course in user schema  user(instructor)
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );
    //update tag Schema
    //hw

    //return response

    return res.status(200).json({
      success: true,
      message: "New course created succesfully",
      data: newCourse,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};

// Get all Course handler function
exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReview: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Data for all courses fetched succesfully",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Error in fetching all courses",
      error: e.message,
    });
  }
};
