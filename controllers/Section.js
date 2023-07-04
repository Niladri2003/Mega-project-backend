const Section = require("../model/Section");
const Course = require("../model/Course");

exports.createSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, courseId } = req.body;
    //validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //create section
    const newSection = await Section.create({ sectionName });
    //update course with section object
    const updateCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    );
    //HW : use populate to replace section/Sub-section both in the updateCourseDetails
    //return response
    return res.status(200).json({
      success: true,
      message: "Section created Succesfully",
      updateCourse,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Unable to create section , please try again",
      error: e.message,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, sectionId } = req.body;
    //validate
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //update data
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    //return response
    return res.status(200).json({
      success: true,
      message: "Section updated Succesfully",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Unable to update section , please try again",
      error: e.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    //get ID - assuming that we are sending id in params
    const { sectionId } = req.params;
    //use findbyid and delete
    await Section.findByIdAndDelete(sectionId);
    //TODO -- do we need to delete the entry from the course schema
    //return response
    return res.status(200).json({
      success: true,
      message: "Section deleted succesfully",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete section , please try again",
      error: e.message,
    });
  }
};
