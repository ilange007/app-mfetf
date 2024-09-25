// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const environment = {
production: true, // Si es un entorno de producción
firebaseConfig : {
  apiKey: "AIzaSyCUNItkY6redOAk4xNWT7VJb8zrOUsqccY",
  authDomain: "tfemf-839ad.firebaseapp.com",
  projectId: "tfemf-839ad",
  storageBucket: "tfemf-839ad.appspot.com",
  messagingSenderId: "553827620396",
  appId: "1:553827620396:web:ab9cb1c434ef899f86a389",
  measurementId: "G-WRM7PYPDPT"
}
};
// Initialize Firebase
const app = initializeApp(environment.firebaseConfig);
const analytics = getAnalytics(app);