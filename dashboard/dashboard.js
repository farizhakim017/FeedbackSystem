// 🔥 Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { collection, getDocs, getFirestore, limit, orderBy, query } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ✅ Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDFax_hk9...",
    authDomain: "customerfeedbacksystem-2d20b.firebaseapp.com",
    projectId: "customerfeedbacksystem-2d20b",
    storageBucket: "customerfeedbacksystem-2d20b.appspot.com",
    messagingSenderId: "258504629364",
    appId: "1:258504629364:web:792fc57ac8161374748521",
    measurementId: "G-9GJ32EF038"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📌 Fetch & Display Total Feedback and Average Rating
async function fetchFeedbackStats() {
    const totalFeedbackElement = document.getElementById("total-feedback");
    const avgRatingElement = document.getElementById("average-rating");

    try {
        const querySnapshot = await getDocs(collection(db, "improvements"));
        let totalFeedback = querySnapshot.size;
        let totalRating = 0;
        let ratingCount = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.rating !== undefined && !isNaN(data.rating)) {
                totalRating += Number(data.rating);
                ratingCount++;
            }
        });

        const averageRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : "N/A";

        totalFeedbackElement.textContent = totalFeedback;
        avgRatingElement.textContent = averageRating;

        console.log("Feedback stats loaded successfully!", { totalFeedback, averageRating });
    } catch (error) {
        console.error("Error fetching feedback stats:", error);
    }
}

// 📌 Fetch & Display the 3 Most Recent Users
async function fetchRecentCustomers() {
    const customersTable = document.getElementById("customersTableBody");
    customersTable.innerHTML = ""; 

    try {
        const querySnapshot = await getDocs(
            query(collection(db, "users"), orderBy("timestamp", "desc"), limit(3))
        );

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = `
                <tr>
                    <td>${data.name || "No Name"}</td>
                    <td>${data.phone || "No Phone"}</td>
                    <td>${data.email || "No Email"}</td>
                </tr>
            `;
            customersTable.innerHTML += row;
        });

        console.log("Recent 3 customers loaded successfully!");
    } catch (error) {
        console.error("Error fetching recent customers:", error);
    }
}

// 📌 Fetch & Display the 3 Most Recent Feedbacks
async function fetchRecentFeedbacks() {
    const feedbackTable = document.getElementById("feedbackTableBody");
    feedbackTable.innerHTML = "";

    try {
        const querySnapshot = await getDocs(
            query(collection(db, "improvements"), orderBy("timestamp", "desc"), limit(3))
        );

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = `<tr><td>${data.feedback || "No Feedback"}</td></tr>`;
            feedbackTable.innerHTML += row;
        });

        console.log("Recent 3 feedbacks loaded successfully!");
    } catch (error) {
        console.error("Error fetching recent feedbacks:", error);
    }
}

// 📌 Fetch & Display Ratings Breakdown
async function fetchRatingsBreakdown() {
    const ratingCounts = {
        "very-not-satisfied": 0,
        "not-satisfied": 0,
        "decent": 0,
        "good": 0,
        "excellent": 0
    };

    try {
        const querySnapshot = await getDocs(collection(db, "improvements"));

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.rating !== undefined) {
                switch (data.rating) {
                    case 1: ratingCounts["very-not-satisfied"]++; break;
                    case 2: ratingCounts["not-satisfied"]++; break;
                    case 3: ratingCounts["decent"]++; break;
                    case 4: ratingCounts["good"]++; break;
                    case 5: ratingCounts["excellent"]++; break;
                }
            }
        });

        // Update UI
        document.getElementById("count-very-not-satisfied").textContent = ratingCounts["very-not-satisfied"];
        document.getElementById("count-not-satisfied").textContent = ratingCounts["not-satisfied"];
        document.getElementById("count-decent").textContent = ratingCounts["decent"];
        document.getElementById("count-good").textContent = ratingCounts["good"];
        document.getElementById("count-excellent").textContent = ratingCounts["excellent"];

        console.log("Ratings breakdown loaded successfully!", ratingCounts);
    } catch (error) {
        console.error("Error fetching ratings breakdown:", error);
    }
}

// 📌 Fetch & Display Questionnaire Results
async function fetchQuestionnaireResults() {
    const questionTotals = {
        "courteous-friendly-staff": { sum: 0, count: 0 },
        "prompt-clear-information": { sum: 0, count: 0 }
    };

    try {
        const querySnapshot = await getDocs(collection(db, "improvements"));

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.staffRating !== undefined) {
                questionTotals["courteous-friendly-staff"].sum += Number(data.staffRating);
                questionTotals["courteous-friendly-staff"].count++;
            }
            if (data.informationRating !== undefined) {
                questionTotals["prompt-clear-information"].sum += Number(data.informationRating);
                questionTotals["prompt-clear-information"].count++;
            }
        });

        // Calculate Averages
        const staffAvg = questionTotals["courteous-friendly-staff"].count > 0
            ? (questionTotals["courteous-friendly-staff"].sum / questionTotals["courteous-friendly-staff"].count).toFixed(1)
            : "N/A";

        const infoAvg = questionTotals["prompt-clear-information"].count > 0
            ? (questionTotals["prompt-clear-information"].sum / questionTotals["prompt-clear-information"].count).toFixed(1)
            : "N/A";

        // Update UI
        document.getElementById("courteous-friendly-staff-rating").textContent = staffAvg;
        document.getElementById("prompt-clear-information-rating").textContent = infoAvg;

        console.log("Questionnaire results loaded successfully!", questionTotals);
    } catch (error) {
        console.error("Error fetching questionnaire results:", error);
    }
}

// ✅ Redirect on Table Click
document.getElementById("customersTable").addEventListener("click", function () {
    window.location.href = "recentuser.html";
});

document.getElementById("feedbackTable").addEventListener("click", function () {
    window.location.href = "feedbacks.html";
});

// ✅ Show Loading and Fetch Data
document.addEventListener("DOMContentLoaded", async function () {
    const loadingOverlay = document.getElementById("loadingOverlay");
    const dashboardContainer = document.querySelector(".dashboard-container");

    setTimeout(async () => {
        await fetchRecentCustomers();
        await fetchRecentFeedbacks();
        await fetchFeedbackStats();
        await fetchRatingsBreakdown();
        await fetchQuestionnaireResults();

        loadingOverlay.style.display = "none";
        dashboardContainer.style.display = "block";
    }, 100);
});
