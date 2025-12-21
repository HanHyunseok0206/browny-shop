// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ⚠️ 아까 메모장에 복사해둔 내용으로 바꿔치기 하세요!
const firebaseConfig = {
   apiKey: "AIzaSyC87dqdG2mbIOC-LnAPef9bg9V-Qv1zSD8",
  authDomain: "my-diary-app-fa3ca.firebaseapp.com",
  projectId: "my-diary-app-fa3ca",
  storageBucket: "my-diary-app-fa3ca.firebasestorage.app",
  messagingSenderId: "182896155452",
  appId: "1:182896155452:web:dffea2dcec798e76a59c39",
  measurementId: "G-GL4D26JQQD"
};

// 파이어베이스 시작!
const app = initializeApp(firebaseConfig);
// 데이터베이스(DB) 기능 꺼내오기
export const db = getFirestore(app);