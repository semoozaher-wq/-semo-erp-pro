// استيراد المكتبات من CDN (الإصدار العاشر v10)
import { initializeApp } from "https://gstatic.com";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://gstatic.com";
import { getDatabase, ref, set, get, child } from "https://gstatic.com";

// إعدادات Firebase الخاصة بك
const firebaseConfig = {
  apiKey: "AIzaSyCfVMHNoqbh86I0JJjnguGY6seA4vWJsSU",
  authDomain: "://firebaseapp.com",
  projectId: "my-pos-system-11dee",
  storageBucket: "my-pos-system-11dee.firebasestorage.app",
  messagingSenderId: "565195477080",
  appId: "1:565195477080:web:1ffa21a34e28b47dddfa2d",
  databaseURL: "https://firebaseio.com"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// دالة التبديل بين واجهة الدخول والتسجيل
window.toggle = () => {
    const loginBox = document.getElementById('login-box');
    const signupBox = document.getElementById('signup-box');
    loginBox.classList.toggle('hidden');
    signupBox.classList.toggle('hidden');
};

// دالة إنشاء حساب جديد (إيميل + هاتف)
window.signup = async () => {
    const email = document.getElementById('s-e').value;
    const password = document.getElementById('s-p').value;
    const phone = document.getElementById('s-ph').value;

    if (!email || !password || !phone) return alert("يرجى إكمال جميع البيانات");

    try {
        // إنشاء المستخدم في نظام المصادقة
        await createUserWithEmailAndPassword(auth, email, password);
        
        // ربط رقم الهاتف بالإيميل في قاعدة البيانات
        await set(ref(db, 'users_map/' + phone), { email: email });
        
        alert("تم إنشاء الحساب بنجاح!");
        window.location.href = "dashboard.html";
    } catch (error) {
        alert("خطأ في الإنشاء: " + error.message);
    }
};

// دالة تسجيل الدخول (بالإيميل أو رقم الهاتف)
window.login = async () => {
    const identifier = document.getElementById('l-id').value;
    const password = document.getElementById('l-p').value;

    if (!identifier || !password) return alert("يرجى إدخال البيانات");

    try {
        let emailToAuth = identifier;

        // إذا كان المدخل لا يحتوي على @ (يعني رقم هاتف)
        if (!identifier.includes('@')) {
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, `users_map/${identifier}`));
            
            if (snapshot.exists()) {
                emailToAuth = snapshot.val().email;
            } else {
                throw new Error("رقم الهاتف هذا غير مسجل لدينا");
            }
        }

        // تنفيذ عملية تسجيل الدخول
        await signInWithEmailAndPassword(auth, emailToAuth, password);
        window.location.href = "dashboard.html";
    } catch (error) {
        alert("فشل الدخول: " + error.message);
    }
};
