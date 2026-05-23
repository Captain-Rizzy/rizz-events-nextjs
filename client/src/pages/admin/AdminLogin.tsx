import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: () => {
      toast.success("Login successful!");
      setLocation("/admin");
    },
    onError: (error) => {
      toast.error(error.message || "Login failed");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ username, password });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Art Deco Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-accent mb-2">RIZZ</h1>
          <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent mb-6"></div>
          <p className="text-foreground/70 text-lg">Admin Portal</p>
        </div>

        {/* Login Card */}
        <Card className="bg-card border-accent/30 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading}
                className="bg-input border-accent/20 text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                className="bg-input border-accent/20 text-foreground"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold py-2"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Decorative Bottom Line */}
          <div className="mt-8 h-px bg-gradient-to-r from-transparent via-accent to-transparent"></div>
        </Card>

        {/* Footer Text */}
        <p className="text-center text-foreground/50 text-sm mt-6">
          Secure admin access only
        </p>
      </div>
    </div>
  );
}
