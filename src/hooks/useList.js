import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { authorizedAxiosInstance } from "../utils/authorizedAxios";
import { API_GateWay } from "../utils/constants";

export function useItems(url, uniqueKey, pagination) {
  const [search] = useSearchParams({
    PageNumber: String(pagination.pageNumber),
    PageSize: String(pagination.pageSize),
  });

  const query = useQuery(
    [uniqueKey, search.toString()],
    () =>
      authorizedAxiosInstance
        .get(`${API_GateWay}${url}`, {
          params: search,
        })
        .then((res) => res.data),
    {
      staleTime: 120000,
      retry: false,
    }
  );

  return { ...query, refetch: query.refetch }; // Return refetch
}
