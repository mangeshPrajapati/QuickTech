import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OrderSuccessPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Show a success toast when the page loads
    toast({
      title: 'Payment successful',
      description: 'Thank you for your order!',
    });
  }, [toast]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto p-6 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Thank You!</h1>
        <p className="text-muted-foreground mb-6">
          Your order has been successfully processed. You will receive updates about your order status via email.
        </p>
        <div className="space-x-4">
          <Button onClick={() => setLocation('/orders')} variant="outline">
            View Orders
          </Button>
          <Button onClick={() => setLocation('/')}>
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}