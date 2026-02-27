// ===== STORAGE =====
const getEntries = () => JSON.parse(localStorage.getItem("entries") || "{}");
const saveEntries = (data) => localStorage.setItem("entries", JSON.stringify(data));

const getTemplates = () => JSON.parse(localStorage.getItem("templates") || "[]");
const saveTemplates = (data) => localStorage.setItem("templates", JSON.stringify(data));

// ===== DOM Elements =====
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
const closeModalBtn = document.getElementById("closeModal");

const templatesModal = document.getElementById("templatesModal");
const openTemplatesBtn = document.getElementById("openTemplates");
const closeTemplatesBtn = document.getElementById("closeTemplates");
const templatesList = document.getElementById("templatesList");
const addTemplateBtn = document.getElementById("addTemplate");

// ===== STATE =====
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
calendarEl.innerHTML = "";
const year = currentDate.getFullYear();
const month = currentDate.getMonth();
monthLabel.textContent = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

// Days of week
const daysOfWeek = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
for (let d of daysOfWeek) {
const header = document.createElement("div");
header.textContent = d;
header.style.fontWeight = "bold";
header.style.textAlign = "center";
calendarEl.appendChild(header);
}

const firstDay = new Date(year, month, 1).getDay();
const daysInMonth = new Date(year, month + 1, 0).getDate();
const entries = getEntries();

for (let i = 0; i < firstDay; i++) {
calendarEl.appendChild(document.createElement("div"));
}

for (let d = 1; d <= daysInMonth; d++) {
const key = `${year}-${month+1}-${d}`;
const day = document.createElement("div");
day.className = "day";
day.style.textAlign = "center";
day.innerHTML = `<div>${d}</div>`;

// If entry exists, show hours/pay
if (entries[key]) {
const e = entries[key];
const start = new Date(`1970-01-01T${e.start}`);
const end = new Date(`1970-01-01T${e.end}`);
let diff = (end-start)/1000/60/60 - e.break/60;
if (diff<0) diff=0;
const pay = diff*e.wage;
const info = document.createElement("div");
info.className = "info";
info.textContent = `${diff.toFixed(2)}h / €${pay.toFixed(2)}`;
day.appendChild(info);
}

day.onclick = () => openEntry(key);
calendarEl.appendChild(day);
}
}

// ===== ENTRY MODAL =====
function openEntry(key) {
selectedDateKey = key;
entryModal.classList.remove("hidden");

// Format date: 6.2.2026
const [y,m,d] = key.split("-");
entryDateEl.textContent = `${parseInt(d)}.${parseInt(m)}.${y}`;

const entries = getEntries();
const data = entries[key];
if (data) {
startTime.value = data.start;
endTime.value = data.end;
breakTime.value = data.break;
hourlyWage.value = data.wage;
} else {
startTime.value="16:00";
endTime.value="22:00";
breakTime.value=30;
hourlyWage.value=6.6;
}
calculate();
}

// Cancel button
closeModalBtn.onclick = () => entryModal.classList.add("hidden");

// ===== CALCULATE =====
function calculate() {
const start = new Date(`1970-01-01T${startTime.value}`);
const end = new Date(`1970-01-01T${endTime.value}`);
let diff = (end - start)/1000/60/60 - breakTime.value/60;
if (diff<0) diff=0;
workedHours.textContent = diff.toFixed(2);
const pay = diff*parseFloat(hourlyWage.value);
dailyEarnings.textContent = `€${pay.toFixed(2)}`;
}

// Inputs recalc
[startTime,endTime,breakTime,hourlyWage].forEach(i => i.oninput = calculate);

// ===== SAVE / DELETE =====
saveEntryBtn.onclick = () => {
const entries = getEntries();
entries[selectedDateKey] = {
start: startTime.value,
end: endTime.value,
break: breakTime.value,
wage: hourlyWage.value
};
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

// ===== TOTALS =====
function updateTotals() {
const entries = getEntries();
let totalHours=0, totalPay=0;
const year=currentDate.getFullYear();
const month=currentDate.getMonth()+1;
for (let key in entries){
if (key.startsWith(`${year}-${month}`)){
const e = entries[key];
const start = new Date(`1970-01-01T${e.start}`);
const end = new Date(`1970-01-01T${e.end}`);
let diff = (end-start)/1000/60/60 - e.break/60;
if (diff<0) diff=0;
totalHours+=diff;
totalPay+=diff*e.wage;
}
}
totalHoursEl.textContent = totalHours.toFixed(2);
totalEarningsEl.textContent = `€${totalPay.toFixed(2)}`;
}

// ===== MONTH SWITCH =====
prevMonth.onclick = () => {currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); updateTotals();}
nextMonth.onclick = () => {currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); updateTotals();}

// ===== TEMPLATES MODAL =====
openTemplatesBtn.onclick = () => templatesModal.classList.remove("hidden");
closeTemplatesBtn.onclick = () => templatesModal.classList.add("hidden");

addTemplateBtn.onclick = () => {
const templates = getTemplates();
templates.push({start:"16:00", end:"22:00", break:30, wage:6.6});
saveTemplates(templates);
renderTemplates();
};

function renderTemplates() {
templatesList.innerHTML="";
const templates = getTemplates();
templates.forEach((t,i)=>{
const div=document.createElement("div");
div.textContent=`${t.start}-${t.end} / ${t.break}min / €${t.wage}`;
const del=document.createElement("button");
del.textContent="X";
del.onclick=()=>{templates.splice(i,1); saveTemplates(templates); renderTemplates();};
div.appendChild(del);
templatesList.appendChild(div);
});
}

// ===== SERVICE WORKER =====
function registerSW(){
if('serviceWorker' in navigator){navigator.serviceWorker.register('service-worker.js');}
}