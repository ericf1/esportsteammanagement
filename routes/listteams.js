const express = require("express");
const router = express.Router();
const Team = require("../models/teams");

//listing out all the related teams and the team owner
router.post("/list", async (req, res) => {
  Team.find({ teamOwner: req.body.teamOwner }, function (err, docs) {
    // console.log(docs);
    res.send(docs);
  });
});

//returning the information of a give team id to be given to edit
router.post("/edit", async (req, res) => {
  Team.find({ _id: req.body._id }, function (err, docs) {
    // console.log(docs);
    res.send(docs);
  });
});

//deleting the given team id
router.post("/delete", async (req, res) => {
  const query = { _id: req.body._id };

  Team.findOneAndDelete(query, function (err, doc) {
    if (err) return res.status(500).json({ error: err });
    return res.json({ success: true });
  });
});

//listing out all of the other teams
router.post("/others", async (req, res) => {
  Team.find().then((result) => {
    otherTeam = [];
    for (let key in result) {
      if (result[key].teamOwner !== req.body.teamOwner) {
        otherTeam.push(result[key]);
      }
    }
    res.json(otherTeam);
  });
});

module.exports = router;
