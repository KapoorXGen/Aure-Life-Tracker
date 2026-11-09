import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
        select: false,
    },
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default User;