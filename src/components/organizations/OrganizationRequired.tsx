
import { useEffect, useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spade } from 'lucide-react';

interface OrganizationRequiredProps {
  children: React.ReactNode;
}

function CreateFirstOrganization() {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createOrganization } = useOrganization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await createOrganization(name.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Spade className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Bem-vindo ao Poker Manager</CardTitle>
          <CardDescription>
            Para começar, crie seu primeiro clube de poker.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="club-name">Nome do Clube</Label>
              <Input
                id="club-name"
                placeholder="Ex: Clube de Poker APA"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? 'Criando...' : 'Criar Clube'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function OrganizationRequired({ children }: OrganizationRequiredProps) {
  const { isLoading, organizations, currentOrganization } = useOrganization();
  const { user, isLoading: isAuthLoading } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log("OrganizationRequired: Debug info", {
      isLoading,
      isAuthLoading,
      user: user?.id || 'none',
      organizationsCount: organizations.length,
      currentOrganization: currentOrganization?.id || 'none'
    });
  }, [isLoading, isAuthLoading, user, organizations, currentOrganization]);

  // Show loading state
  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-poker-gold"></div>
      </div>
    );
  }

  // If no user, RequireAuth will handle the redirect
  if (!user) {
    return null;
  }

  // If user has no organizations, show creation screen
  if (organizations.length === 0) {
    return <CreateFirstOrganization />;
  }

  // If user has organizations but none is selected, show organization selection
  if (!currentOrganization) {
    // Auto-select the first organization if only one exists
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-poker-gold"></div>
      </div>
    );
  }

  // If organization is selected, render children
  return <>{children}</>;
}
