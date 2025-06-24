
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { cleanupAuthState } from '@/lib/utils/auth';
import { GuestAccessButton } from '@/components/auth/GuestAccessButton';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: 'Login realizado com sucesso',
          description: 'Bem-vindo de volta!',
        });
        
        window.location.href = from;
      }
    } catch (error: any) {
      toast({
        title: 'Erro no login',
        description: error.message || 'Credenciais inválidas. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: 'Conta criada com sucesso',
          description: 'Bem-vindo ao APA Poker!',
        });
        
        window.location.href = '/';
      }
    } catch (error: any) {
      toast({
        title: 'Erro no cadastro',
        description: error.message || 'Erro ao criar conta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-poker-black flex items-center justify-center w-full mobile-container">
      <Card className={`w-full bg-poker-navy border-poker-gold/20 shadow-mobile ${isMobile ? 'max-w-sm mx-auto' : 'max-w-md'}`}>
        <CardHeader className="text-center mobile-card">
          <CardTitle className={`font-bold bg-gradient-to-r from-poker-gold to-amber-300 bg-clip-text text-transparent ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            APA POKER
          </CardTitle>
          <CardDescription className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            Entre ou cadastre-se para continuar
          </CardDescription>
        </CardHeader>
        <CardContent className="mobile-card">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className={`grid w-full grid-cols-2 ${isMobile ? 'mb-4' : 'mb-6'}`}>
              <TabsTrigger value="signin" className="mobile-text">Entrar</TabsTrigger>
              <TabsTrigger value="signup" className="mobile-text">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="mobile-form-spacing">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="mobile-text">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`mobile-text ${isMobile ? 'h-12' : ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="mobile-text">Senha</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`mobile-text ${isMobile ? 'h-12' : ''}`}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-poker-gold hover:bg-amber-500 mobile-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="mobile-form-spacing">
                <div className="space-y-2">
                  <Label htmlFor="signup-fullname" className="mobile-text">Nome completo</Label>
                  <Input
                    id="signup-fullname"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className={`mobile-text ${isMobile ? 'h-12' : ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="mobile-text">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`mobile-text ${isMobile ? 'h-12' : ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="mobile-text">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`mobile-text ${isMobile ? 'h-12' : ''}`}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-poker-gold hover:bg-amber-500 mobile-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className={`border-t border-poker-gold/20 ${isMobile ? 'mt-4 pt-4' : 'mt-6 pt-6'}`}>
            <div className="text-center mb-3">
              <span className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>ou</span>
            </div>
            <GuestAccessButton />
            <p className={`text-muted-foreground text-center mt-2 ${isMobile ? 'text-xs' : 'text-xs'}`}>
              Acesso somente leitura para explorar o sistema
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
