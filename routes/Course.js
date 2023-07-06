//Import the required modules
const express = require("express");
const router = express.Router();

//import controllers

//course controller
const {
  createCourse,
  getAllCourses,
  getcourseDetails,
} = require("../controllers/Course");

//categories controllers Import
const {
  createCategory,
  showAllCategories,
  categoryPageDetails,
} = require("../controllers/Category");

//Section controllers Import
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section");

//Sub-Section controllers Import
const {
  createSubsection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/Subsection");

// Rating Controllers Import
const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controllers/RatingAndReview");

//import all middlewares
const {
  auth,
  isStudent,
  isInstructor,
  isAdmin,
} = require("../middlewares/Auth");

//******************************************************************************************************8 */
//                          course routes

//course can only be created by instructor
router.post("/createCourse", auth, isInstructor, createCourse);
//add a section to course
router.post("/addSection", auth, isInstructor, createSection);
//update a section
router.post("/updateSection", auth, isInstructor, updateSection);
//delete a Section
router.post("/deleteSection", auth, isInstructor, deleteSection);
//edit Sub-Section
router.post("/updateSubSection", auth, isInstructor, updateSubSection);
//delete Sub-Section
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection);
//create Sub-Section
router.post("/createSubsection", auth, isInstructor, createSubsection);
//get all registered course
router.get("/getAllCourses", getAllCourses);
//get details for a specific course
router.get("/getCourseDetails", getcourseDetails);

//              category routes
//**************************************************************8 */
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", showAllCategories);
router.get("/getCategoryPageDetails", categoryPageDetails);

//              Rating and Review
//************************************************ */
router.post("/createRating", auth, isStudent, createRating);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRating);

module.exports = router;
