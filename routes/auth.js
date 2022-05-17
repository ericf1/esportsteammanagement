const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  bcrypt.hash(req.body.password, 10, function (err, hashedPass) {
    if (err) {
      res.json({ error: err });
    }
    let user = new User({
      name: req.body.name,
      email: req.body.abb,
      password: hashedPass,
    });
    user
      .save()
      .then((user) => {
        res.status(201).json({ message: true });
        console.log(user);
      })
      .catch((err) => {
        res.json({ error: err });
      });
  });
});

module.exports = router;
