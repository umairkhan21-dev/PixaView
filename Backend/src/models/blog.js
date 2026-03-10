import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        content: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            default: "",
        },
        coverImage: {
            type: String,
            default: "",
        },
        published: {
            type: Boolean,
            default: true,
        },
    },
    {timestamps: true}
)

export default mongoose.model("Blog", blogSchema);
