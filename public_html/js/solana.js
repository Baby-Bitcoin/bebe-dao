import { $ } from "/js/selectors.js";

export let features = localStorage.getItem("welcome-info") || null;

export let user;
export const admins = ["lucianape3"];
export let minBalance = 0;
export let membership = true; // default should be false
export let accountStatus;

export const url = "http://" + location.hostname + ":9632/";

export let avatarbase64;

// for checking and saving membership and balance and other info
export const addressInfo = (user, authenticating) => {
  fetch(url + "address-info?user=" + user + "&login=" + authenticating, {})
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      accountStatus = data;

      if (data.balance >= minBalance && data.kyc === true) {
        membership = true;
      }
      if (user) {
        $("#user-menu .avatar").src = `/avatars/${user}.webp`;
        $("#balance b").innerHTML = data.balance + " BEBE";
        $("#login span").textContent = "Switch wallet";
        $("#logout").style.display = "block";
      } else {
        $("#user-menu .avatar").src = `/svgs/user.svg`;
      }

      return accountStatus.members;
    });
};
