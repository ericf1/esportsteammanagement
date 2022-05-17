<script>
  const championsFormatted = {
    0: "Does not play a champion :(",
    266: "Aatrox",
    103: "Ahri",
    84: "Akali",
    166: "Akshan",
    12: "Alistar",
    32: "Amumu",
    34: "Anivia",
    1: "Annie",
    523: "Aphelios",
    22: "Ashe",
    136: "AurelionSol",
    268: "Azir",
    432: "Bard",
    53: "Blitzcrank",
    63: "Brand",
    201: "Braum",
    51: "Caitlyn",
    164: "Camille",
    69: "Cassiopeia",
    31: "Chogath",
    42: "Corki",
    122: "Darius",
    131: "Diana",
    119: "Draven",
    36: "DrMundo",
    245: "Ekko",
    60: "Elise",
    28: "Evelynn",
    81: "Ezreal",
    9: "Fiddlesticks",
    114: "Fiora",
    105: "Fizz",
    3: "Galio",
    41: "Gangplank",
    86: "Garen",
    150: "Gnar",
    79: "Gragas",
    104: "Graves",
    887: "Gwen",
    120: "Hecarim",
    74: "Heimerdinger",
    420: "Illaoi",
    39: "Irelia",
    427: "Ivern",
    40: "Janna",
    59: "JarvanIV",
    24: "Jax",
    126: "Jayce",
    202: "Jhin",
    222: "Jinx",
    145: "Kaisa",
    429: "Kalista",
    43: "Karma",
    30: "Karthus",
    38: "Kassadin",
    55: "Katarina",
    10: "Kayle",
    141: "Kayn",
    85: "Kennen",
    121: "Khazix",
    203: "Kindred",
    240: "Kled",
    96: "KogMaw",
    7: "LeBlanc",
    64: "LeeSin",
    89: "Leona",
    876: "Lillia",
    127: "Lissandra",
    236: "Lucian",
    117: "Lulu",
    99: "Lux",
    54: "Malphite",
    90: "Malzahar",
    57: "Maokai",
    11: "MasterYi",
    21: "MissFortune",
    62: "Wukong",
    82: "Mordekaiser",
    25: "Morgana",
    267: "Nami",
    75: "Nasus",
    111: "Nautilus",
    518: "Neeko",
    76: "Nidalee",
    56: "Nocturne",
    20: "Nunu",
    2: "Olaf",
    61: "Orianna",
    516: "Ornn",
    80: "Pantheon",
    78: "Poppy",
    555: "Pyke",
    246: "Qiyana",
    133: "Quinn",
    497: "Rakan",
    33: "Rammus",
    421: "Reksai",
    526: "Rell",
    888: "Renata",
    58: "Renekton",
    107: "Rengar",
    92: "Riven",
    68: "Rumble",
    13: "Ryze",
    360: "Samira",
    113: "Sejuani",
    235: "Senna",
    147: "Seraphine",
    875: "Sett",
    35: "Shaco",
    98: "Shen",
    102: "Shyvana",
    27: "Singed",
    14: "Sion",
    15: "Sivir",
    72: "Skarner",
    37: "Sona",
    16: "Soraka",
    50: "Swain",
    517: "Sylas",
    134: "Syndra",
    223: "TahmKench",
    163: "Taliyah",
    91: "Talon",
    44: "Taric",
    17: "Teemo",
    412: "Thresh",
    18: "Tristana",
    48: "Trundle",
    23: "Tryndamere",
    4: "TwistedFate",
    29: "Twitch",
    77: "Udyr",
    6: "Urgot",
    110: "Varus",
    67: "Vayne",
    45: "Veigar",
    161: "Vel'Koz",
    711: "Vex",
    254: "Vi",
    234: "Viego",
    112: "Viktor",
    8: "Vladimir",
    106: "Volibear",
    19: "Warwick",
    498: "Xayah",
    101: "Xerath",
    5: "XinZhao",
    157: "Yasuo",
    777: "Yone",
    83: "Yorick",
    350: "Yuumi",
    154: "Zac",
    238: "Zed",
    221: "Zeri",
    115: "Ziggs",
    26: "Zilean",
    142: "Zoe",
    143: "Zyra",
  };
  const champions = {
    0: "Does not play a champion :(",
    266: "Aatrox",
    103: "Ahri",
    84: "Akali",
    166: "Akshan",
    12: "Alistar",
    32: "Amumu",
    34: "Anivia",
    1: "Annie",
    523: "Aphelios",
    22: "Ashe",
    136: "Aurelion Sol",
    268: "Azir",
    432: "Bard",
    53: "Blitzcrank",
    63: "Brand",
    201: "Braum",
    51: "Caitlyn",
    164: "Camille",
    69: "Cassiopeia",
    31: "Cho'Gath",
    42: "Corki",
    122: "Darius",
    131: "Diana",
    119: "Draven",
    36: "Dr. Mundo",
    245: "Ekko",
    60: "Elise",
    28: "Evelynn",
    81: "Ezreal",
    9: "Fiddlesticks",
    114: "Fiora",
    105: "Fizz",
    3: "Galio",
    41: "Gangplank",
    86: "Garen",
    150: "Gnar",
    79: "Gragas",
    104: "Graves",
    887: "Gwen",
    120: "Hecarim",
    74: "Heimerdinger",
    420: "Illaoi",
    39: "Irelia",
    427: "Ivern",
    40: "Janna",
    59: "Jarvan IV",
    24: "Jax",
    126: "Jayce",
    202: "Jhin",
    222: "Jinx",
    145: "Kai'Sa",
    429: "Kalista",
    43: "Karma",
    30: "Karthus",
    38: "Kassadin",
    55: "Katarina",
    10: "Kayle",
    141: "Kayn",
    85: "Kennen",
    121: "Kha'Zix",
    203: "Kindred",
    240: "Kled",
    96: "Kog'Maw",
    7: "LeBlanc",
    64: "Lee Sin",
    89: "Leona",
    876: "Lillia",
    127: "Lissandra",
    236: "Lucian",
    117: "Lulu",
    99: "Lux",
    54: "Malphite",
    90: "Malzahar",
    57: "Maokai",
    11: "Master Yi",
    21: "Miss Fortune",
    62: "Wukong",
    82: "Mordekaiser",
    25: "Morgana",
    267: "Nami",
    75: "Nasus",
    111: "Nautilus",
    518: "Neeko",
    76: "Nidalee",
    56: "Nocturne",
    20: "Nunu & Willump",
    2: "Olaf",
    61: "Orianna",
    516: "Ornn",
    80: "Pantheon",
    78: "Poppy",
    555: "Pyke",
    246: "Qiyana",
    133: "Quinn",
    497: "Rakan",
    33: "Rammus",
    421: "Rek'Sai",
    526: "Rell",
    888: "Renata Glasc",
    58: "Renekton",
    107: "Rengar",
    92: "Riven",
    68: "Rumble",
    13: "Ryze",
    360: "Samira",
    113: "Sejuani",
    235: "Senna",
    147: "Seraphine",
    875: "Sett",
    35: "Shaco",
    98: "Shen",
    102: "Shyvana",
    27: "Singed",
    14: "Sion",
    15: "Sivir",
    72: "Skarner",
    37: "Sona",
    16: "Soraka",
    50: "Swain",
    517: "Sylas",
    134: "Syndra",
    223: "Tahm Kench",
    163: "Taliyah",
    91: "Talon",
    44: "Taric",
    17: "Teemo",
    412: "Thresh",
    18: "Tristana",
    48: "Trundle",
    23: "Tryndamere",
    4: "Twisted Fate",
    29: "Twitch",
    77: "Udyr",
    6: "Urgot",
    110: "Varus",
    67: "Vayne",
    45: "Veigar",
    161: "Vel'Koz",
    711: "Vex",
    254: "Vi",
    234: "Viego",
    112: "Viktor",
    8: "Vladimir",
    106: "Volibear",
    19: "Warwick",
    498: "Xayah",
    101: "Xerath",
    5: "Xin Zhao",
    157: "Yasuo",
    777: "Yone",
    83: "Yorick",
    350: "Yuumi",
    154: "Zac",
    238: "Zed",
    221: "Zeri",
    115: "Ziggs",
    26: "Zilean",
    142: "Zoe",
    143: "Zyra",
  };
  export let loggedInOthers = false;
  export let correctUsername = "";
  let individualTeam = false;
  let promise;
  let teamPromise;
  let currentId;
  const riotAPIKey = "RGAPI-57941ee5-a1c7-42af-ac11-38bdaccc729c";
  let time;
  let date;
  let homeTeam = "sadness";

  const fetchWinrate = async (teamID) => {
    let response = await fetch("/teams/winrate", {
      method: "POST",
      body: JSON.stringify({ _id: teamID }),
      headers: { "content-type": "application/json" },
    });
    let data = await response.json();
    let winrate = await data.winrate;
    return (await winrate) * 100;
  };

  const fetchRank = async (summonerName) => {
    try {
      let playerData = {};
      let response1 = await fetch(
        `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${riotAPIKey}`,
        {
          method: "GET",
          headers: { "content-type": "application/json" },
        }
      );
      let data1 = await response1.json();
      const accountId = await data1.id;
      let response2 = await fetch(
        `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${accountId}?api_key=${riotAPIKey}`
      );
      let data2 = await response2.json();
      console.log(await data2);
      if ((await data2).length === 0) {
        playerData["rank"] = "Unranked";
      } else {
        console.log("dont help");
        playerData["rank"] =
          (await data2[0].tier) + " " + (await data2[0].rank);
      }

      let response3 = await fetch(
        `https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${accountId}?api_key=${riotAPIKey}`
      );
      let data3 = await response3.json();
      if ((await data3).length === 0) {
        playerData["mostPlayed"] = 0;
      } else {
        let allPlayed = await data3;
        let max = 0;
        await allPlayed.forEach((champion) => {
          if (champion.championPoints >= max) {
            max = champion.championPoints;
            playerData["mostPlayed"] = champion.championId;
          }
        });
      }

      console.log(await playerData);

      return await playerData;
    } catch {
      return "";
    }
  };

  const listMyTeams = async () => {
    let res = await fetch("/teams/list", {
      method: "POST",
      body: JSON.stringify({ teamOwner: correctUsername }),
      headers: { "content-type": "application/json" },
    });
    return await res.json();
  };

  const listTeams = async () => {
    let res = await fetch("/teams/others", {
      method: "POST",
      body: JSON.stringify({ teamOwner: correctUsername }),
      headers: { "content-type": "application/json" },
    });
    return await res.json();
  };
  $: if (loggedInOthers) {
    promise = listTeams();
  }

  const listTeammates = async () => {
    let res = await fetch("/teams/edit", {
      method: "POST",
      body: JSON.stringify({ _id: currentId }),
      headers: { "content-type": "application/json" },
    });
    return await res.json();
  };

  $: if (individualTeam) {
    teamPromise = listTeammates();
  }

  const eventInvite = () => {
    if (!document.getElementById("teamSelect").value) {
      alert("Enter a team");
      return;
    }
    if (!date) {
      alert("Enter a date");
      return;
    }
    if (!time) {
      alert("Enter a time");
      return;
    }
    individualTeam = false;
    let dateStr = date + "T" + time + ":00";
    let datetime = new Date(dateStr);
    let unixTime = Math.floor(datetime.getTime() / 1000);
    let currentdate = new Date();
    let currentUnixTime = Math.floor(currentdate.getTime() / 1000);
    if (unixTime < currentUnixTime) {
      alert("Select a time in the future");
      return;
    }
    const data = {
      home: document.getElementById("teamSelect").value,
      datetime: unixTime,
      away: currentId,
      accepted: false,
      markAsRead: false,
    };
    console.log(homeTeam);
    fetch("/teams/new-event", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "content-type": "application/json" },
    });
  };
