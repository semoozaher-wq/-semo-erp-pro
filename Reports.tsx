import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('month');

  const salesQuery = trpc.sales.list.useQuery();
  const customersQuery = trpc.customers.list.useQuery();
  const expensesQuery = trpc.expenses.list.useQuery();

  // حساب التقارير
  const calculateReports = () => {
    if (!salesQuery.data) return {};

    const totalSales = salesQuery.data.length;
    const totalRevenue = salesQuery.data.reduce((sum: number, sale: any) => sum + parseFloat(sale.total || 0), 0);
    const totalExpenses = expensesQuery.data?.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount || 0), 0) || 0;
    const profit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : 0;

    return {
      totalSales,
      totalRevenue,
      totalExpenses,
      profit,
      profitMargin,
    };
  };

  const reports = calculateReports();

  // بيانات الرسم البياني
  const chartData = [
    { name: 'السبت', sales: 12, revenue: 2400 },
    { name: 'الأحد', sales: 15, revenue: 3000 },
    { name: 'الاثنين', sales: 10, revenue: 2000 },
    { name: 'الثلاثاء', sales: 18, revenue: 2780 },
    { name: 'الأربعاء', sales: 14, revenue: 1890 },
    { name: 'الخميس', sales: 16, revenue: 2390 },
    { name: 'الجمعة', sales: 20, revenue: 3490 },
  ];

  const exportReport = () => {
    if (reportType === 'sales' && salesQuery.data) {
      const data = salesQuery.data.map((sale: any) => ({
        'رقم الفاتورة': sale.invoiceNumber,
        'الإجمالي': sale.total,
        'طريقة الدفع': sale.paymentMethod,
        'حالة الدفع': sale.paymentStatus,
        'التاريخ': new Date(sale.createdAt).toLocaleDateString('ar-SA'),
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'المبيعات');
      XLSX.writeFile(workbook, `تقرير_المبيعات_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('تم تصدير التقرير بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div>
        <h1 className="text-3xl font-bold">التقارير والإحصائيات</h1>
        <p className="text-gray-500 dark:text-gray-400">عرض التقارير المفصلة والإحصائيات</p>
      </div>

      {/* بطاقات الملخص */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.totalSales}</div>
            <p className="text-xs text-gray-500">عملية بيع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(reports.totalRevenue || 0).toFixed(2)}</div>
            <p className="text-xs text-gray-500">ريال</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المصاريف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{(reports.totalExpenses || 0).toFixed(2)}</div>
            <p className="text-xs text-gray-500">ريال</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">الأرباح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(reports.profit || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(reports.profit || 0).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">هامش: {reports.profitMargin}%</p>
          </CardContent>
        </Card>
      </div>

      {/* الرسم البياني */}
      <Card>
        <CardHeader>
          <CardTitle>اتجاهات المبيعات والإيرادات</CardTitle>
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
              <Bar dataKey="sales" fill="#3b82f6" name="عدد المبيعات" />
              <Bar dataKey="revenue" fill="#10b981" name="الإيرادات" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* خيارات التقارير */}
      <Card>
        <CardHeader>
          <CardTitle>التقارير التفصيلية</CardTitle>
          <CardDescription>اختر نوع التقرير والفترة الزمنية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">نوع التقرير</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">المبيعات</SelectItem>
                  <SelectItem value="customers">العملاء</SelectItem>
                  <SelectItem value="expenses">المصاريف</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">الفترة الزمنية</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">أسبوع</SelectItem>
                  <SelectItem value="month">شهر</SelectItem>
                  <SelectItem value="year">سنة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={exportReport}
                className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                تصدير Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول المبيعات */}
      {reportType === 'sales' && (
        <Card>
          <CardHeader>
            <CardTitle>سجل المبيعات</CardTitle>
            <CardDescription>آخر المبيعات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead>حالة الدفع</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : salesQuery.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        لا توجد مبيعات
                      </TableCell>
                    </TableRow>
                  ) : (
                    salesQuery.data?.slice(0, 10).map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.invoiceNumber}</TableCell>
                        <TableCell>{parseFloat(sale.total).toFixed(2)}</TableCell>
                        <TableCell>{sale.paymentMethod}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            sale.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            sale.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {sale.paymentStatus}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(sale.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* جدول العملاء */}
      {reportType === 'customers' && (
        <Card>
          <CardHeader>
            <CardTitle>تقرير العملاء</CardTitle>
            <CardDescription>الديون والتسديدات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>الديون</TableHead>
                    <TableHead>المدفوع</TableHead>
                    <TableHead>الرصيد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : customersQuery.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        لا توجد عملاء
                      </TableCell>
                    </TableRow>
                  ) : (
                    customersQuery.data?.map((customer: any) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell className="text-red-600">{parseFloat(customer.totalDebt).toFixed(2)}</TableCell>
                        <TableCell className="text-green-600">{parseFloat(customer.totalPaid).toFixed(2)}</TableCell>
                        <TableCell>
                          {(parseFloat(customer.totalDebt) - parseFloat(customer.totalPaid)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* جدول المصاريف */}
      {reportType === 'expenses' && (
        <Card>
          <CardHeader>
            <CardTitle>تقرير المصاريف</CardTitle>
            <CardDescription>تفاصيل المصاريف</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الفئة</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expensesQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : expensesQuery.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        لا توجد مصاريف
                      </TableCell>
                    </TableRow>
                  ) : (
                    expensesQuery.data?.map((expense: any) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.category}</TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="text-red-600">{parseFloat(expense.amount).toFixed(2)}</TableCell>
                        <TableCell>{expense.paymentMethod}</TableCell>
                        <TableCell>{new Date(expense.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
