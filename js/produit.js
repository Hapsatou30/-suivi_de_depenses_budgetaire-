import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

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

// Vérifier l'état d'authentification de l'utilisateur
onAuthStateChanged(auth, (user) => {
    if (user) {
        const userId = user.uid; // ID de l'utilisateur connecté
        console.log('Utilisateur connecté : ', userId);

        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault(); // Empêche l'envoi du formulaire par défaut

            const productName = document.getElementById('productName').value;
            const productPrice = document.getElementById('productPrice').value;
            const productQuantity = document.getElementById('productQuantity').value;

            const productId = Date.now(); // Utiliser l'horodatage comme ID unique
            const productRef = ref(db, `products/${userId}/${productId}`);

            // Enregistrer les données dans Firebase
            set(productRef, {
                name: productName,
                price: productPrice,
                quantity: productQuantity
            }).then(() => {
                alert('Produit ajouté avec succès !');
                document.getElementById('productForm').reset();
            }).catch((error) => {
                console.error('Erreur lors de l\'ajout du produit : ', error);
            });
        });
    } else {
        console.log('Utilisateur non authentifié');
    }
});
