const SubSection = require("../model/SubSection");
const Section = require("../model/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//Create a new sub-section for a given section

exports.createSubsection = async (req, res) => {
  try {
    //fetch all data from req body
    const { SectionId, title, timeDuration, description } = req.body;
    //extract file
    const video = req.files.videoFile;
    //validate data
    if (!SectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are rewuired",
      });
    }
    //upload video to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    //create subsection
    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });
    // push subsection-id in section
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: SectionId },
      {
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    ).populate("subSection");
    // HW-> log updated sectuin Headers, after adding populate query
    //return response
    return res.status(200).json({
      success: true,
      message: "sub-Section updated Succesfully",
      updatedSection,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Unable to create sub-section , please try again",
      error: e.message,
    });
  }
};
//HW---
//update subsection
//delete subsection
