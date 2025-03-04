import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { get, getDatabase, ref } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Your Firebase configuration
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
const db = getDatabase(app);

async function fetchFeedbackStats() {
    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, "feedbackStats"));
        
        if (snapshot.exists()) {
            console.log("Feedback Stats:", snapshot.val());
        } else {
            console.log("No data available");
        }
    } catch (error) {
        console.error("Error fetching feedback stats:", error);
    }
}

// Call the function
fetchFeedbackStats();

// Call the function to fetch data
fetchFeedbackStats();


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
    } catch (error) {
        console.error("Error fetching ratings breakdown:", error);
    }
}

// 📌 Fetch & Display Questionnaire Results
async function fetchQuestionnaireResults() {
    const questionTotals = {};

    try {
        const querySnapshot = await getDocs(collection(db, "improvements"));

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            Object.keys(data).forEach((key) => {
                if (key.includes("Rating") && !isNaN(data[key])) {
                    if (!questionTotals[key]) {
                        questionTotals[key] = { sum: 0, count: 0 };
                    }
                    questionTotals[key].sum += Number(data[key]);
                    questionTotals[key].count++;
                }
            });
        });

        Object.keys(questionTotals).forEach((questionKey) => {
            const avgRating = questionTotals[questionKey].count > 0
                ? (questionTotals[questionKey].sum / questionTotals[questionKey].count).toFixed(1)
                : "N/A";
            const element = document.getElementById(`${questionKey}-rating`);
            if (element) {
                element.textContent = avgRating;
            }
        });
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