import { LoanStatus } from '@/enums/loanStatus';
import { IBook } from './books';
import { IUser } from './users';

export interface ICreateLoanPayload {
  bookId: string;
  userId: string;
  dueDate: string;
  loanDate: string;
}

export interface Loan {
  id: string;
  userId: string;
  bookId: string;
  loanDate: Date;
  dueDate: Date;
  returnDate: null;
  status: LoanStatus;
}

export interface ILoans {
  id: string;
  userId: string;
  bookId: string;
  loanDate: Date;
  dueDate: Date;
  returnDate: null;
  status: LoanStatus;
  book: IBook;
  user: IUser;
}
