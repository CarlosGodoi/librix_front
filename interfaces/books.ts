export interface IImage {
  id: string;
  path: string;
}

export interface IBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  category: string;
  year: number;
  copies: number;
  synopsis: string;
  coverUrl?: IImage;
  embedding?: number[];
  embeddingUpdateAt?: Date;
}
export interface IRegisterBookPayload {
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  category: string;
  year: number;
  copies: number;
  synopsis: string;
}
export interface IUpdateBookPayload {
  copies: number;
  synopsis: string;
}

export interface BooksResponse {
  books: IBook[];
  total: number;
  totalPage: number;
}
