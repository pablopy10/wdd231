const membersContainer = document.querySelector("#members");
const statusMessage = document.querySelector("#directory-status");
const gridButton = document.querySelector("#grid-button");
const listButton = document.querySelector("#list-button");

function membershipName(level) {
    const names = {
        1: "Member",
        2: "Silver member",
        3: "Gold member"
    };
    return names[level] ?? "Member";
}

function createMemberCard(member) {
    const card = document.createElement("article");
    card.className = "member-card";

    const header = document.createElement("div");
    header.className = "member-card-header";

    const image = document.createElement("img");
    image.src = `images/${member.image}`;
    image.alt = `${member.name} logo`;
    image.width = 62;
    image.height = 62;

    const title = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = member.name;
    const category = document.createElement("p");
    category.className = "member-category";
    category.textContent = member.category;
    title.append(name, category);
    header.append(image, title);

    const details = document.createElement("div");
    details.className = "member-details";
    const address = document.createElement("p");
    address.textContent = member.address;
    const phone = document.createElement("p");
    phone.textContent = member.phone;
    const website = document.createElement("a");
    website.href = member.website;
    website.textContent = "Visit website";
    website.target = "_blank";
    website.rel = "noopener noreferrer";
    const level = document.createElement("span");
    level.className = "member-level";
    level.textContent = membershipName(member.membershipLevel);
    details.append(address, phone, website, document.createElement("br"), level);

    const description = document.createElement("p");
    description.className = "member-description";
    description.textContent = member.description;
    card.append(header, details, description);
    return card;
}

function setView(view) {
    const isList = view === "list";
    membersContainer.classList.toggle("list-view", isList);
    gridButton.classList.toggle("selected", !isList);
    listButton.classList.toggle("selected", isList);
    gridButton.setAttribute("aria-pressed", String(!isList));
    listButton.setAttribute("aria-pressed", String(isList));
}

async function loadMembers() {
    try {
        const response = await fetch("data/members.json");
        if (!response.ok) {
            throw new Error(`Could not load the member list (${response.status}).`);
        }

        const members = await response.json();
        if (!Array.isArray(members)) {
            throw new Error("The member data has an unexpected format.");
        }

        membersContainer.replaceChildren(...members.map(createMemberCard));
        statusMessage.textContent = `${members.length} local businesses and organizations`;
    } catch (error) {
        console.error("Unable to display the chamber member directory.", error);
        statusMessage.textContent = "Sorry, the member directory could not be loaded. Please try again later.";
    }
}

gridButton.addEventListener("click", () => setView("grid"));
listButton.addEventListener("click", () => setView("list"));
loadMembers();
