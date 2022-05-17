<script>
  export let clickedRegister = false;
  export let correctUsername = "";
  const riotAPIKey = "RGAPI-57941ee5-a1c7-42af-ac11-38bdaccc729c";
  let teamName = "";
  let abb = "";
  let players = ["", "", "", "", ""];
  let randomImg = "";

  abb = matched.join("").toUpperCase();

  const fetchRandomImg = async () => {
    let promise = await fetch(
      "https://api.unsplash.com/photos/random/?client_id=ZZVKXNAT7Atr_bTI70RAL1nlKJVye9lTqEzEd08yCvs"
    );
    return await promise.json().urls.small;
  };

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
    // let stop = false;
    // players.forEach(async (player) => {
    //   player = summonerName;
    //   let response1 = await fetch(
    //     `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${riotAPIKey}`,
    //     {
    //       method: "GET",
    //       headers: { "content-type": "application/json" },
    //     }
    //   );
    //   let data1 = await response1.json();
    //   if (data1.status.status_code === 404) {
    //     alert(player + "does not have an account :(");
    //     stop = true;
    //   }
    // });

    // if (stop === true) {
    //   return;
    // }

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

{#if clickedRegister}
  <div
    class="backdrop"
    on:click={() => {
      clickedRegister = false;
      console.log("BACKDROP OFF");
    }}
  />

  <div class="modal-container">
    <form action="#" class="modal">
      <label>Team name: <input type="text" bind:value={teamName} /></label>
      <label>Abbriviation: <input type="text" bind:value={abb} /></label>
      <label>
        Members: <input type="text" bind:value={players[0]} />
        <input type="text" bind:value={players[1]} />
        <input type="text" bind:value={players[2]} />
        <input type="text" bind:value={players[3]} />
        <input type="text" bind:value={players[4]} />
      </label>
      <input
        type="submit"
        name="Submit"
        value="Submit"
        on:click={(event) => {
          event.preventDefault();
          newTeam();
        }}
      />
      <img src={randomImg} alt="team" />
      <button
        on:click|preventDefault={() => {
          fetchRandomImg();
        }}>Randomize Image</button
      >
    </form>
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
