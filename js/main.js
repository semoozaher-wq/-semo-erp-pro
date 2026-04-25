import { initializeApp } from "https://gstatic.com";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://gstatic.com";
import { getDatabase, ref, set, get, child } from "https://gstatic.com";

// إعدادات مشروعك الجديد semo-erp-pro13
const firebaseConfig = {
  apiKey: "AIzaSyC2EVpNEG9XjcPeELUA8lkU0yI6H7I",
  authDomain: "://firebaseapp.com",
  databaseURL: "https://firebaseio.com",
  projectId: "semo-erp-pro13",
  storageBucket: "semo-erp-pro13.firebasestorage.app",
  messagingSenderId: "915256659491",
  appId: "1:915256659491:web:3726522d17c72477322"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ربط الدوال بالـ window عشان الأزرار تشوفها
window.toggle = () => {
    document.getElementById('login-box').classList.toggle('hidden');
    document.getElementById('signup-box').classList.toggle('hidden');
};

window.signup = async () => {
    const e = document.getElementById('s-e').value;
    const p = document.getElementById('s-p').value;
    const ph = document.getElementById('s-ph').value;

    if(!e || !p || !ph) return alert("يرجى ملء جميع الحقول");
    if(p.length < 8) return alert("كلمة المرور يجب أن تكون 8 أحرف على الأقل");

    try {
        await createUserWithEmailAndPassword(auth, e, p);
        await set(ref(db, 'users_map/' + ph), { email: e });
        alert("تم إنشاء الحساب بنجاح في المشروع الجديد!");
        window.location.href = "dashboard.html";
    } catch (err) { alert("خطأ: " + err.message); }
};

window.login = async () => {
    const id = document.getElementById('l-id').value;
    const p = document.getElementById('l-p').value;

    if(!id || !p) return alert("أدخل بياناتك");

    try {
        let email = id;
        if (!id.includes('@')) {
            const snapshot = await get(child(ref(db), `users_map/${id}`));
            if (snapshot.exists()) email = snapshot.val().email;
            else throw new Error("رقم الهاتف غير مسجل");
        }
        await signInWithEmailAndPassword(auth, email, p);
        window.location.href = "dashboard.html";
    } catch (err) { alert("فشل الدخول: " + err.message); }
};
