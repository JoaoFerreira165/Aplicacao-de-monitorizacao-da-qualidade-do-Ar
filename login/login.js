const headers = {
  "Access-Control-Allow-Origin": "*",
};
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("userName").value;
    const password = document.getElementById("pwd").value;
    await axios
      .post(
        "http://10.3.246.249:3000/meteo/auth/login/check",
        { username: username, password: password },
        { headers: headers }
      )
      .then((response) => {
        console.log(response);
        if (response.status == 200) {
          console.log(response);
          const token = response.data.token;
          localStorage.setItem("tokenLogin", token);
          window.location.href = "../admin/admin.html";
        } else {
          return;
        }
      })
      .catch((error) => alert(error.response.data));
  });
});
$(document).ready(function () {
  $("#btnBack").on("click", function () {
    window.location.href = "../index.html";
  });
});
