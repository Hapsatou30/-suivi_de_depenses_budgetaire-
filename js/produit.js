import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { format, parseISO, differenceInCalendarDays } from 'https://cdn.jsdelivr.net/npm/date-fns@2.23.0/esm/index.js';

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

let selectedDate = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    selectedDate = urlParams.get('date');
    const formattedDate = formatDate(selectedDate);
    document.getElementById('selectedDate').textContent = formattedDate;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid;

            document.getElementById('productForm').addEventListener('submit', (e) => {
                e.preventDefault();

                if (validationForm()) {
                    const productName = document.getElementById('nom').value;
                    const productPrice = document.getElementById('prix_unitaire').value;
                    const productQuantity = document.getElementById('quantite').value;

                    const productId = Date.now();
                    const productRef = ref(db, `products/${userId}/${selectedDate}/${productId}`);

                    set(productRef, {
                        name: productName,
                        price: productPrice,
                        quantity: productQuantity
                    }).then(() => {
                        alert('Produit ajouté avec succès !');
                        document.getElementById('productForm').reset();
                        fetchProducts(userId, selectedDate);
                    }).catch((error) => {
                        console.error('Erreur lors de l\'ajout du produit : ', error);
                    });
                }
            });

            if (selectedDate) {
                fetchProducts(userId, selectedDate);
            }
        } else {
            console.log('Utilisateur non authentifié');
        }
    });
});

const validationForm = () => {
    let isValid = true;

    // Validation du nom
    const nom = document.getElementById('nom');
    const valeurNom = nom.value.trim();
    const regexNoDigits = /^[^\d]+$/;

    if (valeurNom === '') {
        setError(nom, 'Le nom est obligatoire');
        isValid = false;
    } else if (!regexNoDigits.test(valeurNom)) {
        setError(nom, 'Le nom ne doit pas contenir de chiffres');
        isValid = false;
    } else {
        setSuccess(nom);
    }

    // Validation du prix
    const prix = document.getElementById('prix_unitaire');
    const valeurPrix = prix.value.trim(); // Utilisation de trim() ici

    if (valeurPrix === '') {
        setError(prix, 'Le prix est obligatoire');
        isValid = false;
    } else if (isNaN(parseFloat(valeurPrix)) || parseFloat(valeurPrix) <= 0) {
        setError(prix, 'Le prix doit être un nombre positif');
        isValid = false;
    } else {
        setSuccess(prix);
    }

    // Validation de la quantité
    const quantite = document.getElementById('quantite');
    const valeurQuantite = quantite.value.trim(); // Utilisation de trim() ici

    if (valeurQuantite === '') {
        setError(quantite, 'La quantité est obligatoire');
        isValid = false;
    } else if (isNaN(parseInt(valeurQuantite, 10)) || parseInt(valeurQuantite, 10) <= 0) {
        setError(quantite, 'La quantité doit être un nombre entier positif');
        isValid = false;
    } else {
        setSuccess(quantite);
    }

    return isValid;
}

// Fonction pour afficher un message d'erreur
const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
  
    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
  }
  
  // Fonction pour afficher un message de succès
  const setSuccess = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
  
    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
  }
function fetchProducts(userId, date) {
    const productsRef = ref(db, `products/${userId}/${date}`);
    onValue(productsRef, (snapshot) => {
        const productsTableBody = document.getElementById('productsTableBody');
        productsTableBody.innerHTML = '';

        snapshot.forEach((childSnapshot) => {
            const product = childSnapshot.val();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${product.quantity}</td>
            `;
            productsTableBody.appendChild(row);
        });
    });
}

function formatDate(dateStr) {
    const date = parseISO(dateStr);
    const today = new Date();
    const daysDifference = differenceInCalendarDays(date, today);

    switch (daysDifference) {
        case 0:
            return "aujourd'hui";
        case -1:
            return "hier";
        case -2:
            return "avant-hier";
        case 1:
            return "demain";
        case 2:
            return "après-demain";
        default:
            return format(date, 'dd/MM/yyyy');
    }
}