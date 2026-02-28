const getEntries = () => JSON.parse(localStorage.getItem("entries") || "{}");
const saveEntries = (data) => localStorage.setItem("entries", JSON.stringify(data));

const calendarEl = document.getElementById("calendar");
const monthLabel = document.getElementById("monthLabel");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");
const totalHoursEl = document.getElementById("totalHours");
const totalEarningsEl = document.getElementById("totalEarnings");

const entryModal = document.getElementById("entryModal");
const entryDateEl = document.getElementById("entryDate");
const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");
const breakTime = document.getElementById("breakTime");
const hourlyWage = document.getElementById("hourlyWage");
const workedHours = document.getElementById("workedHours");
const dailyEarnings = document.getElementById("dailyEarnings");
const saveEntryBtn = document.getElementById("saveEntry");
const deleteEntryBtn = document.getElementById("deleteEntry");
const unavailableEntryBtn = document.getElementById("unavailableEntry");
const closeModalBtn = document.getElementById("closeModal");

let currentDate = new Date();
let selectedDateKey = null;

document.addEventListener("DOMContentLoaded", () => {
renderCalendar();
updateTotals();
});

function renderCalendar() {
calendarEl.innerHTML = "";

const year = currentDate.getFullYear();
const month = currentDate.getMonth();
monthLabel.textContent =
currentDate.toLocaleString("default", { month: "long", year: "numeric" });

const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
const daysInMonth = new Date(year, month + 1, 0).getDate();
const entries = getEntries();

for (let i = 0; i < firstDay; i++)
calendarEl.appendChild(document.createElement("div"));

for (let d = 1; d <= daysInMonth; d++) {
const key = `${year}-${month+1}-${d}`;
const day = document.createElement("div");
day.className = "day";

const number = document.createElement("div");
number.className = "day-number";
number.textContent = d;
day.appendChild(number);

const entry = entries[key];

if (entry) {

if (entry.unavailable) {
const badge = document.createElement("div");
badge.className = "badge badge-unavailable";
day.appendChild(badge);

} else {
const badge = document.createElement("div");
badge.className = "badge badge-shift";
badge.innerHTML =
`${entry.hoursWorked.toFixed(2)}h<br>€${entry.pay.toFixed(2)}`;
day.appendChild(badge);
}

}

if (entry.unavailable) {
info.style.color = "#ff4d4d";
info.textContent = "Unavailable";
} else {
info.innerHTML =
`${entry.hoursWorked.toFixed(2)}h<br>€${entry.pay.toFixed(2)}`;
}

day.appendChild(info);
}

day.onclick = () => openEntry(key);
calendarEl.appendChild(day);
}

function openEntry(key) {
selectedDateKey = key;
entryModal.classList.remove("hidden");

const [y,m,d] = key.split("-");
entryDateEl.textContent = `${d}.${m}.${y}`;

const date = new Date(y, m-1, d);

/* DEFAULT VALUES */
startTime.value = "16:00";
endTime.value = "22:00";
breakTime.value = 30;
hourlyWage.value = (date.getDay() === 6) ? 9.23 : 6.6;

calculate();
}

function calculate() {
if (!startTime.value || !endTime.value) return;

const start = new Date(`1970-01-01T${startTime.value}`);
const end = new Date(`1970-01-01T${endTime.value}`);
let diff = (end - start)/1000/60/60 - breakTime.value/60;
if (diff < 0) diff = 0;

workedHours.textContent = diff.toFixed(2);
dailyEarnings.textContent =
"€" + (diff * parseFloat(hourlyWage.value)).toFixed(2);
}

[startTime,endTime,breakTime,hourlyWage]
.forEach(el => el.oninput = calculate);

saveEntryBtn.onclick = () => {
const entries = getEntries();
entries[selectedDateKey] = {
hoursWorked: parseFloat(workedHours.textContent),
pay: parseFloat(dailyEarnings.textContent.replace("€",""))
};
saveEntries(entries);
entryModal.classList.add("hidden");
renderCalendar();
updateTotals();
};

unavailableEntryBtn.onclick = () => {
const entries = getEntries();
entries[selectedDateKey] = { unavailable: true };
saveEntries(entries);
entryModal.classList.add("hidden");
renderCalendar();
updateTotals();
};

deleteEntryBtn.onclick = () => {
const entries = getEntries();
delete entries[selectedDateKey];
saveEntries(entries);
entryModal.classList.add("hidden");
renderCalendar();
updateTotals();
};

closeModalBtn.onclick = () => {
entryModal.classList.add("hidden");
};

function updateTotals() {
const entries = getEntries();
let totalH = 0, totalP = 0;

const year = currentDate.getFullYear();
const month = currentDate.getMonth()+1;

for (let key in entries) {
if (key.startsWith(`${year}-${month}`)) {
const e = entries[key];
if (!e.unavailable) {
totalH += e.hoursWorked || 0;
totalP += e.pay || 0;
}
}
}

totalHoursEl.textContent = totalH.toFixed(2);
totalEarningsEl.textContent = "€" + totalP.toFixed(2);
}

prevMonth.onclick = () => {
currentDate.setMonth(currentDate.getMonth()-1);
renderCalendar();
updateTotals();
};

nextMonth.onclick = () => {
currentDate.setMonth(currentDate.getMonth()+1);
renderCalendar();
updateTotals();
};