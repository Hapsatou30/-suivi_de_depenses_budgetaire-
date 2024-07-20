import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { format, parseISO, differenceInCalendarDays } from 'https://cdn.jsdelivr.net/npm/date-fns@2.23.0/esm/index.js';

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA0XjxPY09jH-LPQu4SWtFmZZpFgbFvp4M",
    authDomain: "suivi-de-depenses-budgetaire.firebaseapp.com",
    projectId: "suivi-de-depenses-budgetaire",
    storageBucket: "suivi-de-depenses-budgetaire.appspot.com",
    messagingSenderId: "526282351821",
    appId: "1:526282351821:web:ba4afae87d8c40bb20b584"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Fonction pour obtenir un paramètre de la requête URL
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Obtenir l'ID utilisateur et la date de la requête URL
const userId = getQueryParam('userId');
const date = getQueryParam('date');

// Utiliser formatDate pour formater la date et mettre à jour l'élément HTML
document.getElementById('dateTitle').innerText = formatDate(date);

// Stocker tous les produits pour les filtrer plus tard
let allProducts = [];

// Fonction pour récupérer et afficher les produits pour une date spécifique
function fetchProductsForDate(userId, date) {
    const productsRef = ref(db, `products/${userId}/${date}`);
    console.log('Fetching products for:', productsRef.toString());

    onValue(productsRef, (snapshot) => {
        const productsContainer = document.getElementById('productsContainer');
        productsContainer.innerHTML = ''; // Réinitialiser le conteneur des produits
        allProducts = []; // Réinitialiser la liste des produits

        if (snapshot.exists()) {
            console.log('Products found:', snapshot.val());
            snapshot.forEach((productSnapshot) => {
                const product = productSnapshot.val();
                allProducts.push({ key: productSnapshot.key, ...product });

                const totalPrice = parseFloat(product.price) * parseInt(product.quantity, 10);
                const card = document.createElement('div');
                const productStatusClass = product.status === 'acheté' ? 'product-acheté' : 'product-not-acheté';
                const actionsVisibility = product.status === 'acheté' ? 'display: none;' : '';
                card.className = `col-md-4 col-sm-6 col-xs-12 mb-4 ${productStatusClass}`;
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
                                <i class="material-icons" style="cursor: pointer; color:red;" onclick="deleteProduct('${userId}', '${date}', '${productSnapshot.key}')">delete</i>
                            </div>
                        </div>
                    </div>
                `;
                productsContainer.appendChild(card);
            });
        } else {
            console.log('No products found');
            const card = document.createElement('div');
            card.className = 'col-12';
            card.innerHTML = '<div class="alert alert-info text-center">Aucun produit trouvé pour cette date.</div>';
            productsContainer.appendChild(card);
        }
    });
}function setActiveButton(activeId) {
    document.querySelectorAll('.btn-group .btn').forEach(button => {
        if (button.id === activeId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function filterProducts(status) {
    setActiveButton(status);
    const productsContainer = document.getElementById('productsContainer');
    productsContainer.innerHTML = ''; // Réinitialiser le conteneur des produits

    // Filtrer les produits en fonction du statut sélectionné
    const filteredProducts = allProducts.filter(product => 
        status === 'all' ? true : status === 'acheté' ? product.status === 'acheté' : product.status !== 'acheté'
    );

    // Afficher les produits filtrés
    filteredProducts.forEach(product => {
        const totalPrice = parseFloat(product.price) * parseInt(product.quantity, 10);
        const card = document.createElement('div');
        const productStatusClass = product.status === 'acheté' ? 'product-acheté' : 'product-not-acheté';
        const actionsVisibility = product.status === 'acheté' ? 'display: none;' : '';
        card.className = `col-md-4 col-sm-6 col-xs-12 mb-4 ${productStatusClass}`;
        card.innerHTML = `
            <div class="card card-product">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">Prix : ${product.price} Cfa</p>
                    <p class="card-text">Quantité : ${product.quantity}</p>
                    <p class="card-text prixT">Prix Total : ${totalPrice} Cfa</p>
                    <div class="card-actions" style="${actionsVisibility}">
                        <i class="material-icons" style="cursor: pointer;color:#8D2C5A;" onclick="checkProduct('${product.key}')">add_task</i>
                        <i class="material-icons" style="cursor: pointer; color:green;" onclick="editProduct('${product.key}')">edit</i>
                        <i class="material-icons" style="cursor: pointer; color:red;" onclick="deleteProduct('${userId}', '${date}', '${product.key}')">delete</i>
                    </div>
                </div>
            </div>
        `;
        productsContainer.appendChild(card);
    });
}

window.filterProducts=filterProducts;

// Appel initial pour charger les produits lorsque le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    fetchProductsForDate(userId, date);
});

// Fonction pour marquer un produit comme acheté
function checkProduct(productId) {
    // Afficher une boîte de confirmation
    if (confirm("Êtes-vous sûr de vouloir marquer ce produit comme acheté ?")) {
        const productRef = ref(db, `products/${userId}/${date}/${productId}`);

        update(productRef, { status: 'acheté' }).then(() => {
            // Recharger les produits après la mise à jour
            fetchProductsForDate(userId, date);
        }).catch((error) => {
            console.error("Erreur lors de la mise à jour du produit : ", error);
        });
    } else {
        // Action annulée, ne rien faire
        console.log("Marquage du produit annulé.");
    }
}

window.checkProduct = checkProduct;

// Fonction pour formater les dates
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

window.formatDate = formatDate;
