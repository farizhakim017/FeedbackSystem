// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDFax_hk9d4qvGPrS3EHsf1ug2jIHpiZuI",
    authDomain: "customerfeedbacksystem-2d20b.firebaseapp.com",
    projectId: "customerfeedbacksystem-2d20b",
};

// Initialize Firebase (prevent multiple initializations)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Questions
const questions = [
    "Courteous & Friendly Staff? 👤",
    "Prompt & Clear Information? ℹ️",
    "Cleanliness of Facility? 🫧",
    "Washrooms? 🚽🚻",
    "Air Conditioning? ❄️",
    "Medical Equipment? 🩺",
    "Your waiting time? ⌛",
    "Overall experience? 🤔"
];

// Variables for calculations
let feedbackCount = 0;
let questionSums = Array(questions.length).fill(0);
let feedbackChart;

// Fetch feedback data from Firestore
async function fetchFeedbackData() {
    try {
        // Get the selected clinic from local storage
        const selectedClinic = localStorage.getItem("selectedClinic");
        if (!selectedClinic) {
            console.warn("No clinic selected.");
            return;
        }

        // Fetch feedback documents from the selected clinic
        const snapshot = await db.collection("clinics")
            .doc(selectedClinic)
            .collection("feedback")
            .get();

        console.log(`Fetched ${snapshot.size} feedback documents for clinic:`, selectedClinic);

        // Reset feedback count and rating sums
        feedbackCount = snapshot.size;
        let ratingsCount = Array(5).fill(0);
        questionSums = Array(questions.length).fill(0); // Reset question sums

        // Loop through feedback documents
        snapshot.forEach(doc => {
            let data = doc.data();
            console.log("Fetched feedback document:", data); // Debug log

            let ratingValues = [];

            // Extract numeric feedback values dynamically
            Object.keys(data).forEach(key => {
                if (key.endsWith("_feedback") && typeof data[key] === "number") {
                    ratingValues.push(data[key]);
                }
            });

            // Check if valid ratings exist
            if (ratingValues.length === 0) {
                console.warn("No valid feedback ratings found in doc:", doc.id);
                return;
            }

            // Process ratings
            ratingValues.forEach((rating, index) => {
                if (rating >= 1 && rating <= 5) {
                    questionSums[index] += rating;
                    ratingsCount[rating - 1]++;
                } else {
                    console.warn(`Invalid rating value (${rating}) in doc:`, doc.id);
                }
            });
        });

        console.log("Final ratingsCount:", ratingsCount); // Debug log
        updateDashboard(ratingsCount);
    } catch (error) {
        console.error("Error fetching feedback data:", error);
    }
    loadImprovements(selectedClinic);

}


// Update Dashboard with Data
function updateDashboard(ratingsCount) {
    document.getElementById("total-feedback").textContent = feedbackCount;
    let positiveResponses = 0;

    let feedbackContainer = document.getElementById("feedback-container");
    feedbackContainer.innerHTML = ""; // Clear previous data

    questionSums.forEach((sum, index) => {
        let avg = feedbackCount ? (sum / feedbackCount).toFixed(2) : 0;

        let ratingColor;
        if (avg >= 4.5) {
            ratingColor = "#00FF11";
        } else if (avg >= 3.50) {
            ratingColor = "#7BEC95";
        } else if (avg >= 3) {
            ratingColor = "#FF8E48";
        } else if (avg >= 2) {
            ratingColor = "#FF8E48";
        } else {
            ratingColor = "#c0392b";
        }

        let questionBox = `
            <div class="question-box" style="border: 5px solid ${ratingColor};">
                <p class="question-text">${questions[index]}</p>
                <p class="question-rating" style="color: ${ratingColor};">${avg}</p>
            </div>
        `;

        feedbackContainer.innerHTML += questionBox;
        if (avg >= 4) positiveResponses++;
    });

    let positivePercentage = ((positiveResponses / questions.length) * 100).toFixed(2);
    document.getElementById("positive-feedback").textContent = positivePercentage;

    generateChart(ratingsCount);
}


