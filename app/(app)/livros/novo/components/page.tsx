'use client';
import { Button } from '@/components/ui/button';
import { IBook } from '@/interfaces/books';
import { ArrowLeft, BookPlus, Loader2, Save, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
  BookFormInput,
  BookFormOutput,
  bookFormSchema,
} from '../schema/bookFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categories } from '@/utils/categories/categories';
import { Textarea } from '@/components/ui/textarea';
import { formatISBN } from '@/utils/formatISBN';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useBooksContext } from '@/context/BookContext';

type BookProps = { book?: IBook };

export default function BookForm({ book }: BookProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { editBook, createBook, uploadImage, removeBook, isLoading } =
    useBooksContext();
  const router = useRouter();
  const isEdit = Boolean(book);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<BookFormInput, unknown, BookFormOutput>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: book?.title ?? '',
      author: book?.author ?? '',
      isbn: book?.isbn ?? '',
      category: book?.category ?? '',
      year: book?.year ?? 0,
      copies: book?.copies ?? 0,
      publisher: book?.publisher ?? '',
      synopsis: book?.synopsis ?? '',
      coverUrl:
        typeof book?.coverUrl === 'string'
          ? book.coverUrl
          : (book?.coverUrl?.path ?? '/covers/placeholder.png'),
    },
  });

  const {
    register,
    setValue,
    handleSubmit,
    formState: {},
  } = form;

  useEffect(() => {
    if (book) {
      form.reset({
        title: book?.title,
        author: book?.author,
        isbn: book?.isbn,
        category: book?.category,
        year: book?.year,
        copies: book?.copies,
        publisher: book?.publisher,
        synopsis: book?.synopsis,
        coverUrl:
          typeof book?.coverUrl === 'string'
            ? book.coverUrl
            : (book?.coverUrl?.path ?? '/covers/placeholder.png'),
      });
    }
  }, [book, form]);

  function handleCoverClick() {
    if (isEdit && !uploadingImage) {
      fileInputRef.current?.click();
    }
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const image = e.target.files?.[0];
    e.target.value = '';

    if (!image || !book) return;

    const previewUrl = URL.createObjectURL(image);
    setValue('coverUrl', previewUrl);

    try {
      setUploadingImage(true);
      const updated = await uploadImage(book.id, image);

      const newCoverUrl =
        typeof updated.coverUrl === 'string'
          ? updated.coverUrl
          : (updated.coverUrl?.path ?? previewUrl);

      setValue('coverUrl', newCoverUrl);
      toast.success('Capa atualizada com sucesso.');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao envia a nova capa.');
      setValue(
        'coverUrl',
        typeof book.coverUrl === 'string'
          ? book.coverUrl
          : (book.coverUrl?.path ?? '/covers/placeholder.png'),
      );
    } finally {
      setUploadingImage(false);
      URL.revokeObjectURL(previewUrl);
    }
  }

  async function onSubmitForm(data: BookFormOutput) {
    try {
      setLoading(true);
      const result = isEdit
        ? await editBook(book?.id ?? '', data)
        : await createBook(data);

      if (result) {
        toast.success(
          isEdit
            ? 'Livro atualizado com sucesso.'
            : 'Livro cadastrado com sucesso.',
        );
        router.push('/livros');
      } else {
        toast.error('Não foi possível efetuar o cadastro.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteBook = async (id: string) => {
    if (!book || book.id !== id) {
      toast.error('Livro não encontrado.');
      return;
    }

    try {
      await removeBook(id);
      toast.success('Livro excluído com sucesso.');
      router.push('/livros');
    } catch {
      toast.error('Erro ao excluir livro. Tente novamente.');
    }
  };

  const coverUrl = useWatch({ control: form.control, name: 'coverUrl' });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Voltar"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-5" />
        </Button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEdit ? 'Editar livro' : 'Cadastrar livro'}
          </h1>
          <p className=" text-sm text-muted-foreground">
            {isEdit
              ? 'Atualize as informações do exemplar'
              : 'Adicione um novo título ao acervo da biblioteca'}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmitForm)}
        className="space-y-6 rounded-xl border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`relative aspect-3/4 w-32 overflow-hidden rounded-lg border border-border bg-muted ${
                isEdit ? 'cursor-pointer' : ''
              }`}
              onClick={handleCoverClick}
              role={isEdit ? 'button' : undefined}
              aria-label={isEdit ? 'Alterar capa do livro' : undefined}
            >
              <Image
                src={coverUrl || '/covers/placeholder.png'}
                alt="Pré-visualização da capa"
                fill
                className="object-cover"
                sizes="128px"
              />
              {isEdit && uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="size-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {isEdit ? 'Clique para alterar a capa' : 'Pré-visualização'}
            </p>
            {isEdit && (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            )}
          </div>

          <div className="flex-1 space-y-4">
            <Field className="space-y-2">
              <FieldLabel htmlFor="title">Título</FieldLabel>
              <Input
                id="title"
                {...register('title')}
                placeholder="Ex.: Dom Casmurro"
                disabled={isEdit}
              />
            </Field>
            <Field className="space-y-2">
              <FieldLabel htmlFor="author">Autor</FieldLabel>
              <Input
                id="author"
                {...register('author')}
                placeholder="Ex.: Machado de Assis"
                disabled={isEdit}
              />
            </Field>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="space-y-2">
            <FieldLabel htmlFor="isbn">ISBN</FieldLabel>
            <Input
              id="isbn"
              placeholder="123-45-67890-12-3"
              {...register('isbn')}
              onChange={(e) => {
                const formatted = formatISBN(e.target.value);

                e.target.value = formatted;

                setValue('isbn', formatted);
              }}
              disabled={isEdit}
            />
          </Field>
          <Field className="space-y-2">
            <FieldLabel htmlFor="publisher">Editora</FieldLabel>
            <Input
              id="publisher"
              {...register('publisher')}
              placeholder="Ex.: Companhia das Letras"
              disabled={isEdit}
            />
          </Field>
          <Field className="space-y-2">
            <FieldLabel htmlFor="category">Categoria</FieldLabel>
            <Controller
              name="category"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              disabled={isEdit}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field className="space-y-2">
              <FieldLabel htmlFor="year">Ano</FieldLabel>
              <Input
                id="year"
                type="number"
                min={1}
                {...register('year')}
                disabled={isEdit}
              />
            </Field>
            <Field className="space-y-2">
              <FieldLabel htmlFor="copies">Exemplares</FieldLabel>
              <Input
                id="copies"
                type="number"
                min={1}
                {...register('copies')}
              />
            </Field>
          </div>
        </div>

        <Field className="space-y-2">
          <FieldLabel htmlFor="synopsis">Sinopse</FieldLabel>
          <Textarea
            id="synopsis"
            rows={4}
            {...register('synopsis')}
            placeholder="Breve descrição do livro..."
          />
        </Field>

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          {isEdit ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleDeleteBook(book?.id ?? '')}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={isLoading}
            >
              <Trash2 className="size-4" />
              Excluir livro
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/livros')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {isEdit ? (
                <>
                  <Save className="size-4" />
                  {loading ? 'Salvando...' : 'Salvar alterações'}
                </>
              ) : (
                <>
                  <BookPlus className="size-4" />
                  {loading ? 'Cadastrando...' : 'Cadastrar livro'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
