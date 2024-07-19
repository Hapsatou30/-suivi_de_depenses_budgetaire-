
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
  import { getDatabase, set, ref  } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
  import { getAuth, createUserWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
  
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyA0XjxPY09jH-LPQu4SWtFmZZpFgbFvp4M",
    authDomain: "suivi-de-depenses-budgetaire.firebaseapp.com",
    projectId: "suivi-de-depenses-budgetaire",
    storageBucket: "suivi-de-depenses-budgetaire.appspot.com",
    messagingSenderId: "526282351821",
    appId: "1:526282351821:web:ba4afae87d8c40bb20b584"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getDatabase();
  const auth = getAuth(app);

   // Récupérer les éléments du formulaire
   const form = document.getElementById('registrationForm');
   const nom = document.getElementById('nom');
   const prenom = document.getElementById('prenom');
   const email = document.getElementById('email');
   const mot_de_passe = document.getElementById('mot_de_passe');

   let RegisterUser = e =>{
        e.preventDefault();

        createUserWithEmailAndPassword(auth, email.value, mot_de_passe.value)
        .then((credentials)=> {
            console.log(credentials);
        })
        .catch((error)=>{
            alert(error.message);
            console.log(error.code);
            console.log(error.message);
        })
   }
   form.addEventListener('submit', RegisterUser);
