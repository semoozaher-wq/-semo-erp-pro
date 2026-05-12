import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Download, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function Inventory() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
    quantity: 0,
    minQuantity: 10,
    purchasePrice: '',
    sellingPrice: '',
    barcode: '',
  });

  const productsQuery = trpc.products.list.useQuery();
  const createProductMutation = trpc.products.create.useMutation();
  const updateProductMutation = trpc.products.update.useMutation();
  const deleteProductMutation = trpc.products.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProductMutation.mutateAsync({
          id: editingId,
          data: formData,
        });
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await createProductMutation.mutateAsync(formData);
        toast.success('تم إضافة المنتج بنجاح');
      }
      setFormData({
        code: '',
        name: '',
        description: '',
        category: '',
        quantity: 0,
        minQuantity: 10,
        purchasePrice: '',
        sellingPrice: '',
        barcode: '',
      });
      setEditingId(null);
      setIsOpen(false);
      productsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ');
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      code: product.code,
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      quantity: product.quantity,
      minQuantity: product.minQuantity,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      barcode: product.barcode || '',
    });
    setEditingId(product.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('هل تريد حذف هذا المنتج؟')) {
      try {
        await deleteProductMutation.mutateAsync({ id });
        toast.success('تم حذف المنتج بنجاح');
        productsQuery.refetch();
      } catch (error: any) {
        toast.error(error.message || 'فشل الحذف');
      }
    }
  };

  const exportToExcel = () => {
    if (!productsQuery.data) return;

    const data = productsQuery.data.map((product: any) => ({
      'رمز المنتج': product.code,
      'اسم المنتج': product.name,
      'الفئة': product.category,
      'الكمية': product.quantity,
      'الحد الأدنى': product.minQuantity,
      'سعر الشراء': product.purchasePrice,
      'سعر البيع': product.sellingPrice,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المنتجات');
    XLSX.writeFile(workbook, `المخزون_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('تم تصدير البيانات بنجاح');
  };

  const lowStockProducts = productsQuery.data?.filter(
    (p: any) => p.quantity < p.minQuantity
  ) || [];

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة المخزون</h1>
          <p className="text-gray-500 dark:text-gray-400">إدارة المنتجات والمخزون</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            تصدير Excel
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    code: '',
                    name: '',
                    description: '',
                    category: '',
                    quantity: 0,
                    minQuantity: 10,
                    purchasePrice: '',
                    sellingPrice: '',
                    barcode: '',
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                منتج جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">رمز المنتج</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">اسم المنتج</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">الفئة</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">الكمية</label>
                    <Input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">الحد الأدنى</label>
                    <Input
                      type="number"
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">سعر الشراء</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">سعر البيع</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">الوصف</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  {editingId ? 'تحديث' : 'إضافة'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* تنبيهات المخزون المنخفض */}
      {lowStockProducts.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              تنبيهات المخزون المنخفض
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product: any) => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded">
                  <span>{product.name}</span>
                  <span className="text-red-600 font-bold">{product.quantity} / {product.minQuantity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* جدول المنتجات */}
      <Card>
        <CardHeader>
          <CardTitle>المنتجات</CardTitle>
          <CardDescription>إجمالي المنتجات: {productsQuery.data?.length || 0}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رمز المنتج</TableHead>
                  <TableHead>اسم المنتج</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>سعر البيع</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : productsQuery.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      لا توجد منتجات
                    </TableCell>
                  </TableRow>
                ) : (
                  productsQuery.data?.map((product: any) => (
                    <TableRow key={product.id} className={product.quantity < product.minQuantity ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                      <TableCell className="font-medium">{product.code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className={product.quantity < product.minQuantity ? 'text-red-600 font-bold' : ''}>
                        {product.quantity}
                      </TableCell>
                      <TableCell>{parseFloat(product.sellingPrice).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(product)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(product.id)}
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
