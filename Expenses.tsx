import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function Expenses() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    paymentMethod: 'cash' as 'cash' | 'card' | 'check' | 'bank',
    notes: '',
  });

  const expensesQuery = trpc.expenses.list.useQuery();
  const createExpenseMutation = trpc.expenses.create.useMutation();
  const updateExpenseMutation = trpc.expenses.update.useMutation();
  const deleteExpenseMutation = trpc.expenses.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateExpenseMutation.mutateAsync({
          id: editingId,
          data: formData,
        });
        toast.success('تم تحديث المصروف بنجاح');
      } else {
        await createExpenseMutation.mutateAsync(formData);
        toast.success('تم إضافة المصروف بنجاح');
      }
      setFormData({
        category: '',
        description: '',
        amount: '',
        paymentMethod: 'cash',
        notes: '',
      });
      setEditingId(null);
      setIsOpen(false);
      expensesQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ');
    }
  };

  const handleEdit = (expense: any) => {
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || '',
    });
    setEditingId(expense.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل تريد حذف هذا المصروف؟')) {
      try {
        await deleteExpenseMutation.mutateAsync({ id });
        toast.success('تم حذف المصروف بنجاح');
        expensesQuery.refetch();
      } catch (error: any) {
        toast.error(error.message || 'فشل الحذف');
      }
    }
  };

  const totalExpenses = expensesQuery.data?.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount || 0), 0) || 0;

  const expensesByCategory = expensesQuery.data?.reduce((acc: any, exp: any) => {
    const category = exp.category;
    if (!acc[category]) acc[category] = 0;
    acc[category] += parseFloat(exp.amount || 0);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة المصاريف</h1>
          <p className="text-gray-500 dark:text-gray-400">تسجيل وتتبع المصاريف</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  category: '',
                  description: '',
                  amount: '',
                  paymentMethod: 'cash',
                  notes: '',
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              مصروف جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'تعديل المصروف' : 'إضافة مصروف جديد'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">الفئة</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="رواتب">رواتب</SelectItem>
                    <SelectItem value="إيجار">إيجار</SelectItem>
                    <SelectItem value="كهرباء">كهرباء</SelectItem>
                    <SelectItem value="ماء">ماء</SelectItem>
                    <SelectItem value="تأمين">تأمين</SelectItem>
                    <SelectItem value="صيانة">صيانة</SelectItem>
                    <SelectItem value="إعلان">إعلان</SelectItem>
                    <SelectItem value="أخرى">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">الوصف</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">المبلغ</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">طريقة الدفع</label>
                <Select value={formData.paymentMethod} onValueChange={(value: any) => setFormData({ ...formData, paymentMethod: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقداً</SelectItem>
                    <SelectItem value="card">بطاقة</SelectItem>
                    <SelectItem value="check">شيك</SelectItem>
                    <SelectItem value="bank">تحويل بنكي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">ملاحظات</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                {editingId ? 'تحديث' : 'إضافة'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ملخص المصاريف */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصاريف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-gray-500">ريال</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">عدد المصاريف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expensesQuery.data?.length || 0}</div>
            <p className="text-xs text-gray-500">مصروف</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">المتوسط</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expensesQuery.data && expensesQuery.data.length > 0
                ? (totalExpenses / expensesQuery.data.length).toFixed(2)
                : '0.00'}
            </div>
            <p className="text-xs text-gray-500">ريال</p>
          </CardContent>
        </Card>
      </div>

      {/* توزيع المصاريف حسب الفئة */}
      {Object.keys(expensesByCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>توزيع المصاريف حسب الفئة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(expensesByCategory).map(([category, amount]: [string, any]) => (
                <div key={category} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded">
                  <span className="font-medium">{category}</span>
                  <span className="text-red-600 font-bold">{parseFloat(amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* جدول المصاريف */}
      <Card>
        <CardHeader>
          <CardTitle>المصاريف</CardTitle>
          <CardDescription>قائمة جميع المصاريف</CardDescription>
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
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expensesQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : expensesQuery.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      لا توجد مصاريف
                    </TableCell>
                  </TableRow>
                ) : (
                  expensesQuery.data?.map((expense: any) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.category}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell className="text-red-600 font-bold">{parseFloat(expense.amount).toFixed(2)}</TableCell>
                      <TableCell>{expense.paymentMethod}</TableCell>
                      <TableCell>{new Date(expense.createdAt).toLocaleDateString('ar-SA')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(expense)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(expense.id)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
