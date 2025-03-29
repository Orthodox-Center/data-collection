import mongoose from "mongoose";

const LetterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  family: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
    min: 1,
    max: 7,
  },
  rank: {
    type: Number,
    required: true,
    min: 1,
    max: 34,
  },
  translation: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Letter", LetterSchema);
