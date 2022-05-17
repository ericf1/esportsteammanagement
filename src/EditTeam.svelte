<script>
  export let teamEdit = false;
  let teamName = "";
  let abb = "";
  let players = ["", "", "", "", ""];
  export let _id = "";
  let promise;
  export let updateTeamTrue = false;

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
    teamName = "";
    abb = "";
    players = ["", "", "", "", ""];
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
  };

  const listTeams = async () => {
    let res = await fetch("/teams/edit", {
      method: "POST",
      body: JSON.stringify({ _id: _id }),
      headers: { "content-type": "application/json" },
    });
    return await res.json();
  };

  const deleteTeam = async () => {
    teamName = "";
    abb = "";
    players = ["", "", "", "", ""];
    let res = await fetch("/teams/delete", {
      method: "POST",
      body: JSON.stringify({ _id: _id }),
      headers: { "content-type": "application/json" },
    });
    return await res.json();
  };
  $: if (teamEdit) {
    promise = listTeams();
    promise.then((val) => {
      teamName = val[0].name;
      abb = val[0].abb;
      players = val[0].members;
      //   console.log(players);
      console.log("help");
    });
  }
</script>

{#if teamEdit}
  <div
    class="backdrop"
    on:click={() => {
      teamEdit = false;
      console.log("BACKDROP OFF");
    }}
  />
  <div class="modal-container">
    <form action="#" class="modal">
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
      <label
        >Members: <input
          type="text"
          value={players[0]}
          on:input={(e) => (players[0] = e.target.value)}
        />
        <input
          type="text"
          value={players[1]}
          on:input={(e) => (players[1] = e.target.value)}
        />
        <input
          type="text"
          value={players[2]}
          on:input={(e) => (players[2] = e.target.value)}
        />
        <input
          type="text"
          value={players[3]}
          on:input={(e) => (players[3] = e.target.value)}
        />
        <input
          type="text"
          value={players[4]}
          on:input={(e) => (players[4] = e.target.value)}
        /></label
      >
      <input
        type="submit"
        name="Edit"
        value="Edit"
        on:click={(event) => {
          event.preventDefault();
          updateTeam();
        }}
      />

      <input
        type="submit"
        name="Delete"
        value="Delete"
        on:click={(event) => {
          event.preventDefault();
          deleteTeam();
          console.log(updateTeamTrue);
        }}
      />
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
