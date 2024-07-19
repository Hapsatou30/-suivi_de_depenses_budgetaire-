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
const email = document.getElementById('email'); 
const mot_de_passe = document.getElementById('mot_de_passe'); 
const deconnexion = document.getElementById('deconnexion'); 

// Fonction pour valider l'email
const isValidEmail = email => {
    // Expression régulière pour valider l'email
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    return re.test(String(email).toLowerCase());
  };
  
  const validationForm = () =>{
    let isValid = true;
  
    //validation du email
    const valeurEmail = email.value.trim();
    if (valeurEmail ===''){
      setError(email, "l'email est obligatoire");
      isValid = false
    }else if(!isValidEmail(valeurEmail)){
      setError(email, "l'email doit être vallide");
      isValid = false;
    } else {
      setSuccess(email);
    }
  
    //validation du mot de passe 
    const valeurMotDePasse = mot_de_passe.value.trim();
    if (valeurMotDePasse === '')
    {
      setError(mot_de_passe, ' le mot de passe est obligatoire');
      isValid= false;
    } else if(valeurMotDePasse.length < 8){
      setError(mot_de_passe, 'le mot de passe doit contenir au moins 8 caractères');
    }else{
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

    // Connecte un utilisateur avec l'email et le mot de passe fournis
    signInWithEmailAndPassword(auth, email.value, mot_de_passe.value)
      .then((credentials) => {
        // Récupère les informations de l'utilisateur à partir de la base de données
        get(child(dbref, 'UserAuthList/' + credentials.user.uid)).then((snapshot) => {
          if (snapshot.exists) {
            // Stocke les informations de l'utilisateur dans la session du navigateur
            sessionStorage.setItem('user-infos', JSON.stringify({
              Nom: snapshot.val().Nom,
              Prenom: snapshot.val().Prenom
            }))
            sessionStorage.setItem('user-creds', JSON.stringify(credentials.user));
            window.location.href = 'accueil.html';
          }
        })
      })
      .catch((error) => {
        alert(error.message);
        console.log(error.code);
        console.log(error.message); 
      })
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
  

// Récupère les informations de l'utilisateur depuis la session
let UserCreds = JSON.parse(sessionStorage.getItem('user-creds'));
let UserInfos = JSON.parse(sessionStorage.getItem('user-infos'));

// Fonction pour déconnecter un utilisateur
let Deconnexion = () => {
  sessionStorage.removeItem("user-creds"); // Supprime les informations de connexion de la session
  sessionStorage.removeItem("user-infos"); // Supprime les informations de l'utilisateur de la session
  window.location.href = 'connexion.html'; 
}

// Fonction pour vérifier si l'utilisateur est connecté
let CheckCred = () => {
  if (!sessionStorage.getItem('user-creds'))
    window.location.href = 'connexion.html'; 
  else {
    MsgHead.innerText = `Utilisateur avec le mail "${UserCreds.email}" est connecté `; 
    GreetHead.innerText = `Bienvenue ${UserInfos.Prenom + " " + UserInfos.Nom}`; 
  }
}
window.addEventListener('', CheckCred); 
deconnexion.addEventListener('click', Deconnexion); 