// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyABrdcbZbaQQFYWbhlV2A4EgG1IIIJbaC8",
    authDomain: "pola-boutique.firebaseapp.com",
    projectId: "pola-boutique",
    storageBucket: "pola-boutique.firebasestorage.app",
    messagingSenderId: "175292382068",
    appId: "1:175292382068:web:8a0063386958e875580a21"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

console.log("🔥 Firebase Inicializado");
