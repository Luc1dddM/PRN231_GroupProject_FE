import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { authorizedAxiosInstance } from "../utils/authorizedAxios";
import { API_Email } from "../utils/constants";

export function useEmails(url, uniqueKey) {
  const [search] = useSearchParams();

  return useQuery(
    [uniqueKey, search.toString()],
    () =>
      authorizedAxiosInstance
        .get(`${API_Email}${url}`, {
          params: search,
        })
        .then((res) => res.data),
    {
      staleTime: 120000,
      retry: false,
    }
  );
}
