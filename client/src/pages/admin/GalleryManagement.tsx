import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

interface GalleryForm {
  eventId: number;
  imageUrl: string;
  imageKey: string;
  caption?: string;
  displayOrder?: number;
}

export default function GalleryManagement() {
  const [eventId] = useState(1);
  const [images, setImages] = useState<any[]>([]);
  const [formData, setFormData] = useState<GalleryForm>({
    eventId,
    imageUrl: "",
    imageKey: "",
    caption: "",
    displayOrder: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const galleryQuery = trpc.gallery.list.useQuery(eventId);
  const createMutation = trpc.gallery.create.useMutation({
    onSuccess: () => {
      toast.success("Image added successfully!");
      galleryQuery.refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add image");
    },
  });

  const deleteMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success("Image deleted successfully!");
      galleryQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete image");
    },
  });

  useEffect(() => {
    if (galleryQuery.data) {
      setImages(galleryQuery.data);
    }
  }, [galleryQuery.data]);

  const resetForm = () => {
    setFormData({
      eventId,
      imageUrl: "",
      imageKey: "",
      caption: "",
      displayOrder: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createMutation.mutateAsync(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (confirm("Are you sure you want to delete this image?")) {
      await deleteMutation.mutateAsync(imageId);
    }
  };

  if (galleryQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-8">
      <h2 className="text-3xl font-bold text-accent">Gallery</h2>

      {/* Add Image Form */}
      <Card className="bg-card border-accent/30 p-8">
        <h3 className="text-xl font-semibold text-accent mb-6">Add New Image</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Image URL
            </label>
            <Input
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
              className="bg-input border-accent/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Image Key (Storage Reference)
            </label>
            <Input
              type="text"
              value={formData.imageKey}
              onChange={(e) =>
                setFormData({ ...formData, imageKey: e.target.value })
              }
              placeholder="gallery/image_key"
              className="bg-input border-accent/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Caption
            </label>
            <Textarea
              value={formData.caption || ""}
              onChange={(e) =>
                setFormData({ ...formData, caption: e.target.value })
              }
              placeholder="Image caption"
              className="bg-input border-accent/20 min-h-20"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold py-2"
          >
            {isLoading ? "Adding..." : "Add Image"}
          </Button>
        </form>
      </Card>

      {/* Gallery Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-accent">Gallery Images</h3>
        {images.length === 0 ? (
          <p className="text-foreground/70">No images yet. Add one above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <Card
                key={image.id}
                className="bg-card border-accent/30 overflow-hidden hover:border-accent/60 transition-colors"
              >
                <div className="aspect-video bg-accent/10 overflow-hidden">
                  <img
                    src={image.imageUrl}
                    alt={image.caption || "Gallery image"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  {image.caption && (
                    <p className="text-foreground/70 text-sm mb-4">
                      {image.caption}
                    </p>
                  )}
                  <Button
                    onClick={() => handleDelete(image.id)}
                    variant="outline"
                    size="sm"
                    className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
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
