const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  const name = req.body.name;
  const password = req.body.password;
  User.findOne({ name: name }).then((user) => {
    if (!user) {
      res.json({ login: false, message: "Incorrect Username" });
      return;
    }

    bcrypt.compare(password, user.password, (err, matched) => {
      if (err) {
        res.json({
          success: false,
        });
        return;
      }
      if (matched) {
        let token = jwt.sign({ name: user.name }, "token", { expiresIn: "1h" });
        res.json({
          token: token,
          login: true,
          user: user.name,
          email: user.email,
        });
        return;
      }
      res.json({ login: false, message: "Password does not match" });
    });
  });
});

module.exports = router;
