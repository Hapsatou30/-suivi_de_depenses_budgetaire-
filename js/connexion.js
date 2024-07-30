import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

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
const dbref = ref(db);

const form = document.getElementById('Form');
const email = document.getElementById('email'); 
const mot_de_passe = document.getElementById('mot_de_passe'); 

const isValidEmail = email => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
};

const validationForm = () => {
    let isValid = true;

    const valeurEmail = email.value.trim();
    if (valeurEmail === '') {
        setError(email, "L'email est obligatoire");
        isValid = false;
    } else if (!isValidEmail(valeurEmail)) {
        setError(email, "L'email doit être valide");
        isValid = false;
    } else {
        setSuccess(email);
    }

    const valeurMotDePasse = mot_de_passe.value.trim();
    if (valeurMotDePasse === '') {
        setError(mot_de_passe, 'Le mot de passe est obligatoire');
        isValid = false;
    } else if (valeurMotDePasse.length < 8) {
        setError(mot_de_passe, 'Le mot de passe doit contenir au moins 8 caractères');
        isValid = false;
    } else {
        setSuccess(mot_de_passe);
    }

    return isValid;
}

form.addEventListener('submit', e => {
    e.preventDefault(); 

    if (!validationForm()) {
        return;
    }

    signInWithEmailAndPassword(auth, email.value, mot_de_passe.value)
        .then((credentials) => {
            get(child(dbref, 'UserAuthList/' + credentials.user.uid)).then((snapshot) => {
                if (snapshot.exists()) {
                    sessionStorage.setItem('user-infos', JSON.stringify({
                        Nom: snapshot.val().Nom,
                        Prenom: snapshot.val().Prenom
                    }));
                    sessionStorage.setItem('user-creds', JSON.stringify(credentials.user));
                    Swal.fire({
                        icon: 'success',
                        title: 'Connexion réussie',
                        timer: 1000,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = 'accueil.html';
                    });
                }
            });
        })
        .catch((error) => {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.message,
                timer: 1000,
                showConfirmButton: false
            });
            console.log(error.code);
            console.log(error.message);
        });
});

const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
}

const setSuccess = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');
    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
}

