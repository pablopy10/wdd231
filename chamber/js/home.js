const spotlightContainer = document.querySelector("#spotlights");
const spotlightStatus = document.querySelector("#spotlight-status");
const weatherStatus = document.querySelector("#weather-status");
const weatherCurrent = document.querySelector("#weather-current");
const forecastContainer = document.querySelector("#weather-forecast");

function membershipName(level) {
    return level === 3 ? "Gold member" : "Silver member";
}

function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
}

function createSpotlight(member) {
    const card = document.createElement("article");
    card.className = "spotlight-card";

    const header = document.createElement("div");
    header.className = "spotlight-header";
    const logo = document.createElement("img");
    logo.src = `images/${member.image}`;
    logo.alt = `${member.name} logo`;
    logo.width = 72;
    logo.height = 72;

    const title = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = member.name;
    const category = document.createElement("p");
    category.className = "member-category";
    category.textContent = member.category;
    title.append(name, category);
    header.append(logo, title);

    const details = document.createElement("div");
    details.className = "spotlight-details";
    const address = document.createElement("p");
    address.textContent = member.address;
    const phone = document.createElement("a");
    phone.href = `tel:${member.phone.replace(/[^\d+]/g, "")}`;
    phone.textContent = member.phone;
    const website = document.createElement("a");
    website.href = member.website;
    website.textContent = "Visit website";
    website.target = "_blank";
    website.rel = "noopener noreferrer";
    const level = document.createElement("span");
    level.className = "member-level";
    level.textContent = membershipName(member.membershipLevel);
    details.append(address, phone, website, level);

    card.append(header, details);
    return card;
}

async function loadSpotlights() {
    try {
        const response = await fetch("data/members.json");
        if (!response.ok) {
            throw new Error(`Could not load member data (${response.status}).`);
        }

        const members = await response.json();
        if (!Array.isArray(members)) {
            throw new Error("Member data has an unexpected format.");
        }

        const eligibleMembers = members.filter((member) => [2, 3].includes(member.membershipLevel));
        const spotlights = shuffle(eligibleMembers).slice(0, Math.min(3, eligibleMembers.length));
        if (spotlights.length < 2) {
            throw new Error("At least two silver or gold members are required for spotlights.");
        }

        spotlightContainer.replaceChildren(...spotlights.map(createSpotlight));
        spotlightStatus.textContent = "Meet a few of our silver and gold members.";
    } catch (error) {
        console.error("Unable to display member spotlights.", error);
        spotlightStatus.textContent = "Sorry, member spotlights could not be loaded right now.";
    }
}

function formatForecastDay(date) {
    return new Intl.DateTimeFormat("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
    }).format(date);
}

function createForecastItem(date, temperature, description) {
    const item = document.createElement("article");
    item.className = "forecast-item";
    const day = document.createElement("h4");
    day.textContent = formatForecastDay(date);
    const summary = document.createElement("p");
    summary.textContent = `${Math.round(temperature)}°C · ${description}`;
    item.append(day, summary);
    return item;
}

function getDailyForecast(forecast) {
    const dailyForecasts = new Map();
    const timezoneOffset = forecast.city.timezone ?? 0;
    const today = new Date(Date.now() + timezoneOffset * 1000).toISOString().slice(0, 10);

    forecast.list.forEach((entry) => {
        const localForecastDate = new Date((entry.dt + timezoneOffset) * 1000);
        const forecastDate = localForecastDate.toISOString().slice(0, 10);
        if (forecastDate > today) {
            const existing = dailyForecasts.get(forecastDate);
            const noonDistance = Math.abs(localForecastDate.getUTCHours() - 12);
            if (!existing || noonDistance < existing.noonDistance) {
                dailyForecasts.set(forecastDate, {
                    date: new Date(`${forecastDate}T12:00:00Z`),
                    temperature: entry.main.temp,
                    description: entry.weather[0].description,
                    noonDistance
                });
            }
        }
    });

    return [...dailyForecasts.values()].slice(0, 3);
}

async function loadWeather() {
    const apiKey = window.OPENWEATHER_API_KEY?.trim();
    if (!apiKey) {
        weatherStatus.textContent = "Add an OpenWeatherMap API key in js/weather-config.js to load live conditions.";
        return;
    }

    const location = "lat=38.6979&lon=-9.4215&units=metric";
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?${location}&appid=${encodeURIComponent(apiKey)}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?${location}&appid=${encodeURIComponent(apiKey)}`;

    try {
        const [currentResponse, forecastResponse] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);
        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error(`Weather service returned ${currentResponse.status}/${forecastResponse.status}.`);
        }

        const [current, forecast] = await Promise.all([currentResponse.json(), forecastResponse.json()]);
        document.querySelector("#current-temperature").textContent = String(Math.round(current.main.temp));
        document.querySelector("#current-description").textContent = current.weather[0].description;
        weatherCurrent.hidden = false;

        const dailyForecasts = getDailyForecast(forecast);
        if (dailyForecasts.length < 3) {
            throw new Error("The weather service did not return three upcoming forecast days.");
        }
        forecastContainer.replaceChildren(...dailyForecasts.map((day) => (
            createForecastItem(day.date, day.temperature, day.description)
        )));
        weatherStatus.textContent = "Current conditions";
    } catch (error) {
        console.error("Unable to load Cascais weather.", error);
        weatherStatus.textContent = "Weather is temporarily unavailable. Please try again later.";
    }
}

function setNextEventDates() {
    document.querySelectorAll("[data-next-weekday]").forEach((dateElement) => {
        const targetDay = Number(dateElement.dataset.nextWeekday);
        const nextDate = new Date();
        const daysUntil = (targetDay - nextDate.getDay() + 7) % 7 || 7;
        nextDate.setDate(nextDate.getDate() + daysUntil);
        dateElement.dateTime = nextDate.toISOString().slice(0, 10);
        dateElement.textContent = new Intl.DateTimeFormat("en", {
            weekday: "short",
            month: "short",
            day: "numeric"
        }).format(nextDate);
    });
}

setNextEventDates();
loadSpotlights();
loadWeather();
