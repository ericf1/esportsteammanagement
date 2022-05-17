<script>
  //importing all the variables that are binded together
  export let matchHistoryToggle = false;
  export let correctUsername;

  //converstion of a timestamp to a given date taken from https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
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

  //function to turn a a given ID to a given name
  async function turnTeamIDToTeamName(teamString) {
    let res = await fetch("/teams/edit", {
      method: "POST",
      body: JSON.stringify({ _id: teamString }),
      headers: { "content-type": "application/json" },
    });
    let json = await res.json();
    return await json[0].name;
  }

  //fetch match history with a call to the backend
  const fetchMatchHistory = async () => {
    let response = await fetch("/teams/match-history", {
      method: "POST",
      body: JSON.stringify({ teamOwner: correctUsername }),
      headers: { "content-type": "application/json" },
    });
    let data = await response.json();

    let combined = [...data.winning, ...data.losing];
    combined.sort((a, b) => {
      return b.datetime - a.datetime;
    });

    return combined;
  };
</script>

<!-- toggling the match history screen-->
{#if matchHistoryToggle}
  <div
    class="backdrop"
    on:click={() => {
      matchHistoryToggle = false;
    }}
  />
  <div id="match-history-container" class="modal">
    {#await fetchMatchHistory()}
      <p>Loading...</p>
    {:then matchHistory}
      {#each matchHistory as match}
        {#await turnTeamIDToTeamName(match.home) then home}
          {#await turnTeamIDToTeamName(match.away) then away}
            <div>
              <h1>{match.results}</h1>
              <p>
                <strong>{away}</strong> played against <strong>{home}</strong>
                at <strong>{dataDate(match.datetime)}</strong>
              </p>
            </div>
          {/await}
        {/await}
      {/each}
    {/await}
  </div>
{/if}

<style>
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
</style>
