const fs = require("fs");
const util = require("util");
const cloudinary = require("cloudinary").v2;
const { Op } = require("sequelize");
const { Post, sequelize, Like, Comment, Friend, User } = require("../models");

const uploadPromise = util.promisify(cloudinary.uploader.upload);
// const deletePromise = util.destroy(splied[splied.length - 1].split(".")[0]);

exports.getAllPosts = async (req, res, next) => {
  try {
    const friends = await Friend.findAll({
      where: {
        [Op.or]: [{ requestFromId: req.user.id }, { requestToId: req.user.id }],
        status: "ACCEPTED",
      },
    });
    // console.log(friends);
    const userIds = friends.reduce(
      (acc, item) => {
        if (req.user.id === item.requestFromId) {
          acc.push(item.requestToId);
        } else {
          acc.push(item.requestFromId);
        }
        return acc;
      },
      [req.user.id]
    );
    const posts = await Post.findAll({
      where: { userId: userIds },
      include: [
        {
          model: User,
          attributes: ["id", "firstName", "lastName", "profileImg"],
        },
        {
          model: Comment,
          include: {
            model: User,
            attributes: ["id", "firstName", "lastName", "profileImg"],
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title && !req.file) {
      return res.status(400).json({ message: "title or image is request" });
    }
    let result = {};
    if (req.file) {
      result = await uploadPromise(req.file.path);
      fs.unlinkSync(req.file.path);
    }

    const post = await Post.create({
      title,
      userId: req.user.id,
      img: result.secure_url,
    });
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const post = await Post.findOne({ where: { id } });
    if (!post) {
      return res.status(400).json({ message: "post not found" });
    }
    await Like.destroy({ where: { postId: id } }, { transaction });
    await Comment.destroy({ where: { postId: id } }, { transaction });
    await Post.destroy({ where: { id } }, { transaction });
    await transaction.commit();
    // const splied = req.user.profileImg.split("/");
    // await deletePromise(splied);
    res.status(204).json();
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};
