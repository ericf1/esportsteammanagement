<script>
  //importing all the components into svelte
  import Modal from "./Modal.svelte";
  import Team from "./Team.svelte";
  import MatchHistory from "./MatchHistory.svelte";
  import OtherTeams from "./OtherTeams.svelte";
  import Notifications from "./Notifications.svelte";
  let loggedIn = false;
  let correctUsername = "";
  let clickedRegister = false;
  let showModal = true;
  let teamEdit = false;
  let updateTeamTrue = false;
  let loggedInOthers = false;
  let notificationsToggle = false;
  let showLogin = true;
  let matchHistoryToggle = false;
  let updateOngoing = true;

  // $: updateTeamBoolean = updateTeamTrue;

  //the variables that deal with user input
  let players = ["", "", "", "", ""];
  let teamName = "";
  let abb = "";
  let _id = "";

  let output = "";

  const handleInput = (e) => {
    output = e.target.value;
  };
</script>

<!-- nav bar building -->
<nav class="header nav">
  <img src="pictures/logo.png" alt="logo" />
  <h1>Eric's E-Team Management System</h1>
  <ul class="list-header">
    <li>
      <button
        on:click={() => {
          loggedIn = false;
          showModal = true;
          showLogin = true;
          correctUsername = "";
        }}
      >
        Logout</button
      >
    </li>
    <li>
      <button
        on:click={() => {
          notificationsToggle = true;
        }}>Notifications</button
      >
    </li>
    <li>
      <button
        on:click={() => {
          loggedInOthers = true;
        }}>All Other Teams</button
      >
    </li>
    <li>
      <button
        on:click={() => {
          clickedRegister = true;

          console.log("Help", clickedRegister);
        }}>Register Team!</button
      >
    </li>
    <li>
      <button
        on:click={() => {
          matchHistoryToggle = true;
        }}>Coach Match History</button
      >
    </li>
  </ul>
</nav>

<!-- components deploying into the website -->
<Modal bind:correctUsername bind:showLogin bind:loggedIn bind:showModal />
<Team
  bind:teamEdit
  bind:loggedIn
  bind:correctUsername
  bind:players
  bind:teamName
  bind:abb
  bind:_id
  bind:updateTeamTrue
  bind:clickedRegister
  bind:updateOngoing
/>
<!-- <RegisterTeam bind:clickedRegister bind:correctUsername /> -->
<!-- <EditTeam {updateTeamBoolean} bind:teamEdit bind:_id /> -->
<OtherTeams bind:loggedInOthers bind:correctUsername />
<Notifications
  bind:updateOngoing
  bind:notificationsToggle
  bind:loggedIn
  bind:correctUsername
/>
<MatchHistory bind:matchHistoryToggle bind:correctUsername />
<main>
  <p>{output}</p>
</main>

<style>
  img {
    padding: 10px;
    height: 5rem;
    width: 10rem;
  }
  button {
    cursor: pointer;
  }
  .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    border-bottom: solid 1px black;
  }
  .list-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-right: 1rem;
  }
  li {
    list-style: none;
  }
</style>
