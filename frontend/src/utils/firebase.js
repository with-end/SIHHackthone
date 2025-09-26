// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9NNxjDLJpafii9AK1irFy4fLdP_eor7k",
  authDomain: "modernblogapp-4d106.firebaseapp.com",
  projectId: "modernblogapp-4d106",
  storageBucket: "modernblogapp-4d106.firebasestorage.app",
  messagingSenderId: "12401058623",
  appId: "1:12401058623:web:1dc02a94b6cc558e9c298a",
  measurementId: "G-RHQP4DJ70Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app) ;

const provider = new GoogleAuthProvider() ;

export async function googleAuth(){
   try{
         let data = await signInWithPopup( auth , provider ) ;
         return data.user ;

   }catch(err){
         console.log(err) ;
   }
}