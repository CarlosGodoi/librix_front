'use client';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsersContext } from '@/context/userContext';
import { PROFILE } from '@/enums/profile';
import { STATUS } from '@/enums/userStatus';
import {
  profileStatusLabel,
  userSituationStatusLabel,
} from '@/utils/status/translatestatus';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  editUserSchema,
  UserFormSchema,
} from '../../usuarios/schema/userFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

export function Profile() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { editUser, user, getUserById } = useUsersContext();

  const form = useForm<UserFormSchema>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      profile: undefined,
      situation: undefined,
      password: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    getUserById().catch(() => {
      toast.error('Não foi possível carregar os dados do perfil.');
    });
  }, [getUserById]);

  useEffect(() => {
    if (user?.id) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile: user.profile,
        situation: user.situation,
      });
    }
  }, [user, form]);

  async function onSubmitForm(data: UserFormSchema) {
    try {
      setLoading(true);
      const result = await editUser(user?.id ?? '', data);

      if (result) {
        toast.success('Usuário atualizado com sucesso.');
        router.push('/livros');
      } else {
        toast.error('Não foi possível efetuar o cadastro.');
      }
    } catch (error) {
      toast.error('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Acesse seu cadastro e atualize se necessário.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmitForm)}
        className="space-y-5 rounded-xl border border-border bg-card p-6"
      >
        <Field>
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" {...register('name')} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="member-email">E-mail</Label>
            <Input id="member-email" type="email" {...register('email')} />
          </Field>

          <Field>
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" {...register('phone')} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="profile">Perfil</Label>
            <Controller
              name="profile"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="profile" className="w-full">
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PROFILE).map((profile) => (
                      <SelectItem key={profile} value={profile}>
                        {profileStatusLabel[profile]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field>
            <Label htmlFor="situation">Situação</Label>
            <Controller
              name="situation"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="situation" className="w-full">
                    <SelectValue placeholder="Selecione a situação" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(STATUS).map((status) => (
                      <SelectItem key={status} value={status}>
                        {userSituationStatusLabel[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>

        <div className="grid gap-4 pt-3 sm:grid-cols-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit">{loading ? 'Salvando...' : 'Salvar'}</Button>
        </div>
      </form>
    </div>
  );
}
