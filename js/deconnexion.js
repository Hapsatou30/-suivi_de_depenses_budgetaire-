import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAuth,  signOut,onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0XjxPY09jH-LPQu4SWtFmZZpFgbFvp4M",
  authDomain: "suivi-de-depenses-budgetaire.firebaseapp.com",
  projectId: "suivi-de-depenses-budgetaire",
  storageBucket: "suivi-de-depenses-budgetaire.appspot.com",
  messagingSenderId: "526282351821",
  appId: "1:526282351821:web:ba4afae87d8c40bb20b584"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth(app);

const deconnexion = document.getElementById('deconnexion');
const UserCreds = JSON.parse(sessionStorage.getItem('user-creds'));
const UserInfos = JSON.parse(sessionStorage.getItem('user-infos'));


    const Deconnexion = () => {
        signOut(auth).then(() => {
            sessionStorage.removeItem("user-creds");
            sessionStorage.removeItem("user-infos");
            window.location.href = 'connexion.html';
        }).catch((error) => {
            console.error('Erreur lors de la déconnexion : ', error);
        });
    }

    const CheckCred = () => {
        if (!sessionStorage.getItem('user-creds')) {
            window.location.href = 'connexion.html'; 
        } else {
            document.getElementById('msgHead').innerText = `Utilisateur avec le mail "${UserCreds.email}" est connecté`; 
            document.getElementById('greetHead').innerText = `Bienvenue ${UserInfos.Prenom} ${UserInfos.Nom}`; 
        }
    }

    window.addEventListener('load', () => {
        CheckCred();
        if (deconnexion) {
            deconnexion.addEventListener('click', Deconnexion); 
        }
    });


// Ouvrir le modal lorsque le bouton est cliqué
document.getElementById('liste').addEventListener('click', () => {
    $('#calendarModal').modal('show');
});

// Initialiser Flatpickr lorsque le modal est complètement affiché
$('#calendarModal').on('shown.bs.modal', () => {
    flatpickr("#calendarContainer", {
        inline: true, // Affiche le calendrier en ligne
        dateFormat: "Y-m-d",
        minDate: "today",
        onChange: (selectedDates, dateStr, instance) => {
            // Sauvegarder la date sélectionnée dans une variable globale ou locale
            window.selectedDate = dateStr;
        }
    });
});

// Gérer le clic sur le bouton Confirmer
document.getElementById('confirmButton').addEventListener('click', () => {
    if (window.selectedDate) {
        // Rediriger vers la page d'ajout de produit avec la date sélectionnée en paramètre
        window.location.href = `produits.html?date=${encodeURIComponent(window.selectedDate)}`;
    } else {
        alert('Veuillez sélectionner une date.');
    }
});