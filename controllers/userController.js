const cloudinary = require("cloudinary").v2;
const { User } = require("../models");

exports.updateProfileImg = async (req, res, next) => {
  try {
    console.log(req.file);

    cloudinary.uploader.upload(req.file.path, (err, result) => {});

    await User.update(
      { profileImg: req.file.path },
      { where: { id: req.user.id } }
    );
    res.json({ message: "Upload profile image completed" });
  } catch (err) {
    next(err);
  }
};
