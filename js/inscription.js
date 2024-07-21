// Ces lignes importent les modules nécessaires de Firebase pour initialiser l'application
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase, set, ref, get, child } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

// Configuration de votre application Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA0XjxPY09jH-LPQu4SWtFmZZpFgbFvp4M",
  authDomain: "suivi-de-depenses-budgetaire.firebaseapp.com",
  projectId: "suivi-de-depenses-budgetaire",
  storageBucket: "suivi-de-depenses-budgetaire.appspot.com",
  messagingSenderId: "526282351821",
  appId: "1:526282351821:web:ba4afae87d8c40bb20b584"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig); // Initialise l'application Firebase avec la configuration
const db = getDatabase(); // Obtient une référence à la base de données Firebase
const auth = getAuth(app); // Obtient une référence au service d'authentification Firebase
const dbref = ref(db); // Obtient une référence à la racine de la base de données

// Récupération des éléments du formulaire
const form = document.getElementById('registrationForm');
const nom = document.getElementById('nom'); 
const prenom = document.getElementById('prenom'); 
const email = document.getElementById('email'); 
const mot_de_passe = document.getElementById('mot_de_passe'); 
const msg = document.getElementById('msg');

// Expressions régulières pour vérifier l'absence de chiffres
const regexNoDigits = /^[^\d]*$/; 

// Fonction pour valider l'email
const isValidEmail = email => {
  // Expression régulière pour valider l'email
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return re.test(String(email).toLowerCase());
};

const validationForm = () =>{
  let isValid = true;

  // Validation du nom
  const valeurNom = nom.value.trim();
  if(valeurNom === ''){
    setError(nom, 'Le nom est obligatoire');
    isValid = false;
  } else if (!regexNoDigits.test(valeurNom)){
    setError(nom, 'Le nom ne doit pas contenir de chiffres');
    isValid = false;
  } else {
    setSuccess(nom);
  }

  // Validation du prénom
  const valeurPrenom = prenom.value.trim();
  if(valeurPrenom === ''){
    setError(prenom, 'Le prénom est obligatoire');
    isValid = false;
  } else if (!regexNoDigits.test(valeurPrenom)){
    setError(prenom, 'Le prénom ne doit pas contenir de chiffres');
    isValid = false;
  } else {
    setSuccess(prenom);
  }

  // Validation de l'email
  const valeurEmail = email.value.trim();
  if (valeurEmail === ''){
    setError(email, "L'email est obligatoire");
    isValid = false;
  } else if(!isValidEmail(valeurEmail)){
    setError(email, "L'email doit être valide");
    isValid = false;
  } else {
    setSuccess(email);
  }

  // Validation du mot de passe
  const valeurMotDePasse = mot_de_passe.value.trim();
  if (valeurMotDePasse === ''){
    setError(mot_de_passe, 'Le mot de passe est obligatoire');
    isValid= false;
  } else if(valeurMotDePasse.length < 8){
    setError(mot_de_passe, 'Le mot de passe doit contenir au moins 8 caractères');
    isValid = false;
  } else {
    setSuccess(mot_de_passe);
  }

  return isValid;
}

form.addEventListener('submit', e => {
  e.preventDefault(); 

  // Validation du formulaire
  if (!validationForm()) {
    return;
  }

  // Crée un nouvel utilisateur avec l'email et le mot de passe fournis
  createUserWithEmailAndPassword(auth, email.value, mot_de_passe.value)
    .then((credentials) => {
      // Enregistre le nom et le prénom de l'utilisateur dans la base de données
      set(ref(db, 'UserAuthList/' + credentials.user.uid), {
        Nom: nom.value,
        Prenom: prenom.value
      })
      msg.innerHTML = "<div class='alert alert-success'>Utilisateur enregistré avec succès!</div>";
      reset();

      // Redirection vers la page de connexion après l'inscription réussie
      window.location.href = 'index.html';
    })
    .catch((error) => {
      msg.innerHTML = `<div class='alert alert-danger'>${error.message}</div>`;
      console.log(error.code); // Affiche le code de l'erreur dans la console
      console.log(error.message); // Affiche le message de l'erreur dans la console
    });
}); 

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

// Fonction pour réinitialiser les champs du formulaire
const reset = () => {
  prenom.value = '';
  nom.value = '';
  email.value = '';
  mot_de_passe.value = '';

  // Réinitialiser les classes de succès/erreur
  prenom.parentElement.classList.remove('success', 'error');
  nom.parentElement.classList.remove('success', 'error');
  email.parentElement.classList.remove('success', 'error');
  mot_de_passe.parentElement.classList.remove('success', 'error');
};
