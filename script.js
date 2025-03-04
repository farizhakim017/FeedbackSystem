// 🔥 Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { addDoc, collection, getFirestore, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔥 Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDFax_hk9d4qvGPrS3EHsf1ug2jIHpiZuI",
    authDomain: "customerfeedbacksystem-2d20b.firebaseapp.com",
    projectId: "customerfeedbacksystem-2d20b",
    storageBucket: "customerfeedbacksystem-2d20b.appspot.com",
    messagingSenderId: "258504629364",
    appId: "1:258504629364:web:792fc57ac8161374748521",
    measurementId: "G-9GJ32EF038"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔑 Admin Credentials (Modify as needed)
const adminCredentials = {
    name: "Admin", 
    phone: "1234"
};

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed!");

    let selectedRating = null;
    const emojiOptions = document.querySelectorAll(".option");
    const submitButton = document.getElementById("submitFeedback");

    // 🎯 Emoji Selection Logic
    if (emojiOptions.length > 0) {
        emojiOptions.forEach(option => {
            option.addEventListener("click", function () {
                emojiOptions.forEach(opt => opt.classList.remove("selected"));
                this.classList.add("selected");
                selectedRating = this.getAttribute("data-value");
                submitButton.disabled = false;
            });
        });
    } else {
        console.error("No emoji options found!");
    }

    // 🎯 Submit Feedback
    if (submitButton) {
        submitButton.addEventListener("click", async function () {
            if (selectedRating) {
                try {
                    await addDoc(collection(db, "feedback"), {
                        rating: selectedRating,
                        userName: localStorage.getItem("userName") || "Anonymous",
                        userPhone: localStorage.getItem("userPhone") || "N/A",
                        timestamp: serverTimestamp()
                    });
                    console.log("Feedback submitted!");
                    window.location.href = selectedRating >= 4 ? "thankyou.html" : "improve.html";
                } catch (error) {
                    console.error("Error submitting feedback:", error);
                }
            }
        });
    } else {
        console.error("Submit button not found!");
    }

    // 🎯 User Form Logic
    const userForm = document.getElementById("userForm");
    if (userForm) {
        userForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const name = document.getElementById("name").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const emailField = document.getElementById("email");
            const email = emailField ? emailField.value.trim() : "";

            if (!name || !phone) {
                alert("⚠️ Please fill in all fields!");
                return;
            }

            if (name === adminCredentials.name && phone === adminCredentials.phone) {
                console.log("Admin detected! Redirecting to dashboard...");
                window.location.href = "dashboard/dashboard.html";
            } else {
                try {
                    await addDoc(collection(db, "users"), {
                        name: name,
                        phone: phone,
                        email: email || "N/A",
                        timestamp: serverTimestamp()
                    });

                    localStorage.setItem("userName", name);
                    localStorage.setItem("userPhone", phone);
                    if (email) localStorage.setItem("userEmail", email);

                    window.location.href = "rating.html";
                } catch (error) {
                    console.error("Error saving user data:", error);
                }
            }
        });
    } else {
        console.error("User form not found!");
    }

    // 🎯 Heading Animation Logic
    const headings = document.querySelectorAll(".h2-container h2");
    let index = 0;

    if (headings.length > 0) {
        headings[index].classList.add("active");
        setInterval(() => {
            headings[index].classList.remove("active");
            index = (index + 1) % headings.length;
            headings[index].classList.add("active");
        }, 3000);
    } else {
        console.error("No headings found inside .h2-container!");
    }

    // 🎯 Improve Feedback Submission
    const improveForm = document.getElementById("improveForm");
    if (improveForm) {
        improveForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            const feedback = document.getElementById("feedbackBox").innerText.trim();

            if (!feedback || feedback === "Tell us how we can improve...") {
                alert("Please enter your feedback before submitting.");
                return;
            }

            try {
                await addDoc(collection(db, "improvements"), {
                    feedback: feedback,
                    userName: localStorage.getItem("userName") || "Anonymous",
                    timestamp: serverTimestamp()
                });
                window.location.href = "thankyou.html";
            } catch (error) {
                console.error("Error submitting feedback:", error);
            }
        });
    }

    // 🎯 Auto-Select All Text in Feedback Box on Click
    const feedbackBox = document.getElementById("feedbackBox");
    if (feedbackBox) {
        feedbackBox.addEventListener("click", function () {
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(feedbackBox);
            selection.removeAllRanges();
            selection.addRange(range);
        });
    }
});
