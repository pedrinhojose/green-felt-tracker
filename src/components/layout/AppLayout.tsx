
import { Outlet } from 'react-router-dom';
import PokerNav from '../PokerNav';
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AppLayout() {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col bg-poker-dark text-white">
      {/* Main Content */}
      <div className="flex-1">
        <PokerNav />
        <Outlet />
      </div>
    </div>
  );
}
