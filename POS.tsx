import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Minus, Trash2, Printer, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface CartItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'check' | 'credit'>('cash');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [qrCode, setQrCode] = useState<string>('');

  const productsQuery = trpc.products.list.useQuery();
  const customersQuery = trpc.customers.list.useQuery();
  const createSaleMutation = trpc.sales.create.useMutation();
  const draftSaveMutation = trpc.draftInvoices.save.useMutation();

  // حساب الإجمالي
  const subtotal = cart.reduce((sum) => sum + (item => item.quantity * item.unitPrice - item.discount)(item), 0);
  const taxAmount = (subtotal * tax) / 100;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount + taxAmount;

  // إضافة منتج للسلة
  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.total = existingItem.quantity * existingItem.unitPrice - existingItem.discount;
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: parseFloat(product.sellingPrice),
        discount: 0,
        total: parseFloat(product.sellingPrice),
      });
    }
    setCart([...cart]);
  };

  // تحديث الكمية
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
    } else {
      cart[index].quantity = quantity;
      cart[index].total = quantity * cart[index].unitPrice - cart[index].discount;
      setCart([...cart]);
    }
  };

  // إزالة من السلة
  const removeFromCart = (index: number) => {
    cart.splice(index, 1);
    setCart([...cart]);
  };

  // حفظ مسودة الفاتورة تلقائياً كل 15 دقيقة
  useEffect(() => {
    const interval = setInterval(() => {
      if (cart.length > 0) {
        draftSaveMutation.mutate({
          customerId: customerId ? parseInt(customerId) : undefined,
          items: cart,
          subtotal: subtotal.toString(),
          discount: discountAmount.toString(),
          tax: taxAmount.toString(),
          total: total.toString(),
          paymentMethod,
          notes,
        });
      }
    }, 15 * 60 * 1000); // 15 دقيقة

    return () => clearInterval(interval);
  }, [cart, customerId, paymentMethod, notes, subtotal, discountAmount, taxAmount, total]);

  // إنشاء رمز QR
  const generateQRCode = async (invoiceNumber: string) => {
    const qrData = `Invoice:${invoiceNumber}|Total:${total}|Date:${new Date().toISOString()}`;
    const qrCodeUrl = await QRCode.toDataURL(qrData);
    setQrCode(qrCodeUrl);
    return qrCodeUrl;
  };

  // إتمام البيع
  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    const invoiceNumber = `INV-${Date.now()}`;
    try {
      await createSaleMutation.mutateAsync({
        customerId: customerId ? parseInt(customerId) : undefined,
        invoiceNumber,
        subtotal: subtotal.toString(),
        discount: discountAmount.toString(),
        tax: taxAmount.toString(),
        total: total.toString(),
        paymentMethod,
        paymentStatus: 'paid',
        items: cart,
        notes,
      });

      // توليد QR
      const qrUrl = await generateQRCode(invoiceNumber);

      toast.success('تم إتمام البيع بنجاح');
      
      // طباعة الفاتورة
      printInvoice(invoiceNumber, qrUrl);

      // تفريغ السلة
      setCart([]);
      setCustomerId('');
      setDiscount(0);
      setTax(0);
      setNotes('');
    } catch (error: any) {
      toast.error(error.message || 'فشل إتمام البيع');
    }
  };

  // طباعة الفاتورة
  const printInvoice = (invoiceNumber: string, qrUrl: string) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>فاتورة ${invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; }
            .invoice { padding: 20px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; }
            .items { margin: 20px 0; }
            .item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #ddd; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; padding: 10px 0; border-top: 2px solid #000; }
            .qr { text-align: center; margin: 20px 0; }
            .qr img { width: 150px; height: 150px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <h1>الدفتر الذهبي</h1>
              <p>فاتورة رقم: ${invoiceNumber}</p>
              <p>${new Date().toLocaleString('ar-SA')}</p>
            </div>
            
            <div class="items">
              ${cart.map((item) => `
                <div class="item">
                  <span>${item.name} (${item.quantity})</span>
                  <span>${(item.quantity * item.unitPrice).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>

            <div class="total">
              <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>الإجمالي:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div class="qr">
              <img src="${qrUrl}" alt="QR Code" />
            </div>

            <div class="footer">
              <p>شكراً لتعاملك معنا</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredProducts = productsQuery.data?.filter((p: any) =>
    p.name.includes(searchProduct) || p.code.includes(searchProduct)
  ) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* قائمة المنتجات */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>المنتجات</CardTitle>
            <CardDescription>ابحث وأضف المنتجات للسلة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="ابحث عن منتج..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
            />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProducts.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-3 border rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition"
                >
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.quantity} متوفر</p>
                  <p className="text-blue-600 font-bold">{parseFloat(product.sellingPrice).toFixed(2)}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* السلة والدفع */}
      <div className="space-y-4">
        {/* السلة */}
        <Card>
          <CardHeader>
            <CardTitle>السلة ({cart.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.unitPrice.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="p-1 hover:bg-red-200 dark:hover:bg-red-900 rounded ml-2"
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* خيارات الدفع */}
            <div className="space-y-3 border-t pt-3">
              <div>
                <label className="text-sm font-medium">العميل</label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر عميل (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    {customersQuery.data?.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">طريقة الدفع</label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقداً</SelectItem>
                    <SelectItem value="card">بطاقة</SelectItem>
                    <SelectItem value="check">شيك</SelectItem>
                    <SelectItem value="credit">آجل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">الخصم (%)</label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="text-sm font-medium">الضريبة (%)</label>
                <Input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="text-sm font-medium">ملاحظات</label>
                <Input
                  placeholder="ملاحظات إضافية..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الإجمالي والدفع */}
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between">
              <span>الإجمالي الفرعي:</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>الخصم:</span>
                <span>-{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>الضريبة:</span>
                <span>+{taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span>الإجمالي:</span>
              <span>{total.toFixed(2)}</span>
            </div>

            <Button
              onClick={completeSale}
              className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
              disabled={cart.length === 0}
            >
              <Printer className="mr-2 h-5 w-5" />
              إتمام البيع وطباعة
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
