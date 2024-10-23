import axios from "axios";
import { toast } from "react-toastify";
import { handleLogoutApi, refreshTokenApi } from "../apis";
import { CustomBrowserRouter } from "./browerRouter";
import { QueryClient } from "react-query";

// eslint-disable-next-line react-hooks/rules-of-hooks

let authorizedAxiosInstance = axios.create();

authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10;
// authorizedAxiosInstance.defaults.withCredentials = true;

// Add a request interceptor
authorizedAxiosInstance.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

let refreshTokenPromise = null;

// Add a response interceptor
authorizedAxiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response?.status === 401) {
      handleLogoutApi();
      toast.error(error.response?.data?.detail || error?.message);
      CustomBrowserRouter.push("/login");
    }

    const originalRequest = error.config;
    if (error.response?.status === 410 && originalRequest) {
      if (!refreshTokenPromise) {
        console.log("rte")
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        refreshTokenPromise = refreshTokenApi(accessToken, refreshToken)
          .then((res) => {
            const { token, refreshToken } = res.data.result;
            localStorage.setItem("accessToken", token);
            localStorage.setItem("refreshToken", refreshToken);
            authorizedAxiosInstance.defaults.headers.Authorization = `Bearer ${token}`;
          })
          // eslint-disable-next-line no-unused-vars
          .catch((_error) => {
            print(_error)
            handleLogoutApi();
            // location.href = "/login";
          })
          .finally(() => {
            refreshTokenPromise = null;
          });
      }

      return refreshTokenPromise.then(() => {
        return authorizedAxiosInstance(originalRequest);
      });
    }

    if (error.response?.status !== 410)
      toast.error(error.response?.data?.detail || error?.message);

    return Promise.reject(error);
  }
);

const queryClient = new QueryClient();

export { authorizedAxiosInstance, queryClient };