</script>

{#if loggedInOthers}
  <div
    class="backdrop"
    on:click={() => {
      loggedInOthers = false;
    }}
  />
  <div class="modal">
    <h1>Other Teams:</h1>
    {#await promise}
      <p>Loading...</p>
    {:then user}
      {#each user as user}
        <div class="eachteam">
          <h4
            class="team"
            on:click={() => {
              console.log(user);
              individualTeam = true;
              loggedInOthers = false;
              currentId = user._id;
            }}
          >
            {user.name}[{user.abb}]
          </h4>
          {#await fetchWinrate(user._id) then winrate}
            Winrate:
            {#if winrate}
              {Math.round(winrate * 100) / 100}%
            {:else}
              <p>0%</p>
            {/if}
          {/await}
        </div>
      {/each}
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}
  </div>
{/if}

{#if individualTeam}
  <div
    class="backdrop"
    on:click={() => {
      individualTeam = false;
    }}
  />
  <div class="modal">
    {#await teamPromise}
      <p>Loading...</p>
    {:then user}
      <h1>{user[0].name}</h1>
      <div class="whole-team">
        {#each user[0].members as member}
          <div class="member">
            <div class="name">{member}</div>
            {#await fetchRank(member)}
              <p>Loading...</p>
            {:then data}
              {#if data}
                <div class="rank">{data.rank}</div>
                <div class="most-played">
                  {champions[data.mostPlayed]}
                  {#if champions[data.mostPlayed] !== "Does not play a champion :("}
                    <img
                      src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/{championsFormatted[
                        data.mostPlayed
                      ]}_0.jpg"
                      alt="championMostPlayed"
                      class="championIcon"
                    />
                  {/if}
                </div>
              {:else}
                <div class="rank">Player does not exist (contact us)</div>
              {/if}
            {/await}
            <br />
          </div>
        {/each}
      </div>
    {:catch error}
      <p style="color: red">{error.message}</p>
    {/await}

    <div>
      <h3>Schedule a scrim!</h3>
      <form action="#" method="post">
        <input type="date" bind:value={date} />
        <input type="time" bind:value={time} />
        <select id="teamSelect" bind:value={homeTeam}>
          {#await listMyTeams()}
            <p>Loading...</p>
          {:then data}
            {#each data as team}
              <option value={team._id}>{team.name}</option>
            {/each}
          {/await}
        </select>
        <input
          type="submit"
          value="Invite"
          on:click={(event) => {
            event.preventDefault();
            eventInvite();
          }}
        />
      </form>
    </div>
  </div>
{/if}

<style>
  .eachteam {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    transition: 200ms ease-in-out;
    opacity: 1;
    pointer-events: all;
  }
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: 200ms ease-in-out;
    border: 1px solid black;
    border-radius: 0.8rem;
    z-index: 10;
    text-align: center;
    background-color: aliceblue;
    height: 40rem;
    width: 40rem;
    max-width: 80%;
    overflow-y: scroll;
  }
  .championIcon {
    width: 6rem;
    height: 4rem;
  }
  .member {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: center;
    align-items: center;
  }
  .whole-team {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .name {
    width: 8rem;
    height: 7rem;
    border: 1px solid black;
  }
  .rank {
    width: 8rem;
    height: 7rem;
    border: 1px solid black;
  }
  .most-played {
    display: flex;
    flex-direction: column;
    width: 10rem;
    height: 7rem;
    border: 1px solid black;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
</style>
