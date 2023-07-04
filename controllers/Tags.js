const Tag = require("../model/Tag");

//create tag handler function

exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //create entry in db
    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });
    console.log(tagDetails);
    // return response
    return res.status(200).json({
      success: false,
      message: "Tag created Succesfully",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};
// get all tags

exports.showAllTags = async (req, res) => {
  try {
    const allTags = await Tag.find({}, { name: true, description: true });
    res.status(200).json({
      success: true,
      message: "All tags returned succesfully",
      allTags,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};
