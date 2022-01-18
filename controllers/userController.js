const cloudinary = require("cloudinary").v2;
const { User } = require("../models");

exports.updateProfileImg = (req, res, next) => {
  console.log(req.file);

  cloudinary.uploader.upload(req.file.path, async (err, result) => {
    if (err) return next(err);

    await User.update(
      { profileImg: result.secure_url },
      { where: { id: req.user.id } }
    );
    res.json({ message: "Upload profile image completed" });
  });
};
