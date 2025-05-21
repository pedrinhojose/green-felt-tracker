
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cleanupAuthState } from "@/lib/utils/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppRole } from "@/hooks/useUserRole";

const loginSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
});

const registerSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  confirmPassword: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
  username: z.string().min(3, { message: "Nome de usuário deve ter pelo menos 3 caracteres" }),
  role: z.enum(['player', 'viewer', 'admin']).default('player')
})
.refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
})
.refine(
  data => data.role !== 'admin' || data.password.includes('admin'),
  {
    message: "Para registrar como administrador, a senha deve conter a palavra 'admin'",
    path: ["password"],
  }
);

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("login");
  const [selectedRole, setSelectedRole] = useState<AppRole>('player');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      role: "player",
    },
  });
  
  // Handle login submission
  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      
      // Clean up existing auth state
      cleanupAuthState();
      
      // Try to do a global signout first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        console.log("Error during pre-sign in cleanup:", error);
      }
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (error) throw error;
      
      if (authData?.user) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        });
        
        const from = location.state?.from?.pathname || "/dashboard";
        window.location.href = from; // Force page reload
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para adicionar papel ao usuário
  const addRoleToUser = async (userId: string, role: AppRole) => {
    if (!userId) return;
    
    try {
      // Add the selected role to the user - fix the type issue by using explicit typing
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: selectedRole
        });
      
      if (error) throw error;
      
      console.log(`Papel ${role} adicionado ao usuário ${userId}`);
    } catch (error) {
      console.error("Erro ao adicionar papel:", error);
      throw error;
    }
  };
  
  // Handle register submission
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setSelectedRole(data.role);
      
      // Clean up existing auth state
      cleanupAuthState();
      
      // Try to do a global signout first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (error) {
        console.log("Error during pre-registration cleanup:", error);
      }
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            full_name: data.username, // Using username as full name for now
          }
        }
      });
      
      if (error) throw error;
      
      if (authData?.user) {
        try {
          // Adicionar papel ao usuário
          await addRoleToUser(authData.user.id, data.role);
          
          toast({
            title: "Registro realizado com sucesso!",
            description: `Você foi registrado como ${data.role}. Redirecionando para o dashboard...`,
          });
          
          // If email confirmation is required
          if (authData.session === null) {
            toast({
              title: "Confirmação de e-mail necessária",
              description: "Verifique seu e-mail para confirmar sua conta antes de fazer login.",
            });
            
            setActiveTab("login");
            registerForm.reset();
            return;
          }
          
          // Redirect to dashboard
          window.location.href = "/dashboard"; // Force page reload
        } catch (roleError) {
          console.error("Erro ao definir papel do usuário:", roleError);
          toast({
            title: "Aviso",
            description: "Conta criada, mas houve um problema ao definir seu papel. Faça login novamente.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Verifique os dados informados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-neutral-900 to-neutral-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center space-y-2 mb-6">
          <h1 className="text-3xl font-bold text-white">APA Poker Manager</h1>
          <p className="text-muted-foreground text-center">Faça login ou crie sua conta para gerenciar seus torneios de poker.</p>
        </div>
        
        <Card className="border-poker-dark-green">
          <CardHeader>
            <CardTitle className="text-center text-poker-gold">Acesso ao sistema</CardTitle>
            <CardDescription className="text-center">Informe seus dados para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Criar Conta</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-poker-gold hover:bg-poker-gold/80 text-black"
                      disabled={isLoading}
                    >
                      {isLoading ? "Autenticando..." : "Entrar"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome de Usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Papel no Sistema</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione seu papel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="player">Jogador</SelectItem>
                              <SelectItem value="viewer">Espectador</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          {registerForm.watch("role") === "admin" && (
                            <p className="text-xs text-amber-500 mt-1">
                              Para criar uma conta de administrador, a senha deve conter "admin".
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirme a Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="******" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-poker-gold hover:bg-poker-gold/80 text-black"
                      disabled={isLoading}
                    >
                      {isLoading ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          © {new Date().getFullYear()} APA Poker Manager. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
