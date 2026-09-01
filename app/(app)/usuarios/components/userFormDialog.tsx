'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IUser } from '@/interfaces/users';
import { useUsersContext } from '@/context/userContext';
import { Controller, useForm } from 'react-hook-form';
import {
  createUserSchema,
  editUserSchema,
  UserFormSchema,
} from '../schema/userFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { PROFILE } from '@/enums/profile';
import { STATUS } from '@/enums/userStatus';
import {
  profileStatusLabel,
  userSituationStatusLabel,
} from '@/utils/status/translatestatus';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: IUser | null;
};

export function UserFormDialog({ open, onOpenChange, user }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { editUser, createUser } = useUsersContext();
  const isEdit = Boolean(user);

  const form = useForm<UserFormSchema>({
    resolver: zodResolver(isEdit ? editUserSchema : createUserSchema),
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
    if (open) {
      if (user) {
        form.reset({
          name: user?.name,
          email: user?.email,
          phone: user?.phone,
          profile: user?.profile,
          situation: user?.situation,
        });
      } else {
        form.reset({
          name: '',
          email: '',
          phone: '',
          profile: undefined,
          situation: undefined,
          password: '',
        });
      }
    }
  }, [open, user]);

  async function onSubmitForm(data: UserFormSchema) {
    try {
      setLoading(true);
      const result = isEdit
        ? await editUser(user?.id ?? '', data)
        : await createUser({ ...data, password: data.password ?? '' });

      if (result) {
        toast.success(
          isEdit
            ? 'Usuário atualizado com sucesso.'
            : 'Usuário criado com sucesso.',
        );
        onOpenChange(false);
        router.push('/usuarios');
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar usuário' : 'Cadastrar usuário'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Atualize os dados do leitor.'
              : 'Adicione um novo leitor à biblioteca.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex.: Maria Silva"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-email">E-mail</Label>
            <Input
              id="member-email"
              type="email"
              {...register('email')}
              placeholder="maria@email.com"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile">Perfil</Label>
              <Controller
                name="profile"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="profile">
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
            </div>
          </div>

          {isEdit ? (
            <div className="hidden"></div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                {...register('password')}
                placeholder="Ex.: Test@123"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="situation">Situação</Label>
            <Controller
              name="situation"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="status">
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
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {isEdit ? (
                <>{loading ? 'Salvando' : 'Salvar alterações'}</>
              ) : (
                <>{loading ? 'Cadastrando...' : 'Cadastrar'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
