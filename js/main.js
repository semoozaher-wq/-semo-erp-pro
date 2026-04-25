import { initializeApp } from "https://gstatic.com";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://gstatic.com";
import { getDatabase, ref, set, get, child } from "https://gstatic.com";

const firebaseConfig = {
  apiKey: "AIzaSyC2EVpNEG9XjcPEelUA8lkIUcUceN6Oh0k",
  authDomain: "://firebaseapp.com",
  databaseURL: "https://firebaseio.com",
  projectId: "semo-erp-pro13",
  storageBucket: "semo-erp-pro13.firebasestorage.app",
  messagingSenderId: "915256659491",
  appId: "1:915256659491:web:3726522d17e9ea5c7c6b96"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

window.toggle = () => {
    document.getElementById('login-box').classList.toggle('hidden');
    document.getElementById('signup-box').classList.toggle('hidden');
};

window.signup = async () => {
    const e = document.getElementById('s-e').value, p = document.getElementById('s-p').value, ph = document.getElementById('s-ph').value;
    if(!e || !p || !ph) return alert("أكمل البيانات");
    try {
        await createUserWithEmailAndPassword(auth, e, p);
        await set(ref(db, 'users_map/' + ph), { email: e });
        alert("تم إنشاء حسابك بنجاح!");
        window.location.href = "dashboard.html";
    } catch (err) { alert(err.message); }
};

window.login = async () => {
    const id = document.getElementById('l-id').value, p = document.getElementById('l-p').value;
    if(!id || !p) return alert("أدخل البيانات");
    try {
        let email = id;
        if (!id.includes('@')) {
            const snapshot = await get(child(ref(db), `users_map/${id}`));
            if (snapshot.exists()) email = snapshot.val().email;
            else throw new Error("رقم الهاتف غير مسجل");
        }
        await signInWithEmailAndPassword(auth, email, p);
        window.location.href = "dashboard.html";
    } catch (err) { alert(err.message); }
};
