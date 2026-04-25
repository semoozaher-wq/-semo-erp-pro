// 1. استيراد مكتبات Firebase
import { initializeApp } from "https://gstatic.com";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://gstatic.com";
import { getDatabase, ref, set, get, child } from "https://gstatic.com";

// 2. إعدادات مشروعك الجديد (semo-erp-pro13) بناءً على صورتك الأخيرة
const firebaseConfig = {
  apiKey: "AIzaSyC2EVpNEG9XjcPeELUA8lkU0yI6H7I",
  authDomain: "://firebaseapp.com",
  databaseURL: "https://firebaseio.com",
  projectId: "semo-erp-pro13",
  storageBucket: "semo-erp-pro13.firebasestorage.app",
  messagingSenderId: "915256659491",
  appId: "1:915256659491:web:3726522d17c72477322"
};

// 3. تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// --- الدوال الخاصة بك بعد دمجها مع Firebase ---

// دالة التبديل (موجودة في كودك)
window.toggle = () => {
    const loginBox = document.getElementById('login-box');
    const signupBox = document.getElementById('signup-box');
    loginBox.classList.toggle('hidden');
    signupBox.classList.toggle('hidden');
};

// دالة إنشاء الحساب (مربوطة بـ Firebase)
window.signup = async () => {
    const email = document.getElementById('s-e').value;
    const phone = document.getElementById('s-ph').value;
    const password = document.getElementById('s-p').value;

    // شروط التحقق الخاصة بك
    if (!email || !phone || !password) return alert('يرجى ملء جميع الحقول');
    if (!email.includes('@')) return alert('البريد الإلكتروني غير صحيح');
    if (password.length < 8) return alert('كلمة المرور ضعيفة (أقل من 8 أحرف)');

    try {
        // إنشاء المستخدم في Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // ربط رقم الهاتف بالإيميل في قاعدة البيانات (Realtime Database)
        await set(ref(db, 'users_map/' + phone), { email: email });

        alert('تم إنشاء الحساب بنجاح في نظام SEMO ERP');
        window.location.href = "dashboard.html";
    } catch (error) {
        alert('خطأ في التسجيل: ' + error.message);
    }
};

// دالة تسجيل الدخول (مربوطة بـ Firebase)
window.login = async () => {
    const id = document.getElementById('l-id').value;
    const password = document.getElementById('l-p').value;

    if (!id || !password) return alert('يرجى إدخال البيانات');

    try {
        let emailToAuth = id;

        // إذا كان المدخل رقم هاتف (لا يحتوي على @)
        if (!id.includes('@')) {
            const snapshot = await get(child(ref(db), `users_map/${id}`));
            if (snapshot.exists()) {
                emailToAuth = snapshot.val().email;
            } else {
                throw new Error("رقم الهاتف هذا غير مسجل");
            }
        }

        // تنفيذ الدخول
        await signInWithEmailAndPassword(auth, emailToAuth, password);
        window.location.href = "dashboard.html";
    } catch (error) {
        alert('فشل الدخول: ' + error.message);
    }
};

// دالة الوضع الداكن (من كودك)
window.toggleMode = () => {
    document.body.classList.toggle('dark-mode');
};
