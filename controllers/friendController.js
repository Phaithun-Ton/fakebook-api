const { Op } = require("sequelize");
const { Friend, User } = require("../models");

exports.getUnknown = async (req, res, next) => {
  try {
    const friends = await Friend.findAll({
      where: {
        [Op.or]: [{ requestFromId: req.user.id }, { requestToId: req.user.id }],
      },
    });
    const friendIds = friends.reduce(
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
    const users = await User.findAll({
      where: {
        id: {
          [Op.notIn]: friendIds,
        },
      },
    });
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

exports.getAllFriends = async (req, res, next) => {
  try {
    const { status, searchName } = req.query;
    let where = {
      [Op.or]: [{ requestFromId: req.user.id }, { requestToId: req.user.id }],
    };

    if (status === "ACCEPTED") {
      where = {
        status,
        [Op.or]: [{ requestFromId: req.user.id }, { requestToId: req.user.id }],
      };
    } else if (status === "REQUESTED") {
      where = {
        status,
        requestToId: req.user.id,
      };
    }
    // where (`requestFromId` = req.user.id or `requestFromId` = req.user.id) and `status` = 'ACCEPTED`
    const friends = await Friend.findAll({ where });
    // console.log(friends);
    const friendIds = friends.reduce((acc, item) => {
      if (req.user.id === item.requestFromId) {
        acc.push(item.requestToId);
      } else {
        acc.push(item.requestFromId);
      }
      return acc;
    }, []);

    let userWhere = {};
    if (searchName) {
      userWhere = {
        [Op.or]: [
          {
            firstName: {
              [Op.substring]: searchName,
            },
          },
          {
            lastName: {
              [Op.substring]: searchName,
            },
          },
        ],
      };
    }
    // select * from user where id in (friendIds) and (firstName like '%searchName%' or lastName like '%searchName%')
    const users = await User.findAll({
      where: {
        id: friendIds,
        ...userWhere,
      },
      attributes: {
        exclude: ["password"],
      },
    });
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
};

exports.requestFriend = async (req, res, next) => {
  try {
    const { requestToId } = req.body;

    if (req.user.id === requestToId) {
      return res.status(400).json({ message: "cannot request youself" });
    }
    const existFriend = await Friend.findOne({
      where: {
        [Op.or]: [
          { requestFromId: req.user.id, requestToId },
          { requestFromId: requestToId, requestToId: req.user.id },
        ],
      },
    });
    console.log(existFriend);
    if (existFriend) {
      return res
        .status(400)
        .json({ message: "This friend has already been requested" });
    }
    await Friend.create({
      requestToId,
      status: "REQUESTED",
      requestFromId: req.user.id,
    });
    res.status(200).json({ message: "request has been sent" });
  } catch (err) {
    next(err);
  }
};

exports.updateFriend = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const friend = await Friend.findOne({
      where: {
        requestToId: req.user.id,
        requestFromId: friendId,
        status: "REQUESTED",
      },
    });
    if (!friend) {
      return res.status(400).json({ message: "this friend request not found" });
    }

    friend.status = "ACCEPTED";
    await friend.save();
    res.status(200).json({ message: "friend request accepted" });
  } catch (err) {
    next(err);
  }
};

exports.deleteFriend = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const friend = await Friend.findOne({
      where: {
        [Op.or]: [
          { requestToId: req.user.id, requestFromId: friendId },
          { requestToId: friendId, requestFromId: req.user.id },
        ],
      },
    });
    if (!friend) {
      return res.status(400).json({ message: "this friend request not found" });
    }

    await friend.destroy();
    res.status(204).json();
  } catch (err) {
    next(err);
  }
};
