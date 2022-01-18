module.exports = (sequelize, DataTypes) => {
  const Friend = sequelize.define(
    "Friend",
    {
      status: {
        // type: DataTypes.ENUM('REQUETED','ACCEPTED')
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "REQUESTED",
        validate: {
          isIn: [["REQUESTED", "ACCEPTED"]],
        },
      },
    },
    {
      underscored: true,
    }
  );
  Friend.associate = (models) => {
    Friend.belongsTo(models.User, {
      as: "RequestFrom",
      foreignKey: {
        name: "RequestFromId",
        allowNull: false,
      },
    });
    Friend.belongsTo(models.User, {
      as: "RequestTo",
      foreignKey: {
        name: "RequestToId",
        allowNull: false,
      },
    });
  };
  return Friend;
};
