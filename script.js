
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
  import { getDatabase, set, ref, get, child  } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
  
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
  const dbref = ref(db);

   // Récupérer les éléments du formulaire
   const form = document.getElementById('registrationForm');
   const nom = document.getElementById('nom');
   const prenom = document.getElementById('prenom');
   const email = document.getElementById('email');
   const mot_de_passe = document.getElementById('mot_de_passe');
  const MsgHead = document.getElementById('msg');
  const GreetHead = document.getElementById("greet");
  const deconnexion = document.getElementById('deconnexion');
   let RegisterUser = e =>{
        e.preventDefault();

        createUserWithEmailAndPassword(auth, email.value, mot_de_passe.value)
        .then((credentials)=> {
           set(ref(db,'UserAuthList/' +credentials.user.uid),{
            Nom: nom.value,
            Prenom: prenom.value
           })
        })
        .catch((error)=>{
            alert(error.message);
            console.log(error.code);
            console.log(error.message);
        })
   }
   form.addEventListener('submit', RegisterUser);


   let SignInUser = e =>{
    e.preventDefault();

    signInWithEmailAndPassword(auth, email.value, mot_de_passe.value)
    .then((credentials)=> {
        get(child(dbref,'UserAuthList/' +credentials.user.uid)).then((snapshot)=>{
            if(snapshot.exists){
                sessionStorage.setItem('user-infos', JSON.stringify({
                    Nom: snapshot.val().Nom,
                    Prenom: snapshot.val().Prenom
                }))
                sessionStorage.setItem('user-creds', JSON.stringify(credentials.user));
                window.location.href = 'accueil.html';
            }
        })
    })
    .catch((error)=>{
        alert(error.message);
        console.log(error.code);
        console.log(error.message);
    })
}
form.addEventListener('submit', SignInUser);

let UserCreds = JSON.parse(sessionStorage.getItem('user-cred'));
let UserInfos = JSON.parse(sessionStorage.getItem('user-infos'));


let Deconnexion = ()=>{
    sessionStorage.removeItem("user-cred");
    sessionStorage.removeItem("user-infos");
    window.location.href = 'connexion.html'
}
let CheckCred = () =>{
    if (!sessionStorage.getItem('user-cred'))
        window.location.href = 'connexion.html'
    else{
        MsgHead.innerText = `Utilisateur avec le mail "${UserCreds.email}" est connecté `;
        GreetHead.innerText = `Bienvenue ${UserInfos.Prenom + " " + UserInfos.Nom}`;

    }
}
window.addEventListener('', CheckCred);
deconnexion.addEventListener('click', Deconnexion);