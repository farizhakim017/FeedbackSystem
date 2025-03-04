import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { db } from './firebase-config.js';

// Select table body & button
const feedbackTableBody = document.getElementById("feedbackTableBody");
const downloadBtn = document.getElementById("downloadBtn");

// Fetch all feedbacks from Firebase
async function fetchFeedbacks() {
    try {
        const feedbackCollection = collection(db, "feedbacks");
        const feedbackSnapshot = await getDocs(feedbackCollection);
        let feedbackData = [];

        feedbackSnapshot.forEach(doc => {
            const data = doc.data();
            feedbackData.push(data);

            // Append data to table
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${data.username || "N/A"}</td>
                <td>${data.phone || "N/A"}</td>
                <td>${data.email || "N/A"}</td>
                <td>${data.rating || "N/A"}</td>
                <td>${data.feedback || "No Feedback"}</td>
            `;
            feedbackTableBody.appendChild(row);
        });

        return feedbackData;
    } catch (error) {
        console.error("Error fetching feedbacks:", error);
    }
}

// Function to download CSV
function downloadCSV(feedbackData) {
    let csvContent = "User Name,Phone Number,Email,Rating,Feedback\n";

    feedbackData.forEach(row => {
        csvContent += `${row.username || "N/A"},${row.phone || "N/A"},${row.email || "N/A"},${row.rating || "N/A"},${row.feedback || "No Feedback"}\n`;
    });

    // Create a Blob & trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "feedbacks.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Load feedbacks & enable download
fetchFeedbacks().then(feedbackData => {
    downloadBtn.addEventListener("click", () => downloadCSV(feedbackData));
});