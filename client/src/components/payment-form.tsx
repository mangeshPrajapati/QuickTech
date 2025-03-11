import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface PaymentFormProps {
  orderId: number;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function PaymentForm({ orderId, amount, onSuccess, onError }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    
    try {
      const response = await apiRequest('POST', '/api/payment/process', { 
        orderId, 
        paymentMethod 
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully.',
        });
        
        // Redirect to a success page or show success state
        setLocation(`/orders/${orderId}`);
        onSuccess?.();
      } else {
        throw new Error(data.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was an error processing your payment.',
        variant: 'destructive',
      });
      onError?.(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>Choose your preferred payment method</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="font-semibold text-lg">Amount to Pay: ₹{amount}</p>
        </div>
        
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
          <div className="flex items-center space-x-2 border p-3 rounded">
            <RadioGroupItem value="upi" id="upi" />
            <Label htmlFor="upi" className="flex-1">UPI</Label>
          </div>
          
          <div className="flex items-center space-x-2 border p-3 rounded">
            <RadioGroupItem value="netbanking" id="netbanking" />
            <Label htmlFor="netbanking" className="flex-1">Net Banking</Label>
          </div>
          
          <div className="flex items-center space-x-2 border p-3 rounded">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex-1">Credit/Debit Card</Label>
          </div>
          
          <div className="flex items-center space-x-2 border p-3 rounded">
            <RadioGroupItem value="wallet" id="wallet" />
            <Label htmlFor="wallet" className="flex-1">Digital Wallet</Label>
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleProcessPayment} 
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
      </CardFooter>
    </Card>
  );
}