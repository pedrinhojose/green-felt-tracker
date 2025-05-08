
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PlayerSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function PlayerSearch({ searchQuery, setSearchQuery }: PlayerSearchProps) {
  return (
    <div className="mb-6 relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar jogadores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>
    </div>
  );
}
