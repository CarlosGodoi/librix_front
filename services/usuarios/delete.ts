import { apiFront } from '../api';

export const deleteUser = async (id: string) => {
  const response = apiFront.delete(`/api/usuarios/delete/${id}`);

  return (await response).data;
};
