module.exports = (sequelize, DataTypes) => {
    const Setting = sequelize.define('Setting', {
        name: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        data: DataTypes.STRING
    }, {});

    // Setting.associate = models => {
    //     // associations can be defined here
    // };

    return Setting;
};
