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
    await Profile.findByIdAndDelete({ _id: user.userDetails });
    // TODO: Unenroll User From All the Enrolled Courses
    // Now Delete User
    await user.findByIdAndDelete({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Account deleted Succesfully",
    });
  } catch (e) {
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
