const express = require("express");
const router = express.Router();
const Team = require("../models/teams");
const Event = require("../models/event");

router.post("/new-event", async (req, res) => {
  const event = new Event({
    home: req.body.home,
    away: req.body.away,
    datetime: req.body.datetime,
    accepted: req.body.accepted,
    markAsReadHome: req.body.markAsRead,
    markAsReadAway: req.body.markAsRead,
    victor: "",
    loser: "",
  });
  event
    .save()
    .then((user) => {
      res.status(201).json({
        message: true,
      });
    })
    .catch((err) => {
      res.json({ error: err });
    });
});

router.post("/register-team", async (req, res) => {
  const team = new Team({
    name: req.body.teamName,
    abb: req.body.abb,
    members: req.body.members,
    teamOwner: req.body.teamOwner,
  });
  console.log(team);
  team
    .save()
    .then((user) => {
      res.status(201).json({
        message: true,
        name: req.body.teamName,
        abb: req.body.abb,
        members: req.body.members,
      });
    })
    .catch((err) => {
      res.json({ error: err });
    });
});

router.post("/update", async (req, res) => {
  const query = { _id: req.body._id };
  newData = {
    name: req.body.teamName,
    abb: req.body.abb,
    members: req.body.members,
  };

  Team.findOneAndUpdate(query, newData, { upsert: true }, function (err, doc) {
    if (err) return res.status(500).json({ error: err });
    return res.json({ success: true });
  });
});

router.post("/accepted-scrims", async (req, res) => {
  const query = { _id: req.body._id };
  newData = {
    accepted: true,
  };

  Event.findOneAndUpdate(query, newData, { upsert: true }, function (err, doc) {
    if (err) return res.status(500).json({ error: err });
    return res.json({ success: true });
  });
});

router.post("/mark-as-read", async (req, res) => {
  let response = await Team.find({ teamOwner: req.body.teamOwner });
  console.log(response);
  const query = { _id: req.body._id };
  newDataHome = {
    markAsReadHome: true,
  };
  newDataAway = {
    markAsReadAway: true,
  };

  for (let key in response) {
    let anotherResponse = await Event.findOne({
      home: response[key].id,
      _id: req.body._id,
    });
    console.log(anotherResponse);
    let anotherAnotherResponse = await Event.findOne({
      away: response[key].id,
      _id: req.body._id,
    });
    console.log(anotherAnotherResponse);
    if (anotherResponse) {
      Event.findOneAndUpdate(
        query,
        newDataHome,
        { upsert: true },
        function (err, doc) {
          if (err) return res.status(500).json({ error: err });
          return res.json({ success: true });
        }
      );
    }
    if (anotherAnotherResponse) {
      Event.findOneAndUpdate(
        query,
        newDataAway,
        { upsert: true },
        function (err, doc) {
          if (err) return res.status(500).json({ error: err });
          return res.json({ success: true });
        }
      );
    }
  }
});

router.post("/declined-scrims", async (req, res) => {
  const query = { _id: req.body._id };

  Event.findOneAndDelete(query, function (err, doc) {
    if (err) return res.status(500).json({ error: err });
    return res.json({ success: true });
  });
});

router.post("/pending-scrims", async (req, res) => {
  let answer = [];
  let response = await Team.find({ teamOwner: req.body.teamOwner });

  for (let key in response) {
    let anotherResponse = await Event.find({ away: response[key].id });
    for (let anotherKey in anotherResponse) {
      if (anotherResponse[anotherKey].accepted === false) {
        await answer.push(anotherResponse[anotherKey]);
      }
    }
  }

  await res.json(await answer);
});

router.post("/current-notifications", async (req, res) => {
  let answer = [];

  let response = await Team.find({ teamOwner: req.body.teamOwner });

  for (let key in response) {
    let anotherResponse = await Event.find({ home: response[key].id });
    for (let anotherKey in anotherResponse) {
      const currentDate = await new Date();
      let unixTime = await Math.floor(currentDate.getTime() / 1000);
      if (
        anotherResponse[anotherKey].datetime <= unixTime &&
        anotherResponse[anotherKey].accepted &&
        anotherResponse[anotherKey].markAsReadHome === false
      ) {
        let info = await {
          _id: anotherResponse[anotherKey]._id,
          oppID: anotherResponse[anotherKey].away,
          ourID: anotherResponse[anotherKey].home,
          datetime: anotherResponse[anotherKey].datetime,
          markAsRead: anotherResponse[anotherKey].markAsReadHome,
        };
        // console.log(info);
        await answer.push(info);
      }
    }
  }

  for (let key in response) {
    let anotherResponse = await Event.find({ away: response[key].id });
    for (let anotherKey in anotherResponse) {
      const currentDate = await new Date();
      let unixTime = await Math.floor(currentDate.getTime() / 1000);
      if (
        anotherResponse[anotherKey].datetime <= unixTime &&
        anotherResponse[anotherKey].accepted &&
        anotherResponse[anotherKey].markAsReadAway === false
      ) {
        let info = await {
          _id: anotherResponse[anotherKey]._id,
          oppID: anotherResponse[anotherKey].home,
          ourID: anotherResponse[anotherKey].away,
          datetime: anotherResponse[anotherKey].datetime,
          markAsRead: anotherResponse[anotherKey].markAsReadAway,
        };
        await answer.push(info);
        //answer.push(anotherResponse[anotherKey]);
      }
    }
  }

  await res.json(await answer);
});

