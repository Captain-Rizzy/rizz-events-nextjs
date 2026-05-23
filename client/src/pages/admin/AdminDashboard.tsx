import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Menu, X } from "lucide-react";
import EventManagement from "./EventManagement";
import TicketPackagesManagement from "./TicketPackagesManagement";
import SponsorsManagement from "./SponsorsManagement";
import GalleryManagement from "./GalleryManagement";

type TabType = "event" | "packages" | "sponsors" | "gallery";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("event");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const meQuery = trpc.admin.me.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    if (meQuery.isError) {
      setLocation("/admin/login");
    }
  }, [meQuery.isError, setLocation]);

  const logoutMutation = trpc.admin.logout.useMutation({
    onSuccess: () => {
      toast.success("Logged out successfully");
      setLocation("/admin/login");
    },
  });

  useEffect(() => {
    if (meQuery.isLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [meQuery.isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-accent text-2xl font-bold mb-2">RIZZ</div>
          <p className="text-foreground/70">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "event", label: "Event Details" },
    { id: "packages", label: "Ticket Packages" },
    { id: "sponsors", label: "Sponsors" },
    { id: "gallery", label: "Gallery" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-accent/20 sticky top-0 z-40">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden text-accent hover:text-accent/80"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold text-accent">RIZZ Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-foreground/70 text-sm">
              {meQuery.data?.username}
            </span>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-accent/30 text-foreground hover:bg-accent/10"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } md:block w-full md:w-64 bg-card border-r border-accent/20 p-4 md:p-6`}
        >
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded transition-colors ${
                  activeTab === tab.id
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-foreground hover:bg-accent/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Decorative Line */}
          <div className="mt-8 h-px bg-gradient-to-r from-transparent via-accent to-transparent"></div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {activeTab === "event" && <EventManagement />}
          {activeTab === "packages" && <TicketPackagesManagement />}
          {activeTab === "sponsors" && <SponsorsManagement />}
          {activeTab === "gallery" && <GalleryManagement />}
        </main>
      </div>
    </div>
  );
}
