import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { authorizedAxiosInstance } from "../utils/authorizedAxios";
import { API_ROOT } from "../utils/constants";

export function useItems(url, uniqueKey, pagination) {
  const [search] = useSearchParams({
    pageNumber: String(pagination.pageNumber),
    pageSize: String(pagination.pageSize),
  });

  return useQuery(
    [uniqueKey, search.toString()],
    () =>
      authorizedAxiosInstance
        .get(`${API_ROOT}${url}`, {
          params: search,
        })
        .then((res) => res.data),
    {
      staleTime: 120000,
      retry: false,
    }
  );
}
