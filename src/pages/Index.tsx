
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/auth");
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Poker Manager</h1>
        <p className="text-muted-foreground">Redirecionando...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-poker-gold mx-auto mt-4"></div>
      </div>
    </div>
  );
}
