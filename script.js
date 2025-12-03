// ====== GLOBAL DATA ======
let products = JSON.parse(localStorage.getItem("products")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let editIndex = null;

// ====== UTILITY FUNCTIONS ======
function saveAll() {
localStorage.setItem("products", JSON.stringify(products));
localStorage.setItem("sales", JSON.stringify(sales));
localStorage.setItem("users", JSON.stringify(users));
localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

function displayProducts() {
const container = document.getElementById("productList");
container.innerHTML = "";
products.forEach((p, index) => {
const card = document.createElement("div");
card.className = "product-card";
card.innerHTML = `
<img src="${p.image}" alt="${p.name}" />
<h4>${p.name}</h4>
<p>₦${p.price}</p>
<div class="card-actions">
<button class="btn small" onclick="openEdit(${index})">Edit</button>
<button class="btn small outline" onclick="deleteProduct(${index})">Delete</button>
<button class="btn small primary" onclick="buyProduct(${index})">Buy</button>
</div>
`;
container.appendChild(card);
});
}

function displaySales() {
const container = document.getElementById("salesRecords");
container.innerHTML = "";
if (sales.length === 0) {
container.innerHTML = "<p>No sales yet.</p>";
return;
}
sales.forEach((s, idx) => {
const div = document.createElement("div");
div.className = "sale-record";
div.innerHTML = `
<strong>${s.product}</strong> - ₦${s.price} - Buyer: ${s.buyer || "Guest"} - Date: ${s.date}
`;
container.appendChild(div);
});
}

// ====== ADMIN PANEL FUNCTIONS ======
function addProduct() {
const name = document.getElementById("adminName").value.trim();
const price = document.getElementById("adminPrice").value.trim();
const file = document.getElementById("adminImage").files[0];

if (!name || !price || !file) {
alert("Please enter name, price, and choose an image.");
return;
}

const reader = new FileReader();
reader.onload = function(e) {
products.push({ name, price, image: e.target.result });
saveAll();
displayProducts();
document.getElementById("adminName").value = "";
document.getElementById("adminPrice").value = "";
document.getElementById("adminImage").value = "";
};
reader.readAsDataURL(file);
}

function deleteProduct(index) {
if (confirm("Are you sure you want to delete this product?")) {
products.splice(index, 1);
saveAll();
displayProducts();
}
}

// ====== EDIT PRODUCT ======
function openEdit(index) {
editIndex = index;
const p = products[index];
document.getElementById("editName").value = p.name;
document.getElementById("editPrice").value = p.price;
document.getElementById("editImage").value = "";
document.getElementById("editModal").classList.remove("hidden");
}

function closeEdit() {
editIndex = null;
document.getElementById("editModal").classList.add("hidden");
}

function saveEdit() {
if (editIndex === null) return;
const newName = document.getElementById("editName").value.trim();
const newPrice = document.getElementById("editPrice").value.trim();
const file = document.getElementById("editImage").files[0];

if (!newName || !newPrice) {
alert("Name and price cannot be empty.");
return;
}

const applyChange = (imgData) => {
products[editIndex].name = newName;
products[editIndex].price = newPrice;
if (imgData) products[editIndex].image = imgData;
saveAll();
displayProducts();
closeEdit();
};

if (file) {
const reader = new FileReader();
reader.onload = function(e) {
applyChange(e.target.result);
};
reader.readAsDataURL(file);
} else {
applyChange(null);
}
}

// ====== BUY FLOW ======
let selectedProduct = null;
function buyProduct(index) {
selectedProduct = products[index];
document.getElementById("paymentBox").classList.remove("hidden");
}

function closePayment() {
document.getElementById("paymentBox").classList.add("hidden");
selectedProduct = null;
}

function copyAccount() {
const acc = document.getElementById("acctNumber").innerText;
navigator.clipboard.writeText(acc);
alert("Account number copied!");
}

function openWhatsApp() {
const url = "https://wa.me/09071973364?text=Hi%20Worthy's%20Place";
window.open(url, "_blank");
}

function markPaid() {
if (!selectedProduct) return;
const buyerEmail = currentUser ? currentUser.email : "Guest";
const date = new Date().toLocaleString();
sales.push({
product: selectedProduct.name,
price: selectedProduct.price,
buyer: buyerEmail,
date
});
saveAll();
displaySales();
closePayment();
document.getElementById("transactionStatus").classList.remove("hidden");
}

function closeStatus() {
document.getElementById("transactionStatus").classList.add("hidden");
}

// ====== ADMIN PANEL TOGGLE ======
function openAdmin() {
document.getElementById("adminPanel").classList.remove("hidden");
displaySales();
}

function closeAdmin() {
document.getElementById("adminPanel").classList.add("hidden");
}

// ====== LOGO UPLOAD ======
function uploadLogo() {
const file = document.getElementById("logoUpload").files[0];
if (!file) return alert("Choose a logo image first.");
const reader = new FileReader();
reader.onload = function(e) {
document.querySelector(".logo-circle").style.backgroundImage = `url(${e.target.result})`;
};
reader.readAsDataURL(file);
}

// ====== EXPORT / IMPORT ======
document.getElementById("exportBtn").addEventListener("click", () => {
const data = JSON.stringify({ products, sales, users });
const blob = new Blob([data], { type: "application/json" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "worthy_place_data.json";
a.click();
});

document.getElementById("importBtn").addEventListener("click", () => {
document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", (e) => {
const file = e.target.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = function(e) {
try {
const data = JSON.parse(e.target.result);
products = data.products || [];
sales = data.sales || [];
users = data.users || [];
saveAll();
displayProducts();
displaySales();
alert("Data imported successfully!");
} catch {
alert("Invalid JSON file.");
}
};
reader.readAsText(file);
});

// ====== LOGIN / REGISTER ======
function openLogin() {
document.getElementById("loginModal").classList.remove("hidden");
}

function closeLogin() {
document.getElementById("loginModal").classList.add("hidden");
document.getElementById("loginMsg").innerText = "";
}

function registerUser() {
const email = document.getElementById("loginEmail").value.trim();
const pass = document.getElementById("loginPassword").value.trim();
if (!email || !pass) return alert("Enter email and password.");
if (users.some(u => u.email === email)) {
document.getElementById("loginMsg").innerText = "Email already registered.";
return;
}
const user = { email, password: pass, purchases: [] };
users.push(user);
currentUser = user;
saveAll();
closeLogin();
alert("Registration successful!");
}

function loginUser() {
const email = document.getElementById("loginEmail").value.trim();
const pass = document.getElementById("loginPassword").value.trim();
const user = users.find(u => u.email === email && u.password === pass);
if (!user) {
document.getElementById("loginMsg").innerText = "Invalid email or password.";
return;
}
currentUser = user;
saveAll();
closeLogin();
alert("Login successful!");
}

// ====== INITIALIZATION ======
document.getElementById("adminBtn").addEventListener("click", openAdmin);
document.getElementById("loginBtn").addEventListener("click", openLogin);

displayProducts();
displaySales();