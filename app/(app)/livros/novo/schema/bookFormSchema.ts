import z from 'zod';

export const bookFormSchema = z.object({
  title: z.string().min(1, { message: 'Titulo é obrigatório.' }),
  author: z.string().min(1, { message: 'Autor é obrigatório.' }),
  isbn: z.string().min(1, { message: 'ISBN é obrigatório.' }),
  category: z.string().min(1, { message: 'Categoria é obrigatório.' }),
  year: z.date(),
  copies: z.number().min(1, { message: 'Cópias é obrigatório.' }),
  publisher: z.string().min(1, { message: 'Editora é obrigatório.' }),
  synopsis: z.string().optional(),
  coverUrl: z.string().optional(),
});

export type BookFormSchema = z.infer<typeof bookFormSchema>;
