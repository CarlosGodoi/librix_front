export interface IBookRecommendation {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  category: string;
  year: string;
  copies: number;
  synopsis: string;
  coverUrl: string;
}

export interface IBookRecommendations {
  baseadoEm: string[];
  sugestoes: IBookRecommendation[];
  explicacao: string;
}
