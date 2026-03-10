import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  totalVisitors: {
    type: Number,
    default: 0,
  },
  responsiveTests: {
    type: Number,
    default: 0,
  },
  supporters: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("Analytics", analyticsSchema);