router.post("/future-scrims", async (req, res) => {
  let answer = [];

  let response = await Team.find({ teamOwner: req.body.teamOwner });

  for (let key in response) {
    let anotherResponse = await Event.find({ home: response[key].id });
    for (let anotherKey in anotherResponse) {
      const currentDate = await new Date();
      let unixTime = await Math.floor(currentDate.getTime() / 1000);
      if (
        anotherResponse[anotherKey].datetime >= unixTime &&
        anotherResponse[anotherKey].accepted
        // && anotherResponse[anotherKey].markAsRead === false
      ) {
        let info = await {
          _id: anotherResponse[anotherKey]._id,
          oppID: anotherResponse[anotherKey].away,
          ourID: anotherResponse[anotherKey].home,
          datetime: anotherResponse[anotherKey].datetime,
          markAsRead: anotherResponse[anotherKey].markAsReadHome,
        };
        // console.log(info);
        await answer.push(info);
      }
    }
  }

  for (let key in response) {
    let anotherResponse = await Event.find({ away: response[key].id });
    for (let anotherKey in anotherResponse) {
      const currentDate = await new Date();
      let unixTime = await Math.floor(currentDate.getTime() / 1000);
      if (
        anotherResponse[anotherKey].datetime >= unixTime &&
        anotherResponse[anotherKey].accepted
        // && anotherResponse[anotherKey].markAsRead === false
      ) {
        let info = await {
          _id: anotherResponse[anotherKey]._id,
          oppID: anotherResponse[anotherKey].home,
          ourID: anotherResponse[anotherKey].away,
          datetime: anotherResponse[anotherKey].datetime,
          markAsRead: anotherResponse[anotherKey].markAsReadAway,
        };
        await answer.push(info);
        //answer.push(anotherResponse[anotherKey]);
      }
    }
  }

  await res.json(await answer);
});

router.post("/ongoing-scrims", async (req, res) => {
  let answer = [];

  let response = await Team.find({ teamOwner: req.body.teamOwner });
  console.log(response);
  for (let key in response) {
    let anotherResponse = await Event.find({ home: response[key].id });
    for (let anotherKey in anotherResponse) {
      const currentDate = await new Date();
      let unixTime = await Math.floor(currentDate.getTime() / 1000);
      if (
        anotherResponse[anotherKey].accepted &&
        anotherResponse[anotherKey].markAsReadHome === true &&
        anotherResponse[anotherKey].markAsReadAway === true &&
        anotherResponse[anotherKey].victor === ""
      ) {
        let info = await {
          _id: anotherResponse[anotherKey]._id,
          oppID: anotherResponse[anotherKey].away,
          ourID: anotherResponse[anotherKey].home,
          datetime: anotherResponse[anotherKey].datetime,
          markAsRead: anotherResponse[anotherKey].markAsReadHome,
        };
        // console.log(info);
        await answer.push(info);
      }
    }
  }

  for (let key in response) {
    let anotherResponse = await Event.find({ away: response[key].id });
    for (let anotherKey in anotherResponse) {
      const currentDate = await new Date();
      let unixTime = await Math.floor(currentDate.getTime() / 1000);
      if (
        anotherResponse[anotherKey].accepted &&
        anotherResponse[anotherKey].markAsReadHome === true &&
        anotherResponse[anotherKey].markAsReadAway === true &&
        anotherResponse[anotherKey].victor === ""
      ) {
        let info = await {
          _id: anotherResponse[anotherKey]._id,
          oppID: anotherResponse[anotherKey].home,
          ourID: anotherResponse[anotherKey].away,
          datetime: anotherResponse[anotherKey].datetime,
          markAsRead: anotherResponse[anotherKey].markAsReadAway,
        };
        await answer.push(info);
        //answer.push(anotherResponse[anotherKey]);
      }
    }
  }

  await res.json(await answer);
});

router.post("/report-scrim", async (req, res) => {
  const query = { _id: req.body._id };
  newData = {
    victor: req.body.victor,
    loser: req.body.loser,
  };

  Event.findOneAndUpdate(query, newData, { upsert: true }, function (err, doc) {
    if (err) return res.status(500).json({ error: err });
    return res.json({ success: true });
  });
});

router.post("/winrate", async (req, res) => {
  let winningGames = await Event.find({ victor: req.body._id });
  let losingGames = await Event.find({ loser: req.body._id });

  numWinningGames = winningGames.length;
  numLosingGames = losingGames.length;
  let winrate = (await numWinningGames) / (numLosingGames + numWinningGames);
  await res.json({ winrate: winrate });
});

//match history management
router.post("/match-history", async (req, res) => {
  let losing = [];
  let winning = [];
  let answer = [];
  let response = await Team.find({ teamOwner: req.body.teamOwner });

  for (let key in response) {
    let winningGames = await Event.find({ victor: response[key]._id });
    let losingGames = await Event.find({ loser: response[key]._id });

    for (let game in winningGames) {
      let newJSON = JSON.parse(JSON.stringify(winningGames[game]));
      newJSON["results"] = "VICTORY :D";
      winning.push(newJSON);
    }

    for (let game in losingGames) {
      let newJSON = JSON.parse(JSON.stringify(losingGames[game]));
      newJSON["results"] = "DEFEAT D:";
      losing.push(newJSON);
    }
  }
  res.json({ winning: winning, losing: losing });
});

module.exports = router;
