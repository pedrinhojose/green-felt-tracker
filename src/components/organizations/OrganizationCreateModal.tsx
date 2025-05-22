
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
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
import { useOrganization } from '@/contexts/OrganizationContext';

const organizationSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }).max(50),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

interface OrganizationCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationCreateModal({ open, onOpenChange }: OrganizationCreateModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createOrganization } = useOrganization();

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(data: OrganizationFormValues) {
    setIsSubmitting(true);
    try {
      const result = await createOrganization(data.name);
      if (result) {
        form.reset();
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar nova organização</DialogTitle>
          <DialogDescription>
            Crie uma nova organização para gerenciar suas temporadas e jogos de poker.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da organização</FormLabel>
                  <FormControl>
                    <Input placeholder="Minha Liga de Poker" {...field} />
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
                {isSubmitting ? 'Criando...' : 'Criar organização'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
