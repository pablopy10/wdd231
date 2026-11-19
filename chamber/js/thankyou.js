const submittedData = new URLSearchParams(window.location.search);
const requiredFields = ["firstName", "lastName", "email", "phone", "organization", "timestamp"];
const submissionStatus = document.querySelector("#submission-status");
const submissionDetails = document.querySelector("#submission-details");

if (requiredFields.every((field) => submittedData.get(field))) {
    document.querySelector("#submitted-first-name").textContent = submittedData.get("firstName");
    document.querySelector("#submitted-last-name").textContent = submittedData.get("lastName");
    document.querySelector("#submitted-email").textContent = submittedData.get("email");
    document.querySelector("#submitted-phone").textContent = submittedData.get("phone");
    document.querySelector("#submitted-organization").textContent = submittedData.get("organization");

    const submittedDate = new Date(submittedData.get("timestamp"));
    if (!Number.isNaN(submittedDate.getTime())) {
        document.querySelector("#submitted-timestamp").textContent = new Intl.DateTimeFormat("en", {
            dateStyle: "long",
            timeStyle: "short"
        }).format(submittedDate);
        submissionStatus.remove();
        submissionDetails.hidden = false;
    } else {
        submissionStatus.textContent = "The application date could not be read.";
    }
} else {
    submissionStatus.textContent = "Application details are not available. Please submit the join form first.";
}
