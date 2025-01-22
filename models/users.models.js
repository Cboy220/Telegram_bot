const { mongoose } = require("mongoose");

const UserSchema = mongoose.Schema({
    userName: String,
    telegramId: Number,
    userLanguage: String,
    userPhone: String,
}, { versionKey: false, timestamps: true });

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;