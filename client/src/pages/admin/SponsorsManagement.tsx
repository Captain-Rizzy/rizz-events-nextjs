import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

interface SponsorForm {
  eventId: number;
  name: string;
  logoUrl?: string;
  logoKey?: string;
  website?: string;
  displayOrder?: number;
}

export default function SponsorsManagement() {
  const [eventId] = useState(1);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<SponsorForm>({
    eventId,
    name: "",
    logoUrl: "",
    website: "",
    displayOrder: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const sponsorsQuery = trpc.sponsors.list.useQuery(eventId);
  const createMutation = trpc.sponsors.create.useMutation({
    onSuccess: () => {
      toast.success("Sponsor added successfully!");
      sponsorsQuery.refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add sponsor");
    },
  });

  const updateMutation = trpc.sponsors.update.useMutation({
    onSuccess: () => {
      toast.success("Sponsor updated successfully!");
      sponsorsQuery.refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update sponsor");
    },
  });

  const deleteMutation = trpc.sponsors.delete.useMutation({
    onSuccess: () => {
      toast.success("Sponsor deleted successfully!");
      sponsorsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete sponsor");
    },
  });

  useEffect(() => {
    if (sponsorsQuery.data) {
      setSponsors(sponsorsQuery.data);
    }
  }, [sponsorsQuery.data]);

  const resetForm = () => {
    setFormData({
      eventId,
      name: "",
      logoUrl: "",
      website: "",
      displayOrder: 0,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          sponsorId: editingId,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sponsorId: number) => {
    if (confirm("Are you sure you want to delete this sponsor?")) {
      await deleteMutation.mutateAsync(sponsorId);
    }
  };

  if (sponsorsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8">
      <h2 className="text-3xl font-bold text-accent">Sponsors & Partners</h2>

      {/* Add/Edit Form */}
      <Card className="bg-card border-accent/30 p-8">
        <h3 className="text-xl font-semibold text-accent mb-6">
          {editingId ? "Edit Sponsor" : "Add New Sponsor"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Sponsor Name
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Sponsor name"
                className="bg-input border-accent/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Website
              </label>
              <Input
                type="url"
                value={formData.website || ""}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://example.com"
                className="bg-input border-accent/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Logo URL
            </label>
            <Input
              type="url"
              value={formData.logoUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, logoUrl: e.target.value })
              }
              placeholder="https://example.com/logo.png"
              className="bg-input border-accent/20"
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold py-2"
            >
              {isLoading ? "Saving..." : editingId ? "Update Sponsor" : "Add Sponsor"}
            </Button>
            {editingId && (
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
                className="border-accent/30 text-foreground hover:bg-accent/10"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Sponsors List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-accent">Existing Sponsors</h3>
        {sponsors.length === 0 ? (
          <p className="text-foreground/70">No sponsors yet. Add one above.</p>
        ) : (
          <div className="grid gap-4">
            {sponsors.map((sponsor) => (
              <Card
                key={sponsor.id}
                className="bg-card border-accent/30 p-6 flex justify-between items-center"
              >
                <div className="flex items-center gap-4 flex-1">
                  {sponsor.logoUrl && (
                    <img
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      className="w-16 h-16 object-contain bg-accent/10 p-2 rounded"
                    />
                  )}
                  <div>
                    <h4 className="text-lg font-semibold text-accent">
                      {sponsor.name}
                    </h4>
                    {sponsor.website && (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent/70 hover:text-accent text-sm"
                      >
                        {sponsor.website}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setFormData({
                        eventId: sponsor.eventId,
                        name: sponsor.name,
                        logoUrl: sponsor.logoUrl || "",
                        website: sponsor.website || "",
                        displayOrder: sponsor.displayOrder || 0,
                      });
                      setEditingId(sponsor.id);
                    }}
                    variant="outline"
                    size="sm"
                    className="border-accent/30 text-foreground hover:bg-accent/10"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(sponsor.id)}
                    variant="outline"
                    size="sm"
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
