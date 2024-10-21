import { useQuery } from "react-query";
import { authorizedAxiosInstance } from "../utils/authorizedAxios";
import { API_ShoppingCart } from "../utils/constants";

export function useCartItem(userId, uniqueKey) {
    return useQuery(
        // unique key for caching
        [uniqueKey, userId],
        () => authorizedAxiosInstance
            .get(`${API_ShoppingCart}/cart/${userId}`)
            .then((res) => res.data.Response.Result), // Access the response data in BE
        {
            staleTime: 120000, // 2 minutes of stale time
            retry: false, // disable retry
            enabled: !!userId, // only run if userId is available
        }
    );
}