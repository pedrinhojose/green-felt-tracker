import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if user arrived via reset link (will have access_token in URL)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) {
      // No token, check if user is already authenticated
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          toast({
            title: 'Link inválido',
            description: 'Use o link enviado para seu email para redefinir a senha.',
            variant: 'destructive',
          });
          navigate('/auth');
        }
      });
    }
  }, [navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter no mínimo 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'A confirmação de senha deve ser igual à nova senha.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: 'Senha alterada com sucesso!',
        description: 'Você será redirecionado para o dashboard.',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      toast({
        title: 'Erro ao alterar senha',
        description: error.message || 'Tente novamente mais tarde.',
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
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-poker-gold/10">
              <KeyRound className="h-8 w-8 text-poker-gold" />
            </div>
          </div>
          <CardTitle className={`font-bold bg-gradient-to-r from-poker-gold to-amber-300 bg-clip-text text-transparent ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Redefinir Senha
          </CardTitle>
          <CardDescription className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent className="mobile-card">
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="mobile-text">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`mobile-text pr-10 ${isMobile ? 'h-12' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="mobile-text">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Digite novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`mobile-text pr-10 ${isMobile ? 'h-12' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-poker-gold hover:bg-amber-500 mobile-button"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
            </Button>

            <Button 
              type="button"
              variant="ghost" 
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              Voltar para o login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
