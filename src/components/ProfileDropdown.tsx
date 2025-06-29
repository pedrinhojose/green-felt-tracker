
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { signOut } from "@/lib/utils/auth";
import { User, LogOut, Eye } from "lucide-react";

export function ProfileDropdown() {
  const { user, profile } = useAuth();
  const { isViewer } = useUserRole();
  
  if (!user) return null;

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.charAt(0).toUpperCase() || 'U';

  const displayName = profile?.full_name || user.email || 'Usuário';
  
  // Verificar se é usuário visitante
  const isGuestUser = user?.email === 'visitante@apapoker.com' || 
                      profile?.username === 'visitante';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="bg-poker-gold text-poker-black">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">
                {isGuestUser ? 'Visitante' : displayName}
              </p>
              {isGuestUser && (
                <Eye className="h-3 w-3 text-poker-gold" />
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {isGuestUser ? 'Acesso somente leitura' : user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!isGuestUser && (
          <>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isGuestUser ? 'Sair do modo visitante' : 'Sair'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
