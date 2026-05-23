import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Trash2, Plus } from "lucide-react";

interface PackageForm {
  eventId: number;
  name: string;
  description: string;
  price: string;
  capacity: number;
  benefits: string[];
  installmentOptions: Array<{
    numberOfPayments: number;
    paymentAmount: number;
  }>;
}

export default function TicketPackagesManagement() {
  const [eventId] = useState(1);
  const [packages, setPackages] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PackageForm>({
    eventId,
    name: "",
    description: "",
    price: "",
    capacity: 0,
    benefits: [],
    installmentOptions: [],
  });
  const [benefitInput, setBenefitInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const packagesQuery = trpc.packages.list.useQuery(eventId);
  const createMutation = trpc.packages.create.useMutation({
    onSuccess: () => {
      toast.success("Package created successfully!");
      packagesQuery.refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create package");
    },
  });

  const updateMutation = trpc.packages.update.useMutation({
    onSuccess: () => {
      toast.success("Package updated successfully!");
      packagesQuery.refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update package");
    },
  });

  const deleteMutation = trpc.packages.delete.useMutation({
    onSuccess: () => {
      toast.success("Package deleted successfully!");
      packagesQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete package");
    },
  });

  useEffect(() => {
    if (packagesQuery.data) {
      setPackages(packagesQuery.data);
    }
  }, [packagesQuery.data]);

  const resetForm = () => {
    setFormData({
      eventId,
      name: "",
      description: "",
      price: "",
      capacity: 0,
      benefits: [],
      installmentOptions: [],
    });
    setEditingId(null);
    setBenefitInput("");
  };

  const handleAddBenefit = () => {
    if (benefitInput.trim()) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, benefitInput],
      });
      setBenefitInput("");
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          packageId: editingId,
          ...formData,
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (packageId: number) => {
    if (confirm("Are you sure you want to delete this package?")) {
      await deleteMutation.mutateAsync(packageId);
    }
  };

  if (packagesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8">
      <h2 className="text-3xl font-bold text-accent">Ticket Packages</h2>

      {/* Add/Edit Form */}
      <Card className="bg-card border-accent/30 p-8">
        <h3 className="text-xl font-semibold text-accent mb-6">
          {editingId ? "Edit Package" : "Create New Package"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Package Name
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., VIP Tier"
                className="bg-input border-accent/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Price
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                className="bg-input border-accent/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Capacity
            </label>
            <Input
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capacity: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Number of tickets available"
              className="bg-input border-accent/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Package description"
              className="bg-input border-accent/20 min-h-24"
            />
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Benefits
            </label>
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                placeholder="Add a benefit"
                className="bg-input border-accent/20"
              />
              <Button
                type="button"
                onClick={handleAddBenefit}
                className="bg-accent/20 text-accent hover:bg-accent/30"
              >
                <Plus size={18} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-accent/10 text-accent px-3 py-1 rounded flex items-center gap-2"
                >
                  {benefit}
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(index)}
                    className="hover:text-accent/70"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold py-2"
            >
              {isLoading ? "Saving..." : editingId ? "Update Package" : "Create Package"}
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

      {/* Packages List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-accent">Existing Packages</h3>
        {packages.length === 0 ? (
          <p className="text-foreground/70">No packages yet. Create one above.</p>
        ) : (
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className="bg-card border-accent/30 p-6 flex justify-between items-start"
              >
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-accent mb-2">
                    {pkg.name}
                  </h4>
                  <p className="text-foreground/70 text-sm mb-2">
                    {pkg.description}
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-accent font-semibold">
                      ${pkg.price}
                    </span>
                    <span className="text-foreground/70">
                      Capacity: {pkg.capacity}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setFormData({
                        eventId: pkg.eventId,
                        name: pkg.name,
                        description: pkg.description || "",
                        price: pkg.price.toString(),
                        capacity: pkg.capacity,
                        benefits: pkg.benefits || [],
                        installmentOptions: pkg.installmentOptions || [],
                      });
                      setEditingId(pkg.id);
                    }}
                    variant="outline"
                    size="sm"
                    className="border-accent/30 text-foreground hover:bg-accent/10"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(pkg.id)}
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
