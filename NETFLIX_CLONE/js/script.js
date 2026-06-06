const emailInput = document.getElementById("email");
const getStartedLink = document.querySelector("#email + a");

getStartedLink.addEventListener("click", (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();

    if (email === "") {
        alert("Please enter your email address.");
        return;
    }

    if (!email.includes("@")) {
        alert("Please enter a valid email address.");
        return;
    }

    alert(`Welcome to Netflix!\nEmail: ${email}`);
});