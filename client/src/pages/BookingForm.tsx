import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";

interface BookingFormProps {
  packageId: number;
  packageName: string;
  price: number;
  onSuccess?: (bookingCode: string) => void;
}

export default function BookingForm({
  packageId,
  packageName,
  price,
  onSuccess,
}: BookingFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    attendeeName: "",
    attendeeEmail: "",
    attendeePhone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState("");

  const createBookingMutation = trpc.bookings.create.useMutation({
    onSuccess: (data) => {
      setBookingCode(data.bookingCode);
      setBookingSuccess(true);
      toast.success("Booking created successfully!");
      if (onSuccess) {
        onSuccess(data.bookingCode);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create booking");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.attendeeName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!formData.attendeeEmail.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (quantity < 1) {
      toast.error("Please select at least 1 ticket");
      return;
    }

    setIsLoading(true);
    try {
      await createBookingMutation.mutateAsync({
        eventId: 1,
        packageId,
        quantity,
        attendeeName: formData.attendeeName,
        attendeeEmail: formData.attendeeEmail,
        attendeePhone: formData.attendeePhone,
        totalPrice: (price * quantity).toString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <Card className="card-luxury text-center py-12">
        <div className="flex justify-center mb-6">
          <CheckCircle className="text-green-400" size={48} />
        </div>
        <h3 className="text-2xl font-bold text-accent mb-4">
          Booking Confirmed!
        </h3>
        <p className="text-foreground/70 mb-6">
          Your booking code has been sent to {formData.attendeeEmail}
        </p>
        <div className="bg-accent/10 border border-accent/30 rounded p-4 mb-6">
          <p className="text-foreground/70 text-sm mb-2">Your Booking Code:</p>
          <p className="text-2xl font-bold text-accent">{bookingCode}</p>
        </div>
        <p className="text-foreground/70 text-sm mb-6">
          Use this code to check your booking status and download your tickets.
        </p>
        <Button
          onClick={() => {
            window.location.href = `/booking-lookup?code=${bookingCode}`;
          }}
          className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
        >
          View My Booking
        </Button>
      </Card>
    );
  }

  return (
    <Card className="card-luxury">
      <h3 className="text-2xl font-bold text-accent mb-6">
        Book {packageName}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Number of Tickets
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center bg-accent/10 hover:bg-accent/20 text-accent rounded transition-colors"
            >
              −
            </button>
            <span className="text-2xl font-bold text-accent w-12 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center bg-accent/10 hover:bg-accent/20 text-accent rounded transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Attendee Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Full Name
          </label>
          <Input
            type="text"
            value={formData.attendeeName}
            onChange={(e) =>
              setFormData({ ...formData, attendeeName: e.target.value })
            }
            placeholder="John Doe"
            className="bg-input border-accent/20"
            required
          />
        </div>

        {/* Attendee Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <Input
            type="email"
            value={formData.attendeeEmail}
            onChange={(e) =>
              setFormData({ ...formData, attendeeEmail: e.target.value })
            }
            placeholder="john@example.com"
            className="bg-input border-accent/20"
            required
          />
        </div>

        {/* Attendee Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Phone Number (Optional)
          </label>
          <Input
            type="tel"
            value={formData.attendeePhone}
            onChange={(e) =>
              setFormData({ ...formData, attendeePhone: e.target.value })
            }
            placeholder="+1 (555) 000-0000"
            className="bg-input border-accent/20"
          />
        </div>

        {/* Price Summary */}
          <div className="bg-accent/10 border border-accent/30 rounded p-4">
            <div className="flex justify-between mb-2">
              <span className="text-foreground/70">
                {quantity} ticket{quantity !== 1 ? "s" : ""} × ${price.toFixed(2)}
              </span>
              <span className="text-foreground font-semibold">
                ${(price * quantity).toFixed(2)}
              </span>
            </div>
          <div className="border-t border-accent/20 pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-foreground">Total:</span>
            <span className="text-xl font-bold text-accent">
              ${(price * quantity).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} />
              Processing...
            </>
          ) : (
            "Complete Booking"
          )}
        </Button>

        {/* Terms */}
        <p className="text-foreground/70 text-xs text-center">
          By booking, you agree to our terms and conditions. A confirmation
          email will be sent to {formData.attendeeEmail || "your email"}.
        </p>
      </form>
    </Card>
  );
}
