const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teamSchema = new Schema(
  {
    name: { type: "string", required: true },
    abb: { type: "string", required: true },
    members: { type: "array", required: true },
    teamOwner: { type: "string", required: true },
    photo: { type: "string" },
  },
  { timestamp: true }
);

const Leagueteam = mongoose.model("Leagueteam", teamSchema);
module.exports = Leagueteam;
