import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { exportToExcel } from "./exportExcel.js"; // Import the Excel export function

const firebaseConfig = {
    apiKey: "AIzaSyDFax_hk9d4qvGPrS3EHsf1ug2jIHpiZuI",
    authDomain: "customerfeedbacksystem-2d20b.firebaseapp.com",
    projectId: "customerfeedbacksystem-2d20b",
    storageBucket: "customerfeedbacksystem-2d20b.appspot.com",
    messagingSenderId: "258504629364",
    appId: "1:258504629364:web:792fc57ac8161374748521",
    measurementId: "G-9GJ32EF038"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function selectClinic(clinicId) {
    localStorage.setItem("selectedClinic", clinicId);
    window.location.href = "dashboard.html"; // Redirect after selection
}

// Fetch recent users
    // Fetch all recent users from Firestore
    async function fetchRecentUsers() {
        try {
            const selectedClinic = localStorage.getItem("selectedClinic"); // Retrieve stored clinic
            if (!selectedClinic) {
                console.warn("No clinic selected.");
                return;
            }

            const snapshot = await db.collection("clinics")
                .doc(selectedClinic)
                .collection("users")
                .orderBy("timestamp", "desc") // Sort by timestamp (latest first)
                .get(); // Removed the limit(3) to fetch all users

            let tableBody = document.querySelector("#recent-users-table tbody");
            tableBody.innerHTML = "";

            if (snapshot.empty) {
                tableBody.innerHTML = `<tr><td colspan="4">No recent users found</td></tr>`; // Updated colspan for 4 columns
                return;
            }

            snapshot.forEach(doc => {
                let data = doc.data();
                let timestamp = data.timestamp ? formatDateTime(data.timestamp.toDate()) : "N/A";

                let row = `<tr>
                <td>${data.name || "Unknown"}</td>
                <td>${data.email || "No Email"}</td>
                <td>${data.phone || "Nu'uh"}</td>
                <td>${timestamp}</td>
            </tr>`;

                tableBody.innerHTML += row;
            });

        } catch (error) {
            console.error("Error fetching recent users:", error);
        }
    }

// Format date & time
function formatDateTime(date) {
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }).format(date);
}

// Export to Excel
if (document.getElementById("exportExcelBtn")) {
    document.getElementById("exportExcelBtn").addEventListener("click", () => {
        exportToExcel();
    });
}

// Load users when page loads
document.addEventListener("DOMContentLoaded", fetchAllUsers);

export function exportToExcel() {
    let table = document.getElementById("full-users-table");
    if (!table) {
        console.warn("Table not found!");
        return;
    }

    let rows = Array.from(table.rows).map(row =>
        Array.from(row.cells).map(cell => cell.innerText)
    );

    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Customer_List.csv");
    document.body.appendChild(link);
    link.click();
}