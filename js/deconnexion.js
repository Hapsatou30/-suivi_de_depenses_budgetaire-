import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { format, parseISO } from 'https://cdn.jsdelivr.net/npm/date-fns@2.23.0/esm/index.js';

const firebaseConfig = {
  apiKey: "AIzaSyA0XjxPY09jH-LPQu4SWtFmZZpFgbFvp4M",
  authDomain: "suivi-de-depenses-budgetaire.firebaseapp.com",
  projectId: "suivi-de-depenses-budgetaire",
  storageBucket: "suivi-de-depenses-budgetaire.appspot.com",
  messagingSenderId: "526282351821",
  appId: "1:526282351821:web:ba4afae87d8c40bb20b584"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const deconnexion = document.getElementById('deconnexion');
const UserCreds = JSON.parse(sessionStorage.getItem('user-creds'));
const UserInfos = JSON.parse(sessionStorage.getItem('user-infos'));

let userId = null; // Déclarez userId ici

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

function fetchDatesAndTotals(userId) {
    const productsRef = ref(db, `products/${userId}`);
    onValue(productsRef, (snapshot) => {
        const datesMap = {};

        snapshot.forEach((dateSnapshot) => {
            dateSnapshot.forEach((productSnapshot) => {
                const product = productSnapshot.val();
                const date = dateSnapshot.key;
                const price = parseFloat(product.price) * parseInt(product.quantity, 10);

                if (!datesMap[date]) {
                    datesMap[date] = 0;
                }
                datesMap[date] += price;
            });
        });

        displayDateCards(datesMap);
    });
}

function displayDateCards(datesMap) {
    const datesContainer = document.getElementById('datesContainer');
    datesContainer.innerHTML = '';

    for (const [date, totalPrice] of Object.entries(datesMap)) {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${formatDate(date)}</h5>
                <p class="card-text">Prix total : ${totalPrice.toFixed(2)} Cfa</p>
                <i class="material-icons" style="cursor: pointer;" onclick="showProducts('${date}')">visibility</i>
            </div>
        `;
        datesContainer.appendChild(card);
    }
}


function formatDate(date) {
    return format(parseISO(date), 'dd/MM/yyyy');
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        userId = user.uid;

        // Fetch dates and totals after user is authenticated
        fetchDatesAndTotals(userId);
    } else {
        console.log('Utilisateur non authentifié');
    }
});
// Définir les fonctions globalement
window.showProducts = function(date) {
    $('#productsModal').modal('show');
    fetchProducts(userId, date);
};

window.fetchProducts = function(userId, date) {
    const productsRef = ref(db, `products/${userId}/${date}`);
    onValue(productsRef, (snapshot) => {
        const productsTableBody = document.getElementById('productsTableBody');
        productsTableBody.innerHTML = '';

        snapshot.forEach((childSnapshot) => {
            const product = childSnapshot.val();
            const row = document.createElement('tr');
            const statusClass = product.status === 'acheté' ? 'product-achete' : 'product-no-achete';

            const checkIconStyle = product.status === 'acheté' ? 'display: none;' : '';

            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${product.quantity}</td>
                <td>
                    <i class="material-icons" style="cursor: pointer; ${checkIconStyle}" onclick="checkProduct('${childSnapshot.key}')">check</i>
                    <i class="material-icons" style="cursor: pointer;" onclick="editProduct('${childSnapshot.key}')">edit</i>
                    <i class="material-icons" style="cursor: pointer;" onclick="deleteProduct('${userId}', '${date}', '${childSnapshot.key}')">delete</i>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
    });
};
