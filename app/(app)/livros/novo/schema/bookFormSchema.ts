import z from 'zod';

export const bookFormSchema = z.object({
  title: z.string().min(1, { message: 'Titulo é obrigatório.' }),
  author: z.string().min(1, { message: 'Autor é obrigatório.' }),
  isbn: z.string().min(1, { message: 'ISBN é obrigatório.' }),
  category: z.string().min(1, { message: 'Categoria é obrigatório.' }),
  year: z.coerce.number().min(1, { message: 'Ano é obrigatório' }),
  copies: z.coerce.number().min(1, { message: 'Cópias é obrigatório.' }),
  publisher: z.string().min(1, { message: 'Editora é obrigatório.' }),
  synopsis: z.string(),
  coverUrl: z.string(),
});

export type BookFormInput = z.input<typeof bookFormSchema>;
export type BookFormOutput = z.output<typeof bookFormSchema>;
