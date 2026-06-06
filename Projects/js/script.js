const getStartedBtn = document.querySelector(
    'input[type="email"] + button'
);

getStartedBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value;

    if (email === "") {
        alert("Please enter your email address.");
    } else {
        alert(`Welcome! Your email is ${email}`);
    }
});