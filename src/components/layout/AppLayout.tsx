
import React from "react";
import PokerNav from "@/components/PokerNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <PokerNav />
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </>
  );
}
