module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profileImg: {
        type: DataTypes.STRING,
      },
    },
    {
      underscored: true,
    }
  );
  User.associate = (models) => {
    User.hasMany(models.Post, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
    });
    User.hasMany(models.Comment, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
    });
    User.hasMany(models.Like, {
      foreignKey: {
        name: "userId",
        allowNull: false,
      },
    });
    User.hasMany(models.Friend, {
      as: "requestFrom",
      foreignKey: {
        name: "requestFromId",
        allowNull: false,
      },
    });
    User.hasMany(models.Friend, {
      as: "requestTo",
      foreignKey: {
        name: "requestToId",
        allowNull: false,
      },
    });
  };
  return User;
};
