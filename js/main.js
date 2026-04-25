// دالة تبديل الوضع الفاتح/الداكن
function toggleMode() {
    document.body.classList.toggle('dark-mode');
    const modeButton = document.querySelector('.mode-toggle');
    if (document.body.classList.contains('dark-mode')) {
        modeButton.textContent = '🌞';
    } else {
        modeButton.textContent = '🌙';
    }
}

// دالة التبديل بين واجهة الدخول والحساب الجديد
function toggle() {
    const loginBox = document.getElementById('login-box');
    const signupBox = document.getElementById('signup-box');
    
    if (loginBox.classList.contains('hidden')) {
        loginBox.classList.remove('hidden');
        signupBox.classList.add('hidden');
    } else {
        loginBox.classList.add('hidden');
        signupBox.classList.remove('hidden');
    }
}

// دالة عرض/إخفاء كلمة السر
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = document.querySelector(`[onclick="togglePassword('${inputId}')"]`);
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

// دالة تسجيل الدخول
function login() {
    const id = document.getElementById('l-id').value;
    const password = document.getElementById('l-p').value;

    if (!id || !password) {
        alert('يرجى ملء جميع الحقول');
        return;
    }

    if (id.length < 8) {
        alert('يجب أن يكون الإيميل أو الهاتف مكوناً من 8 أرقام على الأقل');
        return;
    }

    // تحقق من تنسيق البريد الإلكتروني
    if (id.includes('@') && !id.includes('.')) {
        alert('البريد الإلكتروني غير صحيح');
        return;
    }

    // تحقق من رقم الهاتف (إن كان يبدأ بـ 09)
    if (id.length === 10 && id.startsWith('09')) {
        // رقم هاتف صحيح
    } else if (id.length === 11 && id.startsWith('09')) {
        // رقم هاتف صحيح
    } else if (id.length === 9 && !id.startsWith('0')) {
        // رقم هاتف صحيح بدون 0
    }

    console.log('جاري تسجيل الدخول ببيانات:', { id, password });
    alert('تم إرسال بيانات تسجيل الدخول (تحتاج لربطها بقاعدة البيانات)');
}

// دالة إنشاء حساب جديد
function signup() {
    const email = document.getElementById('s-e').value;
    const phone = document.getElementById('s-ph').value;
    const password = document.getElementById('s-p').value;

    if (!email || !phone || !password) {
        alert('يرجى ملء جميع الحقول');
        return;
    }

    // تحقق من صحة البريد الإلكتروني
    if (!email.includes('@') || !email.includes('.')) {
        alert('البريد الإلكتروني غير صحيح');
        return;
    }

    // تحقق من رقم الهاتف (8-10 أرقام)
    if (phone.length < 8 || phone.length > 10) {
        alert('رقم الهاتف يجب أن يتكون من 8-10 أرقام');
        return;
    }

    // تحقق من قوة كلمة المرور (8 أحرف على الأقل)
    if (password.length < 8) {
        alert('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
        return;
    }

    console.log('جاري إنشاء حساب ببيانات:', { email, phone, password });
    alert('تم إرسال طلب إنشاء حساب (تحتاج لربطه بقاعدة البيانات)');
}

// دالة نسيت كلمة المرور
function forgotPassword() {
    const id = document.getElementById('l-id').value;
    if (!id) {
        alert('يرجى إدخال الإيميل أو رقم الهاتف لاستعادة كلمة المرور');
        return;
    }

    if (id.includes('@')) {
        console.log('جاري إرسال رابط استعادة كلمة المرور إلى البريد الإلكتروني:', id);
        alert('تم إرسال رابط استعادة كلمة المرور إلى البريد الإلكتروني');
    } else {
        console.log('جاري إرسال رابط استعادة كلمة المرور إلى رقم الهاتف:', id);
        alert('تم إرسال رابط استعادة كلمة المرور إلى رقم الهاتف');
    }
}
