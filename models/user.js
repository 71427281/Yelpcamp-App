var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    avatar: String,
    email: { type: String, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {type: Boolean, default:false}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);

