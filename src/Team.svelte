<script>
  //   import { onMount } from "svelte";
  export let loggedIn = false;
  export let correctUsername = "";
  // export let teamList = [];
  export let promise = null;
  export let teamEdit = false;
  export let players = ["", "", "", "", ""];
  export let teamName;
  export let abb;
  export let _id;
  export let updateTeamBoolean = false;
  export let clickedRegister = false;
  let listTeamsToggle = true;
  let promise2;
  let updateOngoing = true;
  let updateUpcoming = true;

  const waitingOngoing = new Promise(() => {
    setTimeout(() => {
      updateOngoing = true;
    }, 15);
  });

  const waitingUpcoming = new Promise(() => {
    setTimeout(() => {
      updateUpcoming = true;
    }, 15);
  });

  const victorResult = async (eventID, victorID, loserID) => {
    let res = await fetch("/teams/report-scrim", {
      method: "POST",
      body: JSON.stringify({ _id: eventID, victor: victorID, loser: loserID }),
      headers: { "content-type": "application/json" },
    });
    return await res.json();
  };

  const regex = /\b[a-zA-Z]/g;
  $: if (teamName) {
    abb = teamName.match(regex).join("").toUpperCase();
  }

  const ongoingScrims = async () => {
    let res = await fetch("/teams/ongoing-scrims", {
      method: "POST",
      body: JSON.stringify({ teamOwner: correctUsername }),
      headers: { "content-type": "application/json" },
    });
    return await res.json();
  };

  const declineScrim = async (id) => {
    let promise = await fetch("/teams/declined-scrims", {
      method: "POST",
      body: JSON.stringify({ _id: id }),
      headers: { "content-type": "application/json" },
    });
    loggedIn = false;
    let timeout = new Promise(() => {
      setTimeout(() => {
        loggedIn = true;
      }, 5);
    });
    timeout();
  };

  const dataDate = (timestamp) => {
    var unixtimestamp = timestamp;
    var months_arr = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var date = new Date(unixtimestamp * 1000);
    var year = date.getFullYear();
    var month = months_arr[date.getMonth()];
    var day = date.getDate();
    var hours = "0" + date.getHours();
    var minutes = "0" + date.getMinutes();

    // Display date time in MM-dd-yyyy h:m:s format
    var convdataTime =
      month +
      "-" +
      day +
      "-" +
      year +
      " " +
      hours.substr(-2) +
      ":" +
      minutes.substr(-2);

    return convdataTime;
  };

  async function turnTeamIDToTeamName(teamString) {
    let res = await fetch("/teams/edit", {
      method: "POST",
      body: JSON.stringify({ _id: teamString }),
      headers: { "content-type": "application/json" },
    });
    let json = await res.json();
    return await json[0].name;
  }

  const upcomingScrims = async () => {
    let res = await fetch("/teams/future-scrims", {
      method: "POST",
      body: JSON.stringify({ teamOwner: correctUsername }),
      headers: { "content-type": "application/json" },
    });
    return await res.json();
  };

  const listTeamReset = () => {
    listTeamsToggle = false;
    setTimeout(() => {
      listTeamsToggle = true;
    }, 100);
  };

  const editTeam = (pplayers, pteamName, pabb, p_id) => {
    teamEdit = true;
    players = pplayers;
    teamName = pteamName;
    abb = pabb;
    _id = p_id;
    console.log(players, teamName, abb, _id);
  };

  const listTeams = async () => {
    let res = await fetch("/teams/list", {
      method: "POST",
      body: JSON.stringify({ teamOwner: correctUsername }),
      headers: { "content-type": "application/json" },
    });
    return await res.json();
  };
  $: if (loggedIn) {
    promise = listTeams();
  }

  $: if (listTeamsToggle) {
    promise = listTeams();
  } else {
    promise = listTeams();
  }

  $: if (updateTeamBoolean) {
    promise = listTeams();
    updateTeamTrue = false;
  }

  //editTeam

  const updateTeam = () => {
    if (!teamName) {
      alert("Enter a teamname");
      return;
    }
    if (!abb) {
      alert("Enter an abbriviation");
      return;
    }
    if (
      !players[0] ||
      !players[1] ||
      !players[2] ||
      !players[3] ||
      !players[4]
    ) {
      alert("You don't have enough players :(");
      return;
    }
    let registeredTeam = {
      teamName: teamName,
      abb: abb,
      members: players,
      _id: _id,
    };

    fetch("/teams/update", {
      method: "POST",
      body: JSON.stringify(registeredTeam),
      headers: { "content-type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    listTeamReset();
  };

  const listTeamsForm = async () => {
    let res = await fetch("/teams/edit", {
      method: "POST",
      body: JSON.stringify({ _id: _id }),
      headers: { "content-type": "application/json" },
    });
    return await res.json();
  };

  const deleteTeam = async () => {
    let res = await fetch("/teams/delete", {
      method: "POST",
      body: JSON.stringify({ _id: _id }),
      headers: { "content-type": "application/json" },
    });
    await listTeamReset();
    return await res.json();
  };
  $: if (teamEdit) {
    promise2 = listTeamsForm();
    promise2.then((val) => {
      teamName = val[0].name;
      abb = val[0].abb;
      players = val[0].members;
      //   console.log(players);
      console.log("help");
    });
  }

  //registerTeam!players[

  const newTeam = () => {
    if (!teamName) {
      alert("Enter a teamname");
      return;
    }
    if (!abb) {
      alert("Enter an abbriviation");
      return;
    }
    if (
      !players[0] ||
      !players[1] ||
      !players[2] ||
      !players[3] ||
      !players[4]
    ) {
      alert("You don't have enough players :(");
      return;
    }
    let registeredTeam = {
      teamName: teamName,
      abb: abb,
      members: players,
      teamOwner: correctUsername,
    };

    fetch("/teams/register-team", {
      method: "POST",
      body: JSON.stringify(registeredTeam),
      headers: { "content-type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
</script>

{#if loggedIn}
  <div class="header" title="header">
    <h1 class="welcome-text">
      Welcome to your personalized League of Legends Team Management {correctUsername}!
    </h1>
    <img
      src="pictures/background.png"
      class="header-img"
      alt="pictureofleaguesky"
    />
  </div>
  <div class="your-teams-container">
    <div>
      <h1>Your Teams:</h1>
      <p>(Click on them to edit/delete them)</p>
    </div>
    {#if listTeamsToggle}
      {#await promise}
        <p>Loading...</p>
      {:then user}
        {#each user as user}
          <div class="each-team">
            <h4
              class="team"
              on:click={() => {
                console.log(user);
                editTeam(user.name, user.abb, user.members, user._id);
              }}
            >
              {user.name}[{user.abb}]
            </h4>
          </div>
        {/each}
      {:catch error}
        <p style="color: red">{error.message}</p>
      {/await}
    {/if}
    <!-- {teamList} -->
  </div>

  <!-- <img
    src="pictures/landscape-painting.jpeg"
    class="header-img"
    alt="fantasy"
  /> -->

  <div class="ongoing-container">
    <div>
      <h1>Ongoing Scrims RIGHT NOW:</h1>
      {#if updateOngoing}
        {#await ongoingScrims()}
          <p>Loading...</p>
        {:then notifications}
          {#each notifications as notification}
            {#await turnTeamIDToTeamName(notification.ourID) then us}
              {#await turnTeamIDToTeamName(notification.oppID) then data}
                <div>
                  <div>
                    <h4>Our Team: {us} vs Enemy Team: {data}</h4>
                    Time scheduled: {dataDate(notification.datetime)}
                  </div>
                  <h4>Report Results:</h4>
                  <button
                    on:click={() => {
                      declineScrim(notification._id);
                      updateOngoing = false;
                      waitingOngoing();
                    }}>Cancel/Delete</button
                  >
                  <button
                    on:click={() => {
                      victorResult(
                        notification._id,
                        notification.ourID,
                        notification.oppID
                      );
                      updateOngoing = false;
                      waitingOngoing();
                    }}>{us}</button
                  >
                  <button
                    on:click={() => {
                      victorResult(
                        notification._id,
                        notification.oppID,
                        notification.ourID
                      );
                      updateOngoing = false;
                      waitingOngoing();
                    }}>{data}</button
                  >

                  <div />
                </div>
              {/await}
            {/await}
          {/each}
        {:catch error}
          <p style="color: red">{error.message}</p>
        {/await}
      {/if}
    </div>
  </div>

  <div class="upcoming-container">
    <div>
      <h1>Your Upcoming Accepted Scrims:</h1>
      {#if updateUpcoming}
        {#await upcomingScrims()}
          <p>Loading...</p>
        {:then notifications}
          {#each notifications as notification}
            <!-- {#await notification.json() then jsonified}
            {jsonified}
          {/await} -->
            {#await turnTeamIDToTeamName(notification.oppID) then data}
              <div>
                {data}
                {dataDate(notification.datetime)}
                <button
                  on:click={() => {
                    declineScrim(notification._id);
                    updateUpcoming = false;
                    waitingUpcoming();
                  }}>Cancel/Delete</button
                >
              </div>
            {/await}
          {/each}
        {:catch error}
          <p style="color: red">{error.message}</p>
        {/await}
      {/if}
    </div>
  </div>
{/if}

{#if teamEdit}
  <div
    class="backdrop"
    on:click={() => {
      teamName = "";
      abb = "";
      players = ["", "", "", "", ""];
      teamEdit = false;
    }}
  />
  <div class="modal-container">
    <form action="#" method="POST" class="modal">
      <h1>Edit Your Team Information!</h1>
      <label
        >Team name: <input
          type="text"
          value={teamName}
          on:input={(e) => (teamName = e.target.value)}
        /></label
      >
      <label
        >Abbriviation: <input
          type="text"
          value={abb}
          on:input={(e) => (abb = e.target.value)}
        /></label
      >
      <div class="input-teammates">
        <h1>Members</h1>
        <div>
          Player 1:<input
            type="text"
            value={players[0]}
            on:input={(e) => (players[0] = e.target.value)}
          />
        </div>
        <div>
          Player 2:<input
            type="text"
            value={players[1]}
            on:input={(e) => (players[1] = e.target.value)}
          />
        </div>
        <div>
          Player 3:<input
            type="text"
            value={players[2]}
            on:input={(e) => (players[2] = e.target.value)}
          />
        </div>
        <div>
          Player 4:<input
            type="text"
            value={players[3]}
            on:input={(e) => (players[3] = e.target.value)}
          />
        </div>

        <div>
          Player 5:<input
            type="text"
            value={players[4]}
            on:input={(e) => (players[4] = e.target.value)}
          />
        </div>
      </div>
      <input
        type="submit"
        name="Edit"
        value="Edit"
        on:click={(event) => {
          event.preventDefault();
          updateTeam();
          teamName = "";
          abb = "";
          players = ["", "", "", "", ""];
          teamEdit = false;
        }}
      />

      <input
        type="submit"
        name="Delete"
        value="Delete"
        on:click={(event) => {
          event.preventDefault();
          deleteTeam();
          teamName = "";
          abb = "";
          players = ["", "", "", "", ""];
          teamEdit = false;
        }}
      />
    </form>
  </div>
{/if}

{#if clickedRegister}
  <div
    class="backdrop"
    on:click={() => {
      teamName = "";
      abb = "";
      players = ["", "", "", "", ""];
      clickedRegister = false;
    }}
  />
  <div class="modal-container">
    <form action="#" method="POST" class="modal">
      <h1>Enter Your Team Information!</h1>
      <label>Team name: <input type="text" bind:value={teamName} /></label>
      <label>Abbriviation: <input type="text" bind:value={abb} /></label>

      <div class="input-teammates">
        <h1>Members</h1>
        <div>
          Player 1:<input
            type="text"
            value={players[0]}
            on:input={(e) => (players[0] = e.target.value)}
          />
        </div>
        <div>
          Player 2:<input
            type="text"
            value={players[1]}
            on:input={(e) => (players[1] = e.target.value)}
          />
        </div>
        <div>
          Player 3:<input
            type="text"
            value={players[2]}
            on:input={(e) => (players[2] = e.target.value)}
          />
        </div>
        <div>
          Player 4:<input
            type="text"
            value={players[3]}
            on:input={(e) => (players[3] = e.target.value)}
          />
        </div>

        <div>
          Player 5:<input
            type="text"
            value={players[4]}
            on:input={(e) => (players[4] = e.target.value)}
          />
        </div>
      </div>

      <input
        type="submit"
        name="Submit"
        value="Submit"
        on:click={(event) => {
          event.preventDefault();
          newTeam();
          listTeamReset();
          clickedRegister = false;
          teamName = "";
          abb = "";
          players = ["", "", "", "", ""];
        }}
      />
    </form>
  </div>
{/if}

<style>
  .upcoming-container {
    border: 1.5px solid black;
    background-color: #e2f5fe;
  }
  .ongoing-container {
    background-color: aliceblue;
    border: 1.5px solid black;
  }
  .input-teammates {
    display: flex;
    flex-direction: column;
  }
  .your-teams-container {
    display: flex;
    flex-direction: row;
    overflow-x: scroll;
    background-color: #e2f5fe;
    border: 1.5px solid black;
  }
  .each-team {
    padding-left: 3rem;
    padding-top: 2rem;
  }
  .header {
    background-position: center;
    background-color: aliceblue;
    height: 20rem;
    width: 100%;
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: column;
  }
  .header-img {
    height: 100%;
    width: 100%;
    object-fit: cover;
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
    z-index: 1;
  }
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: 200ms ease-in-out;
    border: 1px solid black;
    border-radius: 0.8rem;
    z-index: 2;
    text-align: center;
    background-color: aliceblue;
    height: 40rem;
    width: 40rem;
    max-width: 80%;
  }
</style>
