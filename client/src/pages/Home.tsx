import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, MapPin, Calendar, Phone, Mail, X } from "lucide-react";
import { Link } from "wouter";
import BookingForm from "./BookingForm";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);

  const eventQuery = trpc.event.get.useQuery(1);
  const packagesQuery = trpc.packages.list.useQuery(
    (eventQuery.data?.id || 1) as number,
    { enabled: !!eventQuery.data }
  );
  const sponsorsQuery = trpc.sponsors.list.useQuery(
    (eventQuery.data?.id || 1) as number,
    { enabled: !!eventQuery.data }
  );
  const galleryQuery = trpc.gallery.list.useQuery(
    (eventQuery.data?.id || 1) as number,
    { enabled: !!eventQuery.data }
  );

  useEffect(() => {
    if (!eventQuery.data?.date) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const eventDate = new Date(eventQuery.data!.date).getTime();
      const distance = eventDate - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / 1000 / 60) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [eventQuery.data?.date]);

  if (eventQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-accent mx-auto mb-4" size={32} />
          <p className="text-foreground/70">Loading event...</p>
        </div>
      </div>
    );
  }

  const event = eventQuery.data;
  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/70">No event configured yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="bg-card border-b border-accent/20 sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {event.logoUrl && (
              <img
                src={event.logoUrl}
                alt={event.name}
                className="h-12 w-auto"
              />
            )}
            <span className="text-xl font-bold text-accent">RIZZ</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#tickets" className="text-foreground/70 hover:text-accent transition-colors">
              Tickets
            </a>
            <a href="#gallery" className="text-foreground/70 hover:text-accent transition-colors">
              Gallery
            </a>
            <a href="#contact" className="text-foreground/70 hover:text-accent transition-colors">
              Contact
            </a>
            <Link href="/booking-lookup">
              <a className="text-foreground/70 hover:text-accent transition-colors">
                My Booking
              </a>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-deco relative overflow-hidden">
        <div className="container py-32 md:py-48 text-center">
          {/* Decorative Top Line */}
          <div className="mb-12 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>

          <h1 className="text-6xl md:text-8xl font-bold text-accent mb-4 tracking-tight">
            {event.name}
          </h1>

          {/* Decorative Bottom Line */}
          <div className="my-12 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16 text-lg">
            <div className="flex items-center gap-2">
              <Calendar className="text-accent" size={24} />
              <span>
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-accent" size={24} />
              <span>{event.venue}</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="grid grid-cols-4 gap-4 md:gap-8 mb-16 max-w-2xl mx-auto">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((item) => (
              <div
                key={item.label}
                className="card-luxury text-center py-6 md:py-8"
              >
                <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-foreground/70 text-sm uppercase tracking-wider">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <Link href="#tickets">
            <a>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8 py-3 text-lg">
                Get Tickets
              </Button>
            </a>
          </Link>
        </div>
      </section>

      {/* Event Description */}
      {event.description && (
        <section className="section-deco">
          <div className="container max-w-3xl">
            <p className="text-lg text-foreground/80 leading-relaxed">
              {event.description}
            </p>
          </div>
        </section>
      )}

      {/* Ticket Packages */}
      <section id="tickets" className="section-deco">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-accent mb-4">Ticket Packages</h2>
            <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent max-w-xs mx-auto"></div>
          </div>

          {packagesQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : packagesQuery.data && packagesQuery.data.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {packagesQuery.data.map((pkg) => (
                <Card
                  key={pkg.id}
                  className="card-luxury flex flex-col hover:border-accent/60 transition-colors"
                >
                  <h3 className="text-2xl font-bold text-accent mb-4">
                    {pkg.name}
                  </h3>
                  <div className="text-4xl font-bold text-accent mb-6">
                    ${pkg.price}
                  </div>
                  {pkg.description && (
                    <p className="text-foreground/70 text-sm mb-6">
                      {pkg.description}
                    </p>
                  )}
                  {pkg.benefits && pkg.benefits.length > 0 && (
                    <div className="mb-6 flex-1">
                      <p className="text-sm font-semibold text-accent mb-3">
                        Includes:
                      </p>
                      <ul className="space-y-2">
                        {pkg.benefits.map((benefit: string, idx: number) => (
                          <li
                            key={idx}
                            className="text-foreground/70 text-sm flex items-start gap-2"
                          >
                            <span className="text-accent mt-1">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button
                    onClick={() => setSelectedPackage(pkg)}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold mt-auto"
                  >
                    Book Now
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-foreground/70">
              No ticket packages available yet.
            </p>
          )}
        </div>
      </section>

      {/* Sponsors */}
      {sponsorsQuery.data && sponsorsQuery.data.length > 0 && (
        <section className="section-deco">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-accent mb-4">
                Our Partners
              </h2>
              <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent max-w-xs mx-auto"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {sponsorsQuery.data.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="flex items-center justify-center p-6 bg-card border border-accent/20 rounded hover:border-accent/60 transition-colors"
                >
                  {sponsor.logoUrl ? (
                    <img
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      className="max-h-20 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-foreground/70 font-semibold text-center">
                      {sponsor.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      <section id="gallery" className="section-deco">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-accent mb-4">Gallery</h2>
            <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent max-w-xs mx-auto"></div>
          </div>

          {galleryQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-accent" size={32} />
            </div>
          ) : galleryQuery.data && galleryQuery.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryQuery.data.map((image) => (
                <div
                  key={image.id}
                  className="aspect-video bg-card border border-accent/20 rounded overflow-hidden hover:border-accent/60 transition-colors"
                >
                  <img
                    src={image.imageUrl}
                    alt={image.caption || "Gallery image"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-foreground/70">
              Gallery coming soon.
            </p>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-deco">
        <div className="container max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-accent mb-4">Get In Touch</h2>
            <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent max-w-xs mx-auto"></div>
          </div>

          <div className="space-y-6">
            {event.contactEmail && (
              <div className="flex items-center gap-4">
                <Mail className="text-accent" size={24} />
                <a
                  href={`mailto:${event.contactEmail}`}
                  className="text-foreground hover:text-accent transition-colors"
                >
                  {event.contactEmail}
                </a>
              </div>
            )}
            {event.contactPhone && (
              <div className="flex items-center gap-4">
                <Phone className="text-accent" size={24} />
                <a
                  href={`tel:${event.contactPhone}`}
                  className="text-foreground hover:text-accent transition-colors"
                >
                  {event.contactPhone}
                </a>
              </div>
            )}
            {event.contactAddress && (
              <div className="flex items-start gap-4">
                <MapPin className="text-accent mt-1" size={24} />
                <p className="text-foreground">{event.contactAddress}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-accent/20 py-8">
        <div className="container text-center text-foreground/70 text-sm">
          <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent mb-6"></div>
          <p>&copy; 2026 Rizz Events. All rights reserved.</p>
        </div>
      </footer>

      {/* Booking Form Modal */}
      <Dialog open={!!selectedPackage} onOpenChange={(open) => !open && setSelectedPackage(null)}>
        <DialogContent className="max-w-md bg-card border-accent/30">
          <DialogHeader>
            <DialogTitle className="text-accent">Book Your Tickets</DialogTitle>
          </DialogHeader>
          {selectedPackage && (
            <BookingForm
              packageId={selectedPackage.id}
              packageName={selectedPackage.name}
              price={selectedPackage.price}
              onSuccess={() => {
                setSelectedPackage(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
