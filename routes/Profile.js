//Import the required modules
const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/Auth");

const {
  updateProfile,
  deleteAccount,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
} = require("../controllers/Profile");

//************************************** */
//      profile Routes

router.delete("/deleteProfile", deleteAccount);
router.put("/updateProfile", updateProfile);
router.get("/getUserDetails", getAllUserDetails);
//get enrolled courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses);
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

module.exports = router;
