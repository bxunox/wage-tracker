// ===== STORAGE =====
const getEntries = () => JSON.parse(localStorage.getItem("entries") || "{}");
const saveEntries = (data) => localStorage.setItem("entries", JSON.stringify(data));

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
const unavailableEntryBtn = document.getElementById("unavailableEntry");
const closeModalBtn = document.getElementById("closeModal");

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

// Days of week starting with Monday
const daysOfWeek = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
for (let d of daysOfWeek) {
const header = document.createElement("div");
header.textContent = d;
header.style.fontWeight = "bold";
header.style.textAlign = "center";
calendarEl.appendChild(header);
}

const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; // shift Sunday=6
const daysInMonth = new Date(year, month + 1, 0).getDate();
const entries = getEntries();

for (let i = 0; i < firstDay; i++) calendarEl.appendChild(document.createElement("div"));

for (let d = 1; d <= daysInMonth; d++) {
const key = `${year}-${month+1}-${d}`;
const day = document.createElement("div");
day.className = "day";
day.style.textAlign = "center";
day.innerHTML = `<div>${d}</div>`;

// Show entry info
const e = entries[key];
if (e) {
const info = document.createElement("div");
info.className = "info";
if (e.unavailable) {
info.textContent = "Unavailable";
info.style.background="#cc3333";
} else {
let diff = e.hoursWorked || 0;
let pay = e.pay || 0;
info.textContent = `${diff.toFixed(2)}h / €${pay.toFixed(2)}`;
}
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
entryModal.style.opacity="0";
setTimeout(()=>entryModal.style.opacity="1", 10); // smooth fade in

const [y,m,d] = key.split("-");
entryDateEl.textContent = `${parseInt(d)}.${parseInt(m)}.${y}`;
entryDateEl.classList.add("center-text");

const entries = getEntries();
const data = entries[key];
if (data && !data.unavailable) {
startTime.value = data.start;
endTime.value = data.end;
breakTime.value = data.break;
hourlyWage.value = data.wage;
} else {
startTime.value="16:00";
endTime.value="22:00";
breakTime.value=30;
// Automatic Saturday wage
const date = new Date(y,m-1,d);
if(date.getDay()===6) hourlyWage.value=9.23; // Saturday (Sunday=0)
else hourlyWage.value=6.6;
}

calculate();
}

// ===== CALCULATION =====
function calculate() {
const start = new Date(`1970-01-01T${startTime.value}`);
const end = new Date(`1970-01-01T${endTime.value}`);
let diff = (end - start)/1000/60/60 - breakTime.value/60;
if(diff<0) diff=0;
workedHours.textContent = diff.toFixed(2);
const pay = diff*parseFloat(hourlyWage.value);
dailyEarnings.textContent = `€${pay.toFixed(2)}`;
}

// Inputs recalc
[startTime,endTime,breakTime,hourlyWage].forEach(i=>i.oninput=calculate);

// ===== SAVE / DELETE / UNAVAILABLE =====
saveEntryBtn.onclick = () => {
const entries = getEntries();
const start = parseFloat(workedHours.textContent);
const pay = parseFloat(dailyEarnings.textContent.replace("€",""));
entries[selectedDateKey] = {
start: startTime.value,
end: endTime.value,
break: breakTime.value,
wage: hourlyWage.value,
hoursWorked: start,
pay: pay
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

unavailableEntryBtn.onclick = () => {
const entries = getEntries();
entries[selectedDateKey] = { unavailable:true };
saveEntries(entries);
entryModal.classList.add("hidden");
renderCalendar();
updateTotals();
};

closeModalBtn.onclick = () => entryModal.classList.add("hidden");

// ===== TOTALS =====
function updateTotals() {
const entries = getEntries();
let totalHours=0, totalPay=0;
const year=currentDate.getFullYear();
const month=currentDate.getMonth()+1;
for(let key in entries){
if(key.startsWith(`${year}-${month}`)){
const e = entries[key];
if(!e.unavailable){
totalHours+=e.hoursWorked||0;
totalPay+=e.pay||0;
}
}
}
totalHoursEl.textContent = totalHours.toFixed(2);
totalEarningsEl.textContent = `€${totalPay.toFixed(2)}`;
}

// ===== MONTH SWITCH =====
prevMonth.onclick = ()=>{currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); updateTotals();}
nextMonth.onclick = ()=>{currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); updateTotals();}

// ===== SERVICE WORKER =====
function registerSW(){
if('serviceWorker' in navigator){navigator.serviceWorker.register('service-worker.js');}
}