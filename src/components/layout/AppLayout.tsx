
import React from "react";
import { Outlet } from "react-router-dom";
import PokerNav from "@/components/PokerNav";

export default function AppLayout() {
  return (
    <>
      <PokerNav />
      <div className="container mx-auto px-4 py-6">
        <Outlet />
      </div>
    </>
  );
}
