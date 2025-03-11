import { useEffect, useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required env var: VITE_STRIPE_PUBLIC_KEY');
}

// Initialize Stripe
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  orderId: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function CheckoutForm({ orderId, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success`,
        },
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message,
          variant: "destructive",
        });
        onError?.(error);
      } else {
        toast({
          title: "Payment successful",
          description: "Thank you for your payment!",
        });
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full"
      >
        {isLoading ? "Processing..." : "Pay now"}
      </Button>
    </form>
  );
}

interface StripeCheckoutProps {
  orderId: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function StripeCheckout({ orderId, onSuccess, onError }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string>();
  const { toast } = useToast();

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    apiRequest("POST", "/api/payment/create-intent", { orderId })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        toast({
          title: "Error",
          description: "Could not initialize payment",
          variant: "destructive",
        });
        onError?.(error);
      });
  }, [orderId, onError, toast]);

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-sm">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm
          orderId={orderId}
          onSuccess={onSuccess}
          onError={onError}
        />
      </Elements>
    </div>
  );
}