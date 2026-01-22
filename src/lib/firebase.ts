import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyC5eQx_1ghqx7F3Wq5z4P5S4y3RCeUuwko",
  authDomain: "bucket2026-marc35.firebaseapp.com",
  databaseURL: "https://bucket2026-marc35-default-rtdb.firebaseio.com",
  projectId: "bucket2026-marc35",
  storageBucket: "bucket2026-marc35.firebasestorage.app",
  messagingSenderId: "325591096405",
  appId: "1:325591096405:web:6c3797311f307b977108dc",
  measurementId: "G-75W8M7CQ6B",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getDatabase(app)

export default app
