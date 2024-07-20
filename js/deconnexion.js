import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, onValue, query, orderByChild, equalTo, update } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { format, parseISO,differenceInCalendarDays } from 'https://cdn.jsdelivr.net/npm/date-fns@2.23.0/esm/index.js';

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

document.getElementById('menuToggle').addEventListener('click', function() {
    var mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu.style.display === 'none' || mobileMenu.style.display === '') {
        mobileMenu.style.display = 'block';
    } else {
        mobileMenu.style.display = 'none';
    }
})
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
        // document.getElementById('msgHead').innerText = `Utilisateur avec le mail "${UserCreds.email}" est connecté`; 
        document.getElementById('greetHead').innerText = `Bonjour ${UserInfos.Prenom} `; 
    }
}

window.addEventListener('load', () => {
    CheckCred();
    if (deconnexion) {
        deconnexion.addEventListener('click', Deconnexion); 
    }
});

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Récupérer les produits pour la date actuelle
function fetchProductsForToday(userId) {
    const currentDate = getCurrentDate();
    const productsRef = ref(db, `products/${userId}/${currentDate}`);
    
    onValue(productsRef, (snapshot) => {
        const productsContainer = document.getElementById('productsContainer');
        productsContainer.innerHTML = ''; // Réinitialiser le conteneur des produits

        if (snapshot.exists()) {
            snapshot.forEach((productSnapshot) => {
                const product = productSnapshot.val();
                const totalPrice = parseFloat(product.price) * parseInt(product.quantity, 10);
                const card = document.createElement('div');
                const productStatusClass = product.status === 'acheté' ? 'product-acheté' : 'product-not-acheté';
                const actionsVisibility = product.status === 'acheté' ? 'display: none;' : '';
                card.className = `col-md-4 col-sm-6 col-xs-12 mb-4 ${productStatusClass}`; // Ajouter la classe spécifique au statut du produit
                card.innerHTML = `
                    <div class="card card-product">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">Prix : ${product.price} Cfa</p>
                            <p class="card-text">Quantité : ${product.quantity}</p>
                            <p class="card-text prixT">Prix Total : ${totalPrice} Cfa</p>
                            <div class="card-actions" style="${actionsVisibility}">
                               <i class="material-icons" style="cursor: pointer;color:#8D2C5A;" onclick="checkProduct('${productSnapshot.key}')">add_task</i>
                                <i class="material-icons" style="cursor: pointer; color:green;" onclick="editProduct('${productSnapshot.key}')">edit</i>
                                <i class="material-icons" style="cursor: pointer; color:red;" onclick="deleteProduct('${userId}', '${currentDate}', '${productSnapshot.key}')">delete</i>
                            </div>
                        </div>
                    </div>
                `;
                productsContainer.appendChild(card);
            });
        } else {
            const card = document.createElement('div');
            card.className = 'col-12';
            card.innerHTML = '<div class="alert alert-info text-center">Aucun produit trouvé pour aujourd\'hui.</div>';
            productsContainer.appendChild(card);
        }
    });
}


// Appeler la fonction pour récupérer les produits du jour lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchProductsForToday(user.uid);
        } else {
            console.log('Utilisateur non authentifié');
        }
    });
});

function checkProduct(productId) {
    Swal.fire({
        title: "Êtes-vous sûr ?",
        text: "Voulez-vous vraiment marquer ce produit comme acheté ?",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#8D2C5A",
        cancelButtonColor: "#d33",
        confirmButtonText: "Oui, marquez-le !"
    }).then((result) => {
        if (result.isConfirmed) {
            const currentDate = getCurrentDate();
            const userId = auth.currentUser.uid;
            const productRef = ref(db, `products/${userId}/${currentDate}/${productId}`);
            
            update(productRef, { status: 'acheté' })
                .then(() => {
                    Swal.fire({
                        title: "Marqué !",
                        text: "Le produit a été marqué comme acheté.",
                        icon: "success"
                    });
                    // Optionnel : Recharger les produits après la mise à jour
                    fetchProductsForToday(userId);
                })
                .catch((error) => {
                    console.error("Erreur lors de la mise à jour du produit : ", error);
                });
        } else {
            // Action annulée, ne rien faire
            console.log("Marquage du produit annulé.");
        }
    });
}


// Exemple d'utilisation de checkProduct pour tester
window.checkProduct = checkProduct;

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
        // Utiliser SweetAlert2 pour afficher une alerte
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Veuillez sélectionner une date.'
        });
    }
});



function fetchDatesWithProducts(userId) {
    const productsRef = ref(db, `products/${userId}`);
    
    onValue(productsRef, (snapshot) => {
        const datesContainer = document.getElementById('datesContainer');
        datesContainer.innerHTML = ''; // Réinitialiser le conteneur des dates
        
        console.log('Snapshot exists:', snapshot.exists()); // Vérifier l'existence du snapshot
        
        if (snapshot.exists()) {
            const dates = new Map(); // Utiliser un Map pour stocker les dates et les montants totaux
            snapshot.forEach((dateSnapshot) => {
                const date = dateSnapshot.key;
                let totalAmount = 0;
                
                console.log('Processing date:', date); // Afficher la date en cours
                
                dateSnapshot.forEach((productSnapshot) => {
                    const product = productSnapshot.val();
                    console.log('Product:', product); // Vérifier les détails du produit
                    
                    totalAmount += parseFloat(product.price) * parseInt(product.quantity, 10);
                });

                dates.set(date, totalAmount); // Ajouter la date et le montant total au Map
            });

            // Convertir le Map en tableau et trier les dates
            const sortedDates = Array.from(dates).sort((a, b) => new Date(b[0]) - new Date(a[0]));
            console.log('Sorted Dates:', sortedDates); // Vérifier le tableau trié
            
            // Créer les éléments HTML pour chaque date
            sortedDates.forEach(([date, totalAmount]) => {
                const formattedDate = formatDate(date); // Appliquer la fonction de formatage
                console.log('Formatted Date:', formattedDate); // Vérifier la date formatée
                
                const dateElement = document.createElement('div');
                dateElement.className = 'col-md-4 col-sm-6 col-xs-12 mb-4 date-item';
                dateElement.innerHTML = `
                    <div class="date-card">
                        <h5 class="date-title" style="color: #8D2C5A;" > Date: ${formattedDate}</h5>
                        <h5 class="date-title">Total : ${totalAmount.toFixed(2)} Cfa</h5>
                        <i class="material-icons" style="cursor: pointer; color: #8D2C5A;" onclick="redirectToProductsPage('${userId}', '${date}')">visibility</i>
                    </div>
                `;
                datesContainer.appendChild(dateElement);
            });
        } else {
            const noDatesMessage = document.createElement('div');
            noDatesMessage.className = 'col-12';
            noDatesMessage.innerHTML = '<div class="alert alert-info text-center">Aucune date trouvée.</div>';
            datesContainer.appendChild(noDatesMessage);
        }
    });
}


function redirectToProductsPage(userId, date) {
    window.location.href = `details.html?userId=${encodeURIComponent(userId)}&date=${encodeURIComponent(date)}`;
}

window.fetchDatesWithProducts = fetchDatesWithProducts;
window.redirectToProductsPage = redirectToProductsPage;


// Appeler la fonction pour récupérer les dates lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userId = user.uid; // Affecter l'ID utilisateur
            fetchProductsForToday(user.uid);
            fetchDatesWithProducts(user.uid); // Ajouter cette ligne pour récupérer les dates
        } else {
            console.log('Utilisateur non authentifié');
        }
    });
});
function formatDate(dateStr) {
    const date = parseISO(dateStr);
    const today = new Date();
    const daysDifference = differenceInCalendarDays(date, today);

    switch (daysDifference) {
        case 0:
            return "Aujourd'hui";
        case -1:
            return "Hier";
        case -2:
            return "Avant-hier";
        case 1:
            return "Demain";
        case 2:
            return "Après-demain";
        default:
            return format(date, 'dd/MM/yyyy');
    }
}
window.formatDate=formatDate;