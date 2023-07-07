const Profile = require("../model/Profile");
const User = require("../model/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    //fetch data from req body
    const { dateOfBirth = "", about = "", contactNumber } = req.body;
    //get user id
    const id = req.user.id;
    // Find the profile by id
    const userDetails = await User.findById(id);
    const profile = await Profile.findById(userDetails.additionalDetails);

    // Update the profile fields
    profile.dateOfBrith = dateOfBirth;
    profile.about = about;
    profile.contactNumber = contactNumber;

    // Save the updated profile
    await profile.save();
    //return response
    return res.status(200).json({
      success: true,
      message: "Profile updated Succesfully",
      profile,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Unable to profile section , please try again",
      error: e.message,
    });
  }
};

//delete account
exports.deleteAccount = async (req, res) => {
  try {
    // TODO: Find More on Job Schedule
    // const job = schedule.scheduleJob("10 * * * * *", function () {
    // 	console.log("The answer to life, the universe, and everything!");
    // });
    // console.log(job);

    //fetch get id
    console.log("printing id", req.user.id);
    const id = req.user.id;
    //validation

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Delete Assosiated Profile with the User
    await Profile.findByIdAndDelete({ _id: user.additionalDetails });
    // TODO: Unenroll User From All the Enrolled Courses
    // Now Delete User
    await User.findByIdAndDelete({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Account deleted Succesfully",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Unable to delete account , please try again",
      error: e.message,
    });
  }
};

// get all details of user
exports.getAllUserDetails = async (req, res) => {
  try {
    //get user details
    const id = req.user.id;
    //validation on id
    // user details find from db
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();
    console.log(userDetails);

    //return response
    return res.status(200).json({
      success: true,
      message: "User data fetched succesfully",
      userDetails,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
};
//updateDisplayPicture
exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log(image);
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDetails = await User.findOne({
      _id: userId,
    })
      .populate("courses")
      .exec();
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      });
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
