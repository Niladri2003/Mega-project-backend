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
    //Create a new section with the given name
    const newSection = await Section.create({ sectionName });

    //Add the new section to the course's content array
    const updateCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
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

// UPDATE a section
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
      message: section,
    });
  } catch (e) {
    console.error("Error updating section:", e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE a section
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
