document.querySelector("#timestamp").value = new Date().toISOString();

document.querySelectorAll("[data-dialog]").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        document.getElementById(link.dataset.dialog).showModal();
    });
});
