'use client';
import { apiFront } from '@/services/api';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { createContext, ReactNode, useContext } from 'react';

interface APIRequestOptions<T = unknown> {
  data?: T;
  params?: Record<string, string | number>;
  isUpload?: boolean;
}

interface IApiRequestContext {
  apiRequest: <T = unknown>(
    method: 'post' | 'get' | 'put' | 'patch' | 'delete',
    url: string,
    options?: APIRequestOptions<T>,
  ) => Promise<AxiosResponse<T>>;
}

const ApiRequestContext = createContext<IApiRequestContext>(
  {} as IApiRequestContext,
);

const ApiRequestProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const apiRequest = async <T = unknown,>(
    method: 'put' | 'post' | 'get' | 'delete' | 'patch',
    url: string,
    options?: APIRequestOptions<T>,
  ): Promise<AxiosResponse<T>> => {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': options?.isUpload
          ? 'multipart/form-data'
          : 'application/json',
      },
      params: options?.params,
    };

    const methodsWithBody = ['post', 'put', 'patch'];

    if (methodsWithBody.includes(method)) {
      const response = await apiFront[method as 'post' | 'put' | 'patch'](
        url,
        options?.data, // body vai como 2º argumento
        config, // config vai como 3º argumento
      );
      return response;
    }

    // get e delete: config como 2º argumento (pode incluir { data } pra delete com body, se precisar)
    const response = await apiFront[method as 'get' | 'delete'](url, config);
    return response;
  };

  return (
    <ApiRequestContext.Provider value={{ apiRequest }}>
      {children}
    </ApiRequestContext.Provider>
  );
};

function useRequest(): IApiRequestContext {
  return useContext(ApiRequestContext);
}

export { ApiRequestProvider, useRequest };
