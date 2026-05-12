import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, TrendingUp, ShoppingCart, Package, Users, DollarSign, Bell } from 'lucide-react';
import { useNavigate } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
  });

  const salesQuery = trpc.sales.list.useQuery();
  const productsQuery = trpc.products.list.useQuery();
  const customersQuery = trpc.customers.list.useQuery();
  const notificationsQuery = trpc.notifications.list.useQuery();

  useEffect(() => {
    if (salesQuery.data && productsQuery.data && customersQuery.data) {
      const totalRevenue = salesQuery.data.reduce((sum: number, sale: any) => sum + parseFloat(sale.total || 0), 0);
      const lowStock = productsQuery.data.filter((p: any) => p.quantity < p.minQuantity).length;

      setStats({
        totalSales: salesQuery.data.length,
        totalRevenue,
        totalProducts: productsQuery.data.length,
        totalCustomers: customersQuery.data.length,
        lowStockProducts: lowStock,
      });
    }
  }, [salesQuery.data, productsQuery.data, customersQuery.data]);

  // بيانات الرسم البياني
  const chartData = [
    { name: 'السبت', sales: 2400, revenue: 2400 },
    { name: 'الأحد', sales: 3000, revenue: 1398 },
    { name: 'الاثنين', sales: 2000, revenue: 9800 },
    { name: 'الثلاثاء', sales: 2780, revenue: 3908 },
    { name: 'الأربعاء', sales: 1890, revenue: 4800 },
    { name: 'الخميس', sales: 2390, revenue: 3800 },
    { name: 'الجمعة', sales: 3490, revenue: 4300 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      {/* رأس الصفحة */}
      <div>
        <h1 className="text-3xl font-bold">مرحباً {user?.name}</h1>
        <p className="text-gray-500 dark:text-gray-400">لوحة التحكم الرئيسية</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-gray-500">عملية بيع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">ريال</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
            <Package className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-gray-500">منتج</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-gray-500">عميل</p>
          </CardContent>
        </Card>

        <Card className={stats.lowStockProducts > 0 ? 'border-red-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المخزون المنخفض</CardTitle>
            <AlertCircle className={`h-4 w-4 ${stats.lowStockProducts > 0 ? 'text-red-600' : 'text-gray-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.lowStockProducts > 0 ? 'text-red-600' : ''}`}>
              {stats.lowStockProducts}
            </div>
            <p className="text-xs text-gray-500">منتج</p>
          </CardContent>
        </Card>
      </div>

      {/* الإشعارات */}
      {notificationsQuery.data && notificationsQuery.data.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              الإشعارات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notificationsQuery.data.slice(0, 3).map((notif: any) => (
                <div key={notif.id} className="flex items-start gap-3 p-2 bg-white dark:bg-slate-800 rounded">
                  <AlertCircle className="h-4 w-4 mt-1 text-yellow-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-xs text-gray-500">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* رسم بياني للمبيعات والإيرادات */}
        <Card>
          <CardHeader>
            <CardTitle>المبيعات والإيرادات</CardTitle>
            <CardDescription>آخر 7 أيام</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#3b82f6" name="المبيعات" />
                <Bar dataKey="revenue" fill="#10b981" name="الإيرادات" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* رسم بياني للاتجاهات */}
        <Card>
          <CardHeader>
            <CardTitle>اتجاهات الإيرادات</CardTitle>
            <CardDescription>آخر 7 أيام</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" name="الإيرادات" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* الأزرار السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button
          onClick={() => navigate('/pos')}
          className="bg-blue-600 hover:bg-blue-700 h-12"
        >
          نقطة البيع
        </Button>
        <Button
          onClick={() => navigate('/inventory')}
          className="bg-green-600 hover:bg-green-700 h-12"
        >
          المخزون
        </Button>
        <Button
          onClick={() => navigate('/customers')}
          className="bg-purple-600 hover:bg-purple-700 h-12"
        >
          العملاء
        </Button>
        <Button
          onClick={() => navigate('/reports')}
          className="bg-orange-600 hover:bg-orange-700 h-12"
        >
          التقارير
        </Button>
      </div>
    </div>
  );
}
