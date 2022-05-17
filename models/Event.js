const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    home: {
      type: String,
    },
    datetime: {
      type: Number,
    },
    accepted: {
      type: Boolean,
    },
    away: {
      type: String,
    },
    markAsReadHome: {
      type: Boolean,
    },
    markAsReadAway: {
      type: Boolean,
    },
    victor: {
      type: String,
    },
    loser: {
      type: String,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Event", eventSchema);
