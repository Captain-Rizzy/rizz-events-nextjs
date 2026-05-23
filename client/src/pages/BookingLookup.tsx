import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, Clock, Download } from "lucide-react";
import { Link } from "wouter";

export default function BookingLookup() {
  const [bookingCode, setBookingCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchedBooking, setSearchedBooking] = useState<any | null>(null);

  const bookingQuery = trpc.bookings.getByCode.useQuery(bookingCode, {
    enabled: false,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode.trim()) {
      toast.error("Please enter a booking code");
      return;
    }

    setIsSearching(true);
    try {
      const result = await bookingQuery.refetch();
      if (result.data) {
        setSearchedBooking(result.data);
      } else {
        toast.error("Booking not found");
        setSearchedBooking(null);
      }
    } catch (error) {
      toast.error("Error searching for booking");
      setSearchedBooking(null);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400";
      case "partial":
        return "text-yellow-400";
      default:
        return "text-orange-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={24} />;
      default:
        return <Clock size={24} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-accent/20 sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-accent hover:text-accent/80">
            RIZZ
          </a>
          <a href="/" className="text-foreground/70 hover:text-accent transition-colors">
            Back to Event
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="section-deco">
        <div className="container max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-accent mb-4">
              Check Your Booking
            </h1>
            <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent max-w-xs mx-auto"></div>
          </div>

          {/* Search Form */}
          <Card className="card-luxury mb-12">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Booking Code
                </label>
                <Input
                  type="text"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                  placeholder="e.g., ABC123-XYZ789"
                  className="bg-input border-accent/20 uppercase"
                />
              </div>
              <Button
                type="submit"
                disabled={isSearching}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold py-2"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </form>
          </Card>

          {/* Booking Details */}
          {searchedBooking && (
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="card-luxury">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-accent">
                    Booking Details
                  </h2>
                  <div className={`flex items-center gap-2 ${getStatusColor(searchedBooking.paymentStatus)}`}>
                    {getStatusIcon(searchedBooking.paymentStatus)}
                    <span className="font-semibold capitalize">
                      {searchedBooking.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 border-t border-accent/20 pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-foreground/70 text-sm">Booking Code</p>
                      <p className="text-lg font-semibold text-accent">
                        {searchedBooking.bookingCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground/70 text-sm">Attendee Name</p>
                      <p className="text-lg font-semibold text-foreground">
                        {searchedBooking.attendeeName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-foreground/70 text-sm">Email</p>
                      <p className="text-sm text-foreground">
                        {searchedBooking.attendeeEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground/70 text-sm">Quantity</p>
                      <p className="text-lg font-semibold text-accent">
                        {searchedBooking.quantity} ticket(s)
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-foreground/70 text-sm">Total Price</p>
                    <p className="text-3xl font-bold text-accent">
                      ${searchedBooking.totalPrice}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Payment Status */}
              <Card className="card-luxury">
                <h3 className="text-xl font-bold text-accent mb-6">
                  Payment Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Payment Status</span>
                    <span
                      className={`font-semibold capitalize ${getStatusColor(
                        searchedBooking.paymentStatus
                      )}`}
                    >
                      {searchedBooking.paymentStatus}
                    </span>
                  </div>

                  {searchedBooking.paymentStatus === "completed" && (
                    <div className="bg-green-400/10 border border-green-400/30 rounded p-4">
                      <p className="text-green-400 text-sm">
                        ✓ Payment received. Your tickets are ready for download.
                      </p>
                    </div>
                  )}

                  {searchedBooking.paymentStatus === "pending" && (
                    <div className="bg-orange-400/10 border border-orange-400/30 rounded p-4">
                      <p className="text-orange-400 text-sm">
                        ⏳ Payment pending. Complete your payment to receive tickets.
                      </p>
                    </div>
                  )}

                  {searchedBooking.paymentStatus === "partial" && (
                    <div className="bg-yellow-400/10 border border-yellow-400/30 rounded p-4">
                      <p className="text-yellow-400 text-sm">
                        ⚠ Partial payment received. Additional payment required.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Download Tickets */}
              {searchedBooking.paymentStatus === "completed" &&
                searchedBooking.ticketUrl && (
                  <Card className="card-luxury">
                    <h3 className="text-xl font-bold text-accent mb-6">
                      Download Tickets
                    </h3>
                    <Button
                      onClick={() => {
                        window.open(searchedBooking.ticketUrl, "_blank");
                      }}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold py-3 flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Download Your Tickets
                    </Button>
                  </Card>
                )}

              {/* Installment Plan */}
              {searchedBooking.installmentPlan && (
                <Card className="card-luxury">
                  <h3 className="text-xl font-bold text-accent mb-6">
                    Installment Plan
                  </h3>
                  <div className="space-y-3">
                    {searchedBooking.installmentPlan.payments?.map(
                      (payment: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-accent/10 rounded"
                        >
                          <div>
                            <p className="text-foreground font-semibold">
                              Payment {idx + 1}
                            </p>
                            <p className="text-foreground/70 text-sm">
                              Due:{" "}
                              {new Date(payment.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-accent font-bold">
                              ${payment.amount}
                            </p>
                            <p
                              className={`text-xs ${
                                payment.status === "completed"
                                  ? "text-green-400"
                                  : "text-orange-400"
                              }`}
                            >
                              {payment.status === "completed"
                                ? "✓ Paid"
                                : "Pending"}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </Card>
              )}

              {/* Contact Support */}
              <Card className="card-luxury text-center">
                <p className="text-foreground/70 mb-4">
                  Having trouble with your booking?
                </p>
                <Button
                  onClick={() => {
                    window.location.href = "mailto:support@rizzevents.com";
                  }}
                  variant="outline"
                  className="border-accent/30 text-foreground hover:bg-accent/10"
                >
                  Contact Support
                </Button>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!searchedBooking && bookingCode && !isSearching && (
            <Card className="card-luxury text-center">
              <p className="text-foreground/70">
                No booking found with code "{bookingCode}". Please check and try
                again.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-accent/20 py-8">
        <div className="container text-center text-foreground/70 text-sm">
          <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent mb-6"></div>
          <p>&copy; 2026 Rizz Events. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
