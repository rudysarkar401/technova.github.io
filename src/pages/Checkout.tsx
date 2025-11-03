import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Smartphone, Building2, Banknote, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    bankName: '',
    walletType: '',
    address: '',
    city: '',
    zipCode: '',
  });

  if (!isAuthenticated) {
    navigate('/auth?redirect=/checkout');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing (DEMO ONLY)
    setTimeout(async () => {
      const orderId = `TN${Date.now()}`;
      const order = {
        id: orderId,
        items: [...items],
        total: totalPrice,
        date: new Date().toISOString(),
        status: 'completed',
        paymentMethod,
      };

      const orders = JSON.parse(localStorage.getItem('technova_orders') || '[]');
      orders.push(order);
      localStorage.setItem('technova_orders', JSON.stringify(orders));

      // Track purchases
      const storedUser = localStorage.getItem('technova_user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          const purchases = items.map((item) => ({
            user_id: user.id,
            product_id: item.id,
            interaction_type: 'purchase',
          }));
          
          await supabase.from('user_interactions').insert(purchases);
        } catch (error) {
          console.error('Error tracking purchases:', error);
        }
      }

      clearCart();
      toast.success(`Payment via ${getPaymentMethodName()} successful! (Demo)`);
      navigate('/orders');
    }, 2000);
  };

  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case 'card': return 'Card';
      case 'upi': return 'UPI';
      case 'netbanking': return 'Net Banking';
      case 'wallet': return 'Wallet';
      case 'cod': return 'Cash on Delivery';
      default: return 'Card';
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Checkout</h1>
          <Badge variant="outline" className="text-lg">Demo Mode</Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <span>Credit/Debit Card</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <span>UPI</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="netbanking" id="netbanking" />
                      <Label htmlFor="netbanking" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span>Net Banking</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="wallet" id="wallet" />
                      <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Wallet className="h-5 w-5 text-primary" />
                        <span>Wallet</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Banknote className="h-5 w-5 text-primary" />
                        <span>Cash on Delivery</span>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Payment Details
                  </span>
                  <Badge variant="secondary">Demo</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {paymentMethod === 'card' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number (Demo)</Label>
                        <Input
                          id="cardNumber"
                          placeholder="4111 1111 1111 1111"
                          value={formData.cardNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, cardNumber: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={formData.cardName}
                          onChange={(e) =>
                            setFormData({ ...formData, cardName: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="12/25"
                            value={formData.expiryDate}
                            onChange={(e) =>
                              setFormData({ ...formData, expiryDate: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            type="password"
                            maxLength={3}
                            value={formData.cvv}
                            onChange={(e) =>
                              setFormData({ ...formData, cvv: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="space-y-2">
                      <Label htmlFor="upiId">UPI ID (Demo)</Label>
                      <Input
                        id="upiId"
                        placeholder="username@paytm"
                        value={formData.upiId}
                        onChange={(e) =>
                          setFormData({ ...formData, upiId: e.target.value })
                        }
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter any UPI ID format for demo
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Select Bank (Demo)</Label>
                      <select
                        id="bankName"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.bankName}
                        onChange={(e) =>
                          setFormData({ ...formData, bankName: e.target.value })
                        }
                        required
                      >
                        <option value="">Choose Bank</option>
                        <option value="sbi">State Bank of India</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="pnb">Punjab National Bank</option>
                      </select>
                    </div>
                  )}

                  {paymentMethod === 'wallet' && (
                    <div className="space-y-2">
                      <Label htmlFor="walletType">Select Wallet (Demo)</Label>
                      <select
                        id="walletType"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={formData.walletType}
                        onChange={(e) =>
                          setFormData({ ...formData, walletType: e.target.value })
                        }
                        required
                      >
                        <option value="">Choose Wallet</option>
                        <option value="paytm">Paytm</option>
                        <option value="phonepe">PhonePe</option>
                        <option value="googlepay">Google Pay</option>
                        <option value="amazonpay">Amazon Pay</option>
                      </select>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm">
                        Pay with cash when your order is delivered. Please keep exact change handy.
                      </p>
                    </div>
                  )}

                  <div className="border-t border-border pt-4 mt-6">
                    <h3 className="font-semibold mb-4">Billing Address</h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          placeholder="123 Main St"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="New York"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData({ ...formData, city: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            placeholder="10001"
                            value={formData.zipCode}
                            onChange={(e) =>
                              setFormData({ ...formData, zipCode: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={processing}
                    className="w-full gradient-primary hover:opacity-90 transition-opacity glow-primary"
                    size="lg"
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    {processing 
                      ? 'Processing Payment...' 
                      : paymentMethod === 'cod' 
                        ? 'Place Order' 
                        : `Pay ₹${(totalPrice * 83).toFixed(2)}`
                    }
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    This is a demo payment system. No real transactions will occur.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-3 border-b border-border last:border-0">
                      <div className="w-16 h-16 rounded bg-muted p-1 flex items-center justify-center flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{item.title}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold">₹{(item.price * item.quantity * 83).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t border-border pt-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{(totalPrice * 83).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2">
                    <span>Total</span>
                    <span className="text-primary">₹{(totalPrice * 83).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
