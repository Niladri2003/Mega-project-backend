const Profile = require("../model/Profile");
const User = require("../model/User");

exports.updateProfile = async (req, res) => {
  try {
    //fetch data from req body
    const { dateOfBirth = "", about = "", conatcNumber, gender } = req.body;
    //get user id
    const id = req.user.id;
    //validation on data
    if (!conatcNumber || !gender || !id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    // find profile
    const uderDetails = await User.findById(id);
    const profileId = uderDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);
    //update profile
    profileDetails.dateOfBrith = dateOfBirth;
    profileDetails.about = about;
    profileDetails.gender = gender;
    profileDetails.contactNumber = contactNumber;

    await profileDetails.save();
    //return response
    return res.status(200).json({
      success: true,
      message: "Profile updated Succesfully",
      profileDetails,
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
    //fetch get id
    const id = req.user.id;
    //validation
    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    //1st-delete profile
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });
    //TODO-> HW unenrolled user from all enrolled courses
    //2nd user delete
    await User.findByIdAndDelete({ _id: id });

    //Explore crone job-->How can we schedule a task

    // return response
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
    //return response
    return res.status(200).json({
      success: true,
      message: "User data fetched succesfully",
      userDetails,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Unable to find user , please try again",
      error: e.message,
    });
  }
};
