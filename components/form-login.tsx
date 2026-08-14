'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '@/context/authContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';

const authBodySchema = z.object({
  email: z.string().min(1, 'email é obrigatório'),
  password: z.string().min(1, {
    message: 'Minímo 6 caracteres letras, números e caracteres especiais.',
  }),
});

type AuthBodySchema = z.infer<typeof authBodySchema>;

export function FormLogin() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuthContext();
  const router = useRouter();

  const form = useForm<AuthBodySchema>({
    resolver: zodResolver(authBodySchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  async function onSubmit(data: AuthBodySchema) {
    try {
      setLoading(true);
      const result = await signIn(data);

      if (result.status) {
        toast.success('Login realizado com sucesso.');
        router.push('/livros');
      } else {
        toast.error(
          result.message ||
            'Não foi possível entrar. Verifique suas credenciais.',
        );
      }
    } catch (error) {
      // aqui só cairia em erro de rede/inesperado que realmente escape do signIn
      toast.error('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 pb-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Entrar na conta
          </h2>
          <p className="text-sm text-muted-foreground">
            Use suas credenciais para acessar o painel.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Field className="space-y-2">
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="voce@biblioteca.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            <FieldDescription>{errors.email?.message}</FieldDescription>
          </Field>

          <Field className="space-y-2">
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>

            <div className="relative">
              <Input
                id="password"
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {show ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <FieldDescription>{errors.password?.message}</FieldDescription>
          </Field>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
