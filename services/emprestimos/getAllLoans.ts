import { apiFront } from '../api';

export const getAllLoans = async (data?: {
  take: number;
  skip: number;
  search?: string;
}) => {
  try {
    const urlApi = '/api/emprestimos';

    const params = new URLSearchParams();

    if (data?.take !== undefined) {
      params.set('take', String(data.take));
    }

    if (data?.skip !== undefined) {
      params.set('skip', String(data.skip));
    }

    if (data?.search) {
      params.set('search', data.search);
    }

    const url = `${urlApi}?${params.toString()}`;

    const res = await apiFront.get(url);

    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
