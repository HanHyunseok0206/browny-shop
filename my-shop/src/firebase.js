// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // ✨ 1. 이 줄 추가!  

const firebaseConfig = {
  apiKey: "AIzaSyC5VFG9lKzD1KLEPEfsg9R520ohAwyjtaA",
  authDomain: "my-shop-new-736b7.firebaseapp.com",
  projectId: "my-shop-new-736b7",
  storageBucket: "my-shop-new-736b7.firebasestorage.app",
  messagingSenderId: "222974951108",
  appId: "1:222974951108:web:bb223febf4892609c65391"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // DB 내보내기
export const auth = getAuth(app); // ✨ 2. 이 줄 추가! (인증 기능 내보내기)