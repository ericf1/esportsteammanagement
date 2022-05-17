const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const cron = require("node-cron");
app.use(express.json());

const dbURI =
  "mongodb+srv://mongo:mongo@teammanagement.47han.mongodb.net/teammanage?retryWrites=true&w=majority";
const Leagueteam = require("./models/teams");
const NewteamRoute = require("./routes/newteam");
const AuthRoute = require("./routes/auth");
const LoginRoute = require("./routes/login");
const ListRoute = require("./routes/listteams");
// const UploadRoute = require("./routes/upload");
// app.use("/upload", UploadRoute);
app.use("/logins", AuthRoute);
app.use("/logins", LoginRoute);
app.use("/teams", NewteamRoute);
app.use("/teams", ListRoute);

mongoose
  .connect(dbURI)
  .then((result) => {
    app.listen(port, () => {
      console.log(`Server is up at port ${port}`);
    });
    console.log("Connected To DB");
  })
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

// app.get("/add-team", (req, res) => {
//   const team = new Leagueteam({
//     name: "Team Solo Mid",
//     abb: "TSM",
//     members: ["John"],
//   });
//   team
//     .save()
//     .then((result) => res.send(result))
//     .catch((err) => cons ole.log(err));
// });

app.get("/list-teams", (req, res) => {
  Leagueteam.find()
    .then((result) => res.send(result))
    .catch((err) => console.log(err));
});

app.post("/help", (req, res) => {
  console.log(req.body);
  res.status(201).send({ success: true, message: req.body });
});

cron.schedule("* * * * *", function () {
  console.log("One minute has passed");
});