// Generate Chart for Feedback Ratings
function generateChart(ratingsCount) {
    let ctx = document.getElementById("feedbackChart").getContext("2d");

    // Ensure ratingsCount is valid
    if (!Array.isArray(ratingsCount) || ratingsCount.length !== 5) {
        console.error("Invalid ratingsCount data:", ratingsCount);
        return;
    }

    // Destroy previous chart if exists
    if (feedbackChart) {
        feedbackChart.destroy();
    }

    // Create a new chart
    feedbackChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["😡 Very Not Satisfied", "😞 Not Satisfied", "😐 Decent", "😊 Good", "😍 Excellent"],
            datasets: [{
                label: "Number of Ratings",
                data: ratingsCount,
                backgroundColor: ["#e74c3c", "#f39c12", "#f1c40f", "#2ecc71", "#3498db"],
            }]
        }
    });
}

// Fetch recent users from Firestore
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
            .orderBy("timestamp", "desc")
            .limit(3)
            .get();

        let tableBody = document.querySelector("#recent-users-table tbody");
        tableBody.innerHTML = "";

        if (snapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="3">No recent users found</td></tr>`;
            return;
        }

        snapshot.forEach(doc => {
            let data = doc.data();
            let timestamp = data.timestamp ? formatDateTime(data.timestamp.toDate()) : "N/A";

            let row = `<tr>
                <td>${data.name || "Unknown"}</td>
                <td>${data.email || "No Email"}</td>
                <td>${data.phone || "Nu'uh"} </td>
                <td>${timestamp}</td>
            </tr>`;

            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error("Error fetching recent users:", error);
    }
}

// Function to format the date
function formatDateTime(date) {
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    let year = date.getFullYear();
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Call function to fetch data
fetchFeedbackData();
fetchRecentUsers();

// Clinic Modal Button
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("clinicModal");
    const overlay = document.getElementById("modalOverlay");
    const clinicOptions = document.querySelectorAll(".clinic-option");
    const selectClinicBtn = document.getElementById("selectClinicBtn");
    const clinicInput = document.getElementById("clinic");

    function openModal() {
        modal.style.display = "block";
        overlay.style.display = "block";
    }

    function closeModal() {
        modal.style.display = "none";
        overlay.style.display = "none";
    }

    selectClinicBtn.addEventListener("click", openModal);
    overlay.addEventListener("click", closeModal);
    document.querySelector(".close-btn").addEventListener("click", closeModal);

    const savedClinic = localStorage.getItem("selectedClinic");
    if (savedClinic) {
        clinicInput.value = savedClinic;
        selectClinicBtn.innerText = "Clinic: " + savedClinic;
    }

    clinicOptions.forEach(option => {
        option.addEventListener("click", () => {
            const selectedClinic = option.dataset.clinic;
            clinicInput.value = selectedClinic;
            localStorage.setItem("selectedClinic", selectedClinic);
            selectClinicBtn.innerText = "Clinic: " + selectedClinic;
            closeModal();
        });
    });

    // Clinic Search Bar
    document.getElementById("clinicSearch").addEventListener("input", function () {
        let filter = this.value.toLowerCase();
        let clinics = document.querySelectorAll(".clinic-option");

        clinics.forEach(function (clinic) {
            let clinicName = clinic.textContent.toLowerCase();
            clinic.style.display = clinicName.includes(filter) ? "block" : "none";
        });
    });
});

function loadImprovements(selectedClinic) {
    if (!selectedClinic) return;

    const improvementsRef = db.collection("clinics").doc(selectedClinic).collection("improvements");

    improvementsRef.orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        const improvementsTableBody = document.querySelector("#improvementsTable tbody");
        const fullImprovementList = document.querySelector("#fullImprovementList");

        improvementsTableBody.innerHTML = "";
        fullImprovementList.innerHTML = "";

        if (snapshot.empty) {
            improvementsTableBody.innerHTML = "<tr><td colspan='2' style='text-align:center;'>No improvement suggestions yet.</td></tr>";
            fullImprovementList.innerHTML = "<li>No improvement suggestions available.</li>";
            return;
        }

        let count = 1;
        let totalCount = 0;

        snapshot.forEach((doc) => {
            let data = doc.data();
            if (data.feedback) {
                // Show only the latest 3 suggestions in the table
                if (totalCount < 3) {
                    const row = document.createElement("tr");
                    row.innerHTML = `<td>${count++}</td><td>${data.feedback.substring(0, 30)}...</td>`;
                    improvementsTableBody.appendChild(row);
                }

                // Show all feedback in the modal list
                const listItem = document.createElement("li");
                listItem.textContent = data.feedback;
                fullImprovementList.appendChild(listItem);

                totalCount++;
            }
        });
    }, (error) => {
        console.error("Error fetching improvements:", error);
        document.querySelector("#improvementsTable tbody").innerHTML = "<tr><td colspan='2'>Error loading data</td></tr>";
    });
}

// Open modal to view full list
document.getElementById("viewAllBtn").addEventListener("click", () => {
    document.getElementById("improvementModal").style.display = "block";
});

// Close modal when 'X' is clicked
document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("improvementModal").style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", (event) => {
    const modal = document.getElementById("improvementModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});



const selectedClinic = localStorage.getItem("selectedClinic");
if (selectedClinic) {
    loadImprovements(selectedClinic);
}

document.addEventListener("DOMContentLoaded", function () {
    const viewMoreUsersBtn = document.getElementById("viewMoreUsersBtn");
    const recentUsersPopup = document.getElementById("recentUsersPopup");
    const closePopupBtn = recentUsersPopup.querySelector(".popup-close");
    const allUsersPopupTableBody = document.getElementById("all-users-popup-table").querySelector("tbody");

    viewMoreUsersBtn.addEventListener("click", function () {
        const selectedClinic = localStorage.getItem("selectedClinic"); // Retrieve stored clinic
        if (!selectedClinic) {
            alert("Please select a clinic first.");
            return;
        }
        
        fetchAllUsersPopup(selectedClinic); // Fetch all users
        recentUsersPopup.style.display = "flex"; // Show popup
    });

    closePopupBtn.addEventListener("click", function () {
        recentUsersPopup.style.display = "none"; // Hide popup
    });

    async function fetchAllUsersPopup(clinic) {
        try {
            const snapshot = await db.collection("clinics")
                .doc(clinic)
                .collection("users")
                .orderBy("timestamp", "desc") // Order by most recent
                .get();

            allUsersPopupTableBody.innerHTML = ""; // Clear previous data

            if (snapshot.empty) {
                allUsersPopupTableBody.innerHTML = `<tr><td colspan="4">No users found</td></tr>`;
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
                allUsersPopupTableBody.innerHTML += row;
            });
        } catch (error) {
            console.error("Error fetching all users:", error);
        }
    }
    
});

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("improvementModal");
    const modalOverlay = document.querySelector(".modal-improve-overlay"); // Updated class name
    const closeModal = document.querySelector(".modal-improve-close"); // Updated class name
    const viewMoreBtn = document.getElementById("viewMoreBtn");

    function openModal() {
        modal.style.display = "block";
        modalOverlay.style.display = "block";
        setTimeout(() => modal.classList.add("show"), 50); // Smooth animation
    }

    function closeModalFunc() {
        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = "none";
            modalOverlay.style.display = "none";
        }, 300);
    }

    if (viewMoreBtn) {
        viewMoreBtn.addEventListener("click", openModal);
    }
    
    if (closeModal) {
        closeModal.addEventListener("click", closeModalFunc);
    }

    window.addEventListener("click", function (event) {
        if (event.target === modalOverlay) {
            closeModalFunc();
        }
    });
});

