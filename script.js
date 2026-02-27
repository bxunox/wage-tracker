// ===== STORAGE =====
const getEntries = () => JSON.parse(localStorage.getItem("entries") || "{}");
const saveEntries = (data) => localStorage.setItem("entries", JSON.stringify(data));

const getTemplates = () => JSON.parse(localStorage.getItem("templates") || "[]");
const saveTemplates = (data) => localStorage.setItem("templates", JSON.stringify(data));

// ===== DATE STATE =====
let currentDate = new Date();
let selectedDateKey = null;

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
renderCalendar();
updateTotals();
registerSW();
});

// ===== CALENDAR =====
function renderCalendar() {
const calendar = document.getElementById("calendar");
calendar.innerHTML = "";

const year = currentDate.getFullYear();
const month = currentDate.getMonth();

document.getElementById("monthLabel").textContent =
currentDate.toLocaleString("default", { month: "long", year: "numeric" });

const firstDay = new Date(year, month, 1).getDay();
const daysInMonth = new Date(year, month + 1, 0).getDate();

for (let i = 0; i < firstDay; i++) {
calendar.innerHTML += "<div></div>";
}

const entries = getEntries();

for (let d = 1; d <= daysInMonth; d++) {
const key = `${year}-${month+1}-${d}`;
const day = document.createElement("div");
day.className = "day";
if (entries[key]) day.classList.add("saved");

day.textContent = d;
day.onclick = () => openEntry(key);
calendar.appendChild(day);
}
}

// ===== ENTRY MODAL =====
function openEntry(key) {
selectedDateKey = key;
document.getElementById("entryModal").classList.remove("hidden");
document.getElementById("entryDate").textContent = key;

const entries = getEntries();
const data = entries[key];

if (data) {
startTime.value = data.start;
endTime.value = data.end;
breakTime.value = data.break;
hourlyWage.value = data.wage;
}

calculate();
}

function calculate() {
const start = new Date(`1970-01-01T${startTime.value}`);
const end = new Date(`1970-01-01T${endTime.value}`);

let diff = (end - start) / 1000 / 60 / 60;
diff -= breakTime.value / 60;
if (diff < 0) diff = 0;

workedHours.textContent = diff.toFixed(2);

const pay = diff * parseFloat(hourlyWage.value);
dailyEarnings.textContent = `€${pay.toFixed(2)}`;
}

["startTime","endTime","breakTime","hourlyWage"]
.forEach(id => document.getElementById(id).oninput = calculate);

document.getElementById("saveEntry").onclick = () => {
const entries = getEntries();
entries[selectedDateKey] = {
start: startTime.value,
end: endTime.value,
break: breakTime.value,
wage: hourlyWage.value
};
saveEntries(entries);
closeModal();
renderCalendar();
updateTotals();
};

document.getElementById("deleteEntry").onclick = () => {
const entries = getEntries();
delete entries[selectedDateKey];
saveEntries(entries);
closeModal();
renderCalendar();
updateTotals();
};

function closeModal() {
document.getElementById("entryModal").classList.add("hidden");
}

// ===== TOTALS =====
function updateTotals() {
const entries = getEntries();
let totalHours = 0;
let totalPay = 0;

const year = currentDate.getFullYear();
const month = currentDate.getMonth() + 1;

for (let key in entries) {
if (key.startsWith(`${year}-${month}`)) {
const e = entries[key];

const start = new Date(`1970-01-01T${e.start}`);
const end = new Date(`1970-01-01T${e.end}`);
let diff = (end - start) / 1000 / 60 / 60 - e.break/60;
if (diff < 0) diff = 0;

totalHours += diff;
totalPay += diff * e.wage;
}
}

totalHoursEl.textContent = totalHours.toFixed(2);
totalEarnings.textContent = `€${totalPay.toFixed(2)}`;
}

// ===== MONTH SWITCH =====
prevMonth.onclick = () => {
currentDate.setMonth(currentDate.getMonth() - 1);
renderCalendar();
updateTotals();
};

nextMonth.onclick = () => {
currentDate.setMonth(currentDate.getMonth() + 1);
renderCalendar();
updateTotals();
};

// ===== SERVICE WORKER =====
function registerSW() {
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('service-worker.js');
}
}