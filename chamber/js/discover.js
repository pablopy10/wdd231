import { places } from "../data/discover.mjs";

const cardsContainer = document.querySelector("#discover-cards");
const visitMessage = document.querySelector("#visit-message");

function showVisitMessage() {
    const storageKey = "cascaisDiscoverLastVisit";
    const lastVisit = Number(localStorage.getItem(storageKey));
    const today = Date.now();

    if (!lastVisit) {
        visitMessage.textContent = "Welcome! Let us know if you have any questions.";
    } else {
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const days = Math.floor((today - lastVisit) / millisecondsPerDay);

        if (days < 1) {
            visitMessage.textContent = "Back so soon! Awesome!";
        } else if (days === 1) {
            visitMessage.textContent = "You last visited 1 day ago.";
        } else {
            visitMessage.textContent = `You last visited ${days} days ago.`;
        }
    }

    localStorage.setItem(storageKey, today);
}

function createPlaceCard(place, index) {
    const card = document.createElement("article");
    card.className = `place-card place-card-${index + 1}`;

    const title = document.createElement("h2");
    title.textContent = place.name;

    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = `images/${place.image}`;
    image.alt = place.name;
    image.width = 300;
    image.height = 200;
    image.loading = "lazy";
    figure.append(image);

    const address = document.createElement("address");
    address.textContent = place.address;

    const description = document.createElement("p");
    description.textContent = place.description;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "learn more";
    button.addEventListener("click", () => {
        alert(place.name);
    });

    card.append(title, figure, address, description, button);
    return card;
}

cardsContainer.replaceChildren(...places.map(createPlaceCard));
showVisitMessage();
