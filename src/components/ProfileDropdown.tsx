
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "@/lib/utils/auth";
import { useAuth } from "@/contexts/AuthContext";
import { UserCircle, ShieldAlert, Shield, Users } from "lucide-react";
import { AdminLoginModal } from "./AdminLoginModal";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";

export function ProfileDropdown() {
  const { user, profile } = useAuth();
  const { userRoles, isAdmin } = useUserRole();
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'player':
        return 'default';
      case 'viewer':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
            <div className="relative">
              <Avatar className="h-10 w-10">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="rounded-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-poker-dark-green text-white">
                    {getInitials(profile?.username || profile?.full_name)}
                  </AvatarFallback>
                )}
              </Avatar>
              {isAdmin() && (
                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 z-10">
                  <ShieldAlert className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-background border shadow-lg z-50" align="end" forceMount>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile?.username || profile?.full_name || 'Usuário'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {userRoles.map(role => (
                  <Badge key={role} variant={getRoleBadgeVariant(role)}>
                    {role}
                  </Badge>
                ))}
                {userRoles.length === 0 && (
                  <span className="text-xs text-muted-foreground">Sem papéis atribuídos</span>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {isAdmin() && (
            <DropdownMenuItem asChild>
              <a href="/users" className="flex items-center cursor-pointer">
                <Users className="mr-2 h-4 w-4" />
                <span>Gerenciar Usuários</span>
              </a>
            </DropdownMenuItem>
          )}
          
          {!isAdmin() && (
            <DropdownMenuItem 
              className="cursor-pointer flex items-center"
              onClick={() => setAdminModalOpen(true)}
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              <span>Solicitar Acesso Admin</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="cursor-pointer flex items-center text-red-500"
            onClick={handleSignOut}
          >
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AdminLoginModal open={adminModalOpen} onOpenChange={setAdminModalOpen} />
    </>
  );
}
