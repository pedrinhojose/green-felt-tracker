
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/components/ui/use-toast';

// Senha de administrador para demonstração (em produção, isso deveria ser verificado no backend)
const ADMIN_PASSWORD = 'poker123';

const adminLoginSchema = z.object({
  adminPassword: z.string().min(1, { message: 'A senha é obrigatória' }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

interface AdminLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminLoginModal({ open, onOpenChange }: AdminLoginModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addRole } = useUserRole();
  const { toast } = useToast();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      adminPassword: '',
    },
  });

  const handleSubmit = async (data: AdminLoginFormValues) => {
    setIsSubmitting(true);
    try {
      if (data.adminPassword !== ADMIN_PASSWORD) {
        toast({
          title: 'Senha incorreta',
          description: 'A senha de administrador não é válida.',
          variant: 'destructive',
        });
        return;
      }

      const success = await addRole('admin');
      if (success) {
        onOpenChange(false);
        toast({
          title: 'Acesso concedido',
          description: 'Você agora tem acesso de administrador.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Acesso de administrador</DialogTitle>
          <DialogDescription>
            Digite a senha de administrador para obter acesso elevado ao sistema.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="adminPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha de administrador</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Verificando...' : 'Acessar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
