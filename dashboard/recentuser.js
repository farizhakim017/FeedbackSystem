import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { collection, getDocs, getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ✅ Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDFax_hk9d4qvGPrS3EHsf1ug2jIHpiZuI",
    authDomain: "customerfeedbacksystem-2d20b.firebaseapp.com",
    projectId: "customerfeedbacksystem-2d20b",
    storageBucket: "customerfeedbacksystem-2d20b.appspot.com",
    messagingSenderId: "258504629364",
    appId: "1:258504629364:web:792fc57ac8161374748521",
    measurementId: "G-9GJ32EF038"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📌 Fetch & Display Customers in Table
async function fetchRecentCustomers() {
    const customersTable = document.getElementById("customersTableBody");
    customersTable.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            const name = data.name || "No Name";
            const phone = data.phone || "No Phone";
            const email = data.email || "No Email";

            const row = `
                <tr>
                    <td>${name}</td>
                    <td>${phone}</td>
                    <td>${email}</td>
                </tr>
            `;
            customersTable.innerHTML += row;
        });

        console.log("Customers loaded successfully!");
    } catch (error) {
        console.error("Error fetching customers:", error);
    }
}

// 🔄 Load Customers on Page Load
document.addEventListener("DOMContentLoaded", fetchRecentCustomers);

// 🔽 Function to Export Table Data to Excel
document.getElementById("downloadExcel").addEventListener("click", function () {
    let table = document.querySelector("table");
    let rows = Array.from(table.querySelectorAll("tr"));

    let data = rows.map(row => {
        return Array.from(row.querySelectorAll("th, td")).map(cell => cell.innerText);
    });

    let ws = XLSX.utils.aoa_to_sheet(data);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recent Customers");

    XLSX.writeFile(wb, "Recent_Customers.xlsx");
});
