interface IImage {
  id: string;
  path: string;
}

interface IBooks {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  category: string;
  year: Date;
  copies: number;
  synopsis: string;
  coverUrl: IImage;
  embedding?: JSON;
  embeddingUpdateAt?: Date;
}

export type { IBooks };

interface IBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  category: string;
  year: Date;
  copies: number;
  synopsis: string;
  coverUrl: IImage;
  embedding?: JSON;
  embeddingUpdateAt?: Date;
}

export type { IBook };
