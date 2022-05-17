<script>
  //importing all of the necessary variables
  export let correctUsername;
  export let loggedIn;
  export let notificationsToggle = false;
  export let updateOngoing = true;
  let currentNotifications = [];
  //reactive variable
  $: currentNotificationsList = currentNotifications;

  //reloading functions for each component
  const waitingOngoing = new Promise(() => {
    setTimeout(() => {
      updateOngoing = true;
    }, 15);
  });

  //marking as read
  const markAsRead = async (id) => {
    let promise = await fetch("/teams/mark-as-read", {
      method: "POST",
      body: JSON.stringify({ _id: id, teamOwner: correctUsername }),
      headers: { "content-type": "application/json" },
    });
    loggedIn = false;
    let timeout = new Promise(() => {
      setTimeout(() => {
        loggedIn = true;
      }, 15);
    });
    timeout();
  };

  //turning the given team id into a string
  async function turnTeamIDToTeamName(teamString) {
    let res = await fetch("/teams/edit", {
      method: "POST",
      body: JSON.stringify({ _id: teamString }),
      headers: { "content-type": "application/json" },
    });
    let json = await res.json();
    return await json[0].name;
  }

  //the same datatime
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

  const acceptScrim = async (id) => {
    let promise = await fetch("/teams/accepted-scrims", {
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

  const loadNotifications = async () => {
    let notificationPromise = await fetch("/teams/current-notifications", {
      method: "POST",
      body: JSON.stringify({ teamOwner: correctUsername }),
      headers: { "content-type": "application/json" },
    });
    currentNotifications = await notificationPromise.json();
    return "";
  };

  setInterval(async function () {
    loadNotifications();
    // console.log(await turnTeamIDToTeamName("6266ff3a79a853413112c21f"));
    //notifications

    // fetch("/teams/notification").then((response) => {});
    // if (Notification.permission === "granted") {
    //   showNotification();
    // } else if (Notification.permission !== "denied") {
    //   Notification.requestPermission().then((permission) => {
    //     if (permission === "granted") {
    //       showNotification();
    //     }
    //   });
    // }
    if (currentNotifications.length !== 0) {
      currentNotifications.forEach((notification) => {
        if (notification.markAsRead === false) {
          if (Notification.permission === "granted") {
            showNotification(notification);
          } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
              if (permission === "granted") {
                showNotification(notification);
              }
            });
          }
        }
      });
    }

    if (currentNotifications) console.log(currentNotifications);
    console.log("60 seconds have passed");
  }, 4575);
  //60000
  async function showNotification(notification) {
    console.log("notifications are here");
    let opposingTeam = await turnTeamIDToTeamName(notification.oppID);
    const notificationObj = new Notification("Your scrim is ready!", {
      body: "Your scrim against " + opposingTeam + " is ready",
    });
  }

  const pendingNotifications = async () => {
    let res = await fetch("/teams/pending-scrims", {
      method: "POST",
      body: JSON.stringify({ teamOwner: correctUsername }),
      headers: { "content-type": "application/json" },
    });
    return await res.json();
  };

  const listTeams = async () => {
    let res = await fetch("/teams/list", {
      method: "POST",
      body: JSON.stringify({ teamOwner: correctUsername }),
      headers: { "content-type": "application/json" },
    });
    return await res.json();
  };
</script>

<!-- <button
  on:click={() => {
    // loggedIn = true;
    var notification = new Notification("Hi there!");
  }}
>
  NOTIFY ME</button
> -->

{#if loggedIn}
  {#if notificationsToggle}
    <div
      class="backdrop"
      on:click={() => {
        notificationsToggle = false;
      }}
    />
    {#await loadNotifications() then info}{info}{/await}
    <div class="notifications modal">
      <h1>Your Notifications</h1>
      {#await pendingNotifications()}
        <p>Loading...</p>
      {:then notifications}
        {#each notifications as notification}
          {#await turnTeamIDToTeamName(notification.away) then information}
            <p>
              Your team:
              {information} vs
            </p>{/await}
          {#await turnTeamIDToTeamName(notification.home) then data}
            <div>
              {data}
              {dataDate(notification.datetime)}

              <button
                on:click={() => {
                  acceptScrim(notification._id);
                }}>Accept</button
              >
              <button
                on:click={() => {
                  declineScrim(notification._id);
                }}>Decline</button
              >
            </div>
          {/await}
        {/each}
      {:catch error}
        <p style="color: red">{error.message}</p>
      {/await}

      <div>
        {#each currentNotificationsList as scrim}
          {#await turnTeamIDToTeamName(scrim.oppID) then opposingName}
            {opposingName}
            {#if !scrim.markAsRead}
              <button
                on:click={() => {
                  markAsRead(scrim._id);
                  waitingOngoing();
                }}
                >MARK READY
              </button>
            {/if}
          {/await}
        {/each}
      </div>
    </div>
  {/if}
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
  }
</style>
