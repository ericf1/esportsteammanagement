<script>
  export let showModal = true;
  export let showLogin = true;
  let showRegister = false;
  let username = "";
  export let correctUsername = "";
  export let loggedIn = false;
  let password = "";
  let email = "";
  export let curID = "";

  const showRegisterChange = (boolean) => {
    showRegister = boolean;
    showLogin = !boolean;
  };

  const checkLogin = () => {
    let checkUser = {
      name: username,
      password: password,
    };
    let login = false;
    fetch("/logins/login", {
      method: "POST",
      body: JSON.stringify(checkUser),
      headers: { "content-type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.login) {
          login = true;
          showLogin = false;
          showModal = false;
          correctUsername = data.user;
          loggedIn = true;
          curID = data._id;
          return;
        }
        login = false;
        alert(data.message);
        return;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  function registerPlayer() {
    if (!password) {
      alert("Enter a password");
    }
    if (!username) {
      alert("Enter an username");
    }
    if (!email) {
      alert("Enter an email");
    }
    let registeredUser = {
      name: username,
      password: password,
      email: email,
    };

    fetch("/logins/register", {
      method: "POST",
      body: JSON.stringify(registeredUser),
      headers: { "content-type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
</script>

{#if showModal}
  <div class="backdrop">
    <div class="modal-container">
      {#if showLogin}
        <div id="login-container" class="modal">
          <!-- <div id="login-container" class="popup-container login"> -->
          <h1>Welcome to League Team Management!</h1>
          <img src="pictures/logo.png" alt="logo" class="animation logo" />
          <form method="post" action="#">
            <input type="hidden" name="login-token" class="token" />
            <input
              type="text"
              placeholder="Username"
              bind:value={username}
              id="login-user"
            />

            <input
              type="password"
              placeholder="Password"
              bind:value={password}
              id="login-password"
            />
            <div>
              <input
                type="submit"
                id="login"
                on:click|preventDefault={() => {
                  checkLogin();
                  username = "";
                  password = "";
                }}
                value="Login!"
              />
              <input
                type="submit"
                on:click|preventDefault={() => {
                  showRegister = true;
                  showLogin = false;
                  username = "";
                  password = "";
                }}
                id="register"
                value="Register!"
              />
            </div>
          </form>
        </div>
      {/if}

      {#if showRegister}
        <div id="register-container" class="modal">
          <!-- <input type="hidden" name="register-token" class="token" /> -->
          <label for="register-user"><h1>Register New Account!</h1> </label>
          <form class="flex-container-horrizonatal" action="#" method="POST">
            <input
              type="text"
              placeholder="Username"
              bind:value={username}
              id="register-user"
            />

            <input
              type="password"
              placeholder="Password"
              bind:value={password}
              id="register-password"
            />

            <input
              type="text"
              placeholder="Email"
              bind:value={email}
              id="register-email"
            />

            <input
              type="submit"
              on:click|preventDefault={() => {
                showRegister = false;
                showLogin = true;
                registerPlayer();
                username = "";
                password = "";
                email = "";
              }}
              id="register-new-user"
              value="Register!"
            />

            <input
              type="submit"
              id="exit-register"
              on:click|preventDefault={() => {
                showRegister = false;
                showLogin = true;
                username = "";
                password = "";
                email = "";
              }}
              value="Exit!"
            />
          </form>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  #register-container {
    display: flex;
    flex-direction: column;
  }

  .flex-container-horrizonatal {
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: column;
  }
  /* .login-container {
    display: flex;
    flex-direction: column;
  }  */
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
  .animation {
    animation: logo-enter 4s forwards;
  }
  .animation:hover {
    animation-play-state: paused;
    /* animation: logo-enter 4s forwards; */
  }
  @keyframes logo-enter {
    0% {
      transform: rotate(360deg);
      transform: translateY(100vh) translateX(10%);
    }

    25% {
      transform: rotate(720deg);
      transform: translateY(75vh) translateX(20%);
    }

    50% {
      transform: rotate(1080deg);
      transform: translateY(50vh) translateX(30%);
    }

    75% {
      transform: rotate(1440deg) translateX(40%) translateY(25vh);
    }

    100% {
      transform: rotate(1800deg);
    }
  }
  .logo {
    height: 10rem;
    width: 20rem;
  }

  /* @keyframes bounce {
    0% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-100px);
    }
    50% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(0);
    }
  } */
</style>
