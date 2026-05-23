import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EventManagement() {
  const [formData, setFormData] = useState({
    eventId: 1,
    name: "",
    date: "",
    venue: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    brandColorPrimary: "#000000",
    brandColorSecondary: "#D4AF37",
    theme: "dark" as "dark" | "light",
  });

  const [isLoading, setIsLoading] = useState(false);

  const eventQuery = trpc.event.get.useQuery(1);
  const updateMutation = trpc.event.update.useMutation({
    onSuccess: () => {
      toast.success("Event updated successfully!");
      eventQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update event");
    },
  });

  useEffect(() => {
    if (eventQuery.data) {
      setFormData({
        eventId: eventQuery.data.id,
        name: eventQuery.data.name || "",
        date: eventQuery.data.date
          ? new Date(eventQuery.data.date).toISOString().split("T")[0]
          : "",
        venue: eventQuery.data.venue || "",
        description: eventQuery.data.description || "",
        contactEmail: eventQuery.data.contactEmail || "",
        contactPhone: eventQuery.data.contactPhone || "",
        contactAddress: eventQuery.data.contactAddress || "",
        brandColorPrimary: eventQuery.data.brandColorPrimary || "#000000",
        brandColorSecondary: eventQuery.data.brandColorSecondary || "#D4AF37",
        theme: eventQuery.data.theme || "dark",
      });
    }
  }, [eventQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateMutation.mutateAsync({
        eventId: formData.eventId,
        name: formData.name,
        date: new Date(formData.date),
        venue: formData.venue,
        description: formData.description,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        contactAddress: formData.contactAddress,
        brandColorPrimary: formData.brandColorPrimary,
        brandColorSecondary: formData.brandColorSecondary,
        theme: formData.theme,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (eventQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-3xl font-bold text-accent mb-8">Event Details</h2>

      <Card className="bg-card border-accent/30 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Event Name
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter event name"
              className="bg-input border-accent/20"
            />
          </div>

          {/* Date & Venue */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Event Date
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="bg-input border-accent/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Venue
              </label>
              <Input
                type="text"
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                placeholder="Enter venue"
                className="bg-input border-accent/20"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter event description"
              className="bg-input border-accent/20 min-h-32"
            />
          </div>

          {/* Contact Information */}
          <div className="border-t border-accent/20 pt-6">
            <h3 className="text-lg font-semibold text-accent mb-4">
              Contact Information
            </h3>
            <div className="space-y-4">
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) =>
                  setFormData({ ...formData, contactEmail: e.target.value })
                }
                placeholder="Contact email"
                className="bg-input border-accent/20"
              />
              <Input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) =>
                  setFormData({ ...formData, contactPhone: e.target.value })
                }
                placeholder="Contact phone"
                className="bg-input border-accent/20"
              />
              <Textarea
                value={formData.contactAddress}
                onChange={(e) =>
                  setFormData({ ...formData, contactAddress: e.target.value })
                }
                placeholder="Contact address"
                className="bg-input border-accent/20 min-h-24"
              />
            </div>
          </div>

          {/* Branding */}
          <div className="border-t border-accent/20 pt-6">
            <h3 className="text-lg font-semibold text-accent mb-4">Branding</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.brandColorPrimary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brandColorPrimary: e.target.value,
                      })
                    }
                    className="w-12 h-10 border border-accent/20 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.brandColorPrimary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brandColorPrimary: e.target.value,
                      })
                    }
                    className="bg-input border-accent/20 flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Secondary Color (Gold)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.brandColorSecondary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brandColorSecondary: e.target.value,
                      })
                    }
                    className="w-12 h-10 border border-accent/20 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.brandColorSecondary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brandColorSecondary: e.target.value,
                      })
                    }
                    className="bg-input border-accent/20 flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold py-2"
          >
            {isLoading ? "Saving..." : "Save Event Details"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
