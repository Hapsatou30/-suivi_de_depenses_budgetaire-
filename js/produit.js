import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, get, update } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
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
let userId = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    selectedDate = urlParams.get('date');
    const formattedDate = formatDate(selectedDate);
    document.getElementById('selectedDate').textContent = formattedDate;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            userId = user.uid;

            document.getElementById('productForm').addEventListener('submit', (e) => {
                e.preventDefault();

                if (validationForm()) {
                    const nom = document.getElementById('nom').value;
                    const prix_unitaire = document.getElementById('prix_unitaire').value;
                    const quantite = document.getElementById('quantite').value;

                    const productId = Date.now();
                    const productRef = ref(db, `products/${userId}/${selectedDate}/${productId}`);

                    set(productRef, {
                        name: nom,
                        price: prix_unitaire,
                        quantity: quantite
                    }).then(() => {
                        alert('Produit ajouté avec succès !');
                        document.getElementById('productForm').reset();
                        reset();
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

    const prix = document.getElementById('prix_unitaire');
    const valeurPrix = prix.value.trim();

    if (valeurPrix === '') {
        setError(prix, 'Le prix est obligatoire');
        isValid = false;
    } else if (isNaN(parseFloat(valeurPrix)) || parseFloat(valeurPrix) <= 0) {
        setError(prix, 'Le prix doit être un nombre positif');
        isValid = false;
    } else {
        setSuccess(prix);
    }

    const quantite = document.getElementById('quantite');
    const valeurQuantite = quantite.value.trim();

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
};

const reset = () => {
    const nom = document.getElementById('nom');
    const prix = document.getElementById('prix_unitaire');
    const quantite = document.getElementById('quantite');
  
    nom.parentElement.classList.remove('success', 'error');
    prix.parentElement.classList.remove('success', 'error');
    quantite.parentElement.classList.remove('success', 'error');
};

const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
};

const setSuccess = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

function fetchProducts(userId, date) {
    const productsRef = ref(db, `products/${userId}/${date}`);
    onValue(productsRef, (snapshot) => {
        const productsTableBody = document.getElementById('productsTableBody');
        productsTableBody.innerHTML = '';

        snapshot.forEach((childSnapshot) => {
            const product = childSnapshot.val();
            const row = document.createElement('tr');
            const statusClass = product.status === 'acheté' ? 'product-achete' : 'product-no-achete';


            // Déterminer si l'icône de vérification doit être cachée
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
}

function deleteProduct(userId, date, productId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        const productRef = ref(db, `products/${userId}/${date}/${productId}`);
        
        remove(productRef)
            .then(() => {
                console.log('Produit supprimé avec succès.');
                fetchProducts(userId, date);
            })
            .catch((error) => {
                console.error('Erreur lors de la suppression du produit : ', error.message);
            });
    }
}

window.deleteProduct = deleteProduct;

function editProduct(productId) {
    if (!userId || !selectedDate) {
        console.error('userId ou selectedDate non défini');
        return;
    }

    document.getElementById('editProductForm').style.display = 'block';
    document.getElementById('formAjout').style.display = 'none';

    const productRef = ref(db, `products/${userId}/${selectedDate}/${productId}`);
    get(productRef).then((snapshot) => {
        if (snapshot.exists()) {
            const product = snapshot.val();
            document.getElementById('editProductId').value = productId;
            document.getElementById('editnom').value = product.name;
            document.getElementById('editprix_unitaire').value = product.price;
            document.getElementById('editquantite').value = product.quantity;
        } else {
            console.error('Produit non trouvé.');
        }
    }).catch((error) => {
        console.error('Erreur lors de la récupération des données : ', error.message);
    });
}

window.editProduct = editProduct;

document.getElementById('editProductForm').addEventListener('submit', (e) => {
    e.preventDefault();

    if (validationEditForm()) {
        const productId = document.getElementById('editProductId').value;
        const nom = document.getElementById('editnom').value;
        const prix_unitaire = document.getElementById('editprix_unitaire').value;
        const quantite = document.getElementById('editquantite').value;

        const productRef = ref(db, `products/${userId}/${selectedDate}/${productId}`);

        update(productRef, {
            name: nom,
            price: prix_unitaire,
            quantity: quantite
        }).then(() => {
            alert('Produit mis à jour avec succès !');
            document.getElementById('editProductForm').reset();
            document.getElementById('editProductForm').style.display = 'none';
            fetchProducts(userId, selectedDate);
        }).catch((error) => {
            console.error('Erreur lors de la mise à jour du produit : ', error.message);
        });
    }
});

function validationEditForm() {
    let isValid = true;

    const nom = document.getElementById('editnom');
    const prix = document.getElementById('editprix_unitaire');
    const quantite = document.getElementById('editquantite');

    const valeurNom = nom.value.trim();
    const valeurPrix = prix.value.trim();
    const valeurQuantite = quantite.value.trim();

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

    if (valeurPrix === '') {
        setError(prix, 'Le prix est obligatoire');
        isValid = false;
    } else if (isNaN(parseFloat(valeurPrix)) || parseFloat(valeurPrix) <= 0) {
        setError(prix, 'Le prix doit être un nombre positif');
        isValid = false;
    } else {
        setSuccess(prix);
    }

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

function cancelEdit() {
    document.getElementById('editProductForm').style.display = 'none';
    document.getElementById('formAjout').style.display = 'block';
}

window.cancelEdit = cancelEdit;

function checkProduct(productId) {
    if (!userId || !selectedDate) {
        console.error('userId ou selectedDate non défini');
        return;
    }

    const productRef = ref(db, `products/${userId}/${selectedDate}/${productId}`);

    get(productRef).then((snapshot) => {
        if (snapshot.exists()) {
            const product = snapshot.val();
            const newStatus = product.status === 'acheté' ? 'non-acheté' : 'acheté';

            // Mettre à jour le statut du produit dans la base de données
            update(productRef, { status: newStatus })
                .then(() => {
                    console.log('Statut du produit mis à jour avec succès.');
                    fetchProducts(userId, selectedDate); // Réactualiser la liste des produits
                })
                .catch((error) => {
                    console.error('Erreur lors de la mise à jour du produit : ', error.message);
                });
        } else {
            console.error('Produit non trouvé.');
        }
    }).catch((error) => {
        console.error('Erreur lors de la récupération des données : ', error.message);
    });
}
window.checkProduct = checkProduct;
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