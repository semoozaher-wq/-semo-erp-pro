import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">الدفتر الذهبي</h1>
          <div className="flex gap-4">
            <a href={getLoginUrl()} className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
              تسجيل دخول
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white">
            نظام إدارة المبيعات والمخزون المتكامل
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            الدفتر الذهبي هو حل شامل لإدارة نقطة البيع والمخزون والعملاء والموردين مع تقارير متقدمة وإشعارات فورية
          </p>
          <div className="flex gap-4 justify-center">
            <a href={getLoginUrl()}>
              <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-lg">
                ابدأ الآن
              </Button>
            </a>
            <Button variant="outline" className="h-12 px-8 text-lg">
              اعرف المزيد
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-xl font-bold mb-2">نقطة البيع</h3>
            <p className="text-gray-600 dark:text-gray-400">
              نظام بيع متكامل مع دعم طرق دفع متعددة وطباعة فواتير QR
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2">إدارة المخزون</h3>
            <p className="text-gray-600 dark:text-gray-400">
              تتبع شامل للمخزون مع تنبيهات المخزون المنخفض وتقارير مفصلة
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">إدارة العملاء</h3>
            <p className="text-gray-600 dark:text-gray-400">
              تتبع العملاء والموردين والديون والتسديدات بسهولة
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">التقارير المتقدمة</h3>
            <p className="text-gray-600 dark:text-gray-400">
              تقارير شاملة مع رسوم بيانية وتصدير إلى Excel
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow">
            <div className="text-4xl mb-4">🔔</div>
            <h3 className="text-xl font-bold mb-2">إشعارات فورية</h3>
            <p className="text-gray-600 dark:text-gray-400">
              إشعارات تلقائية عند انخفاض المخزون أو مبيعات كبيرة
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow">
            <div className="text-4xl mb-4">🌙</div>
            <h3 className="text-xl font-bold mb-2">Dark Mode</h3>
            <p className="text-gray-600 dark:text-gray-400">
              واجهة مستخدم حديثة مع وضع Dark Mode كامل
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 dark:bg-blue-700 text-white rounded-lg p-12 text-center mt-20">
          <h3 className="text-3xl font-bold mb-4">ابدأ مع الدفتر الذهبي اليوم</h3>
          <p className="text-lg mb-8">لا تحتاج إلى بطاقة ائتمان. ابدأ مجاناً الآن</p>
          <a href={getLoginUrl()}>
            <Button className="bg-white text-blue-600 hover:bg-gray-100 h-12 px-8 text-lg">
              إنشاء حساب مجاني
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
