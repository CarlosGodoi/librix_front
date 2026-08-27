import { apiFront } from '../api';

export const returnLoan = async (id: string) => {
  try {
    const response = await apiFront.patch(`/api/emprestimos/retorno/${id}`);

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
