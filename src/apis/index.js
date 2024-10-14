import { authorizedAxiosInstance } from "../utils/authorizedAxios";
import { API_ROOT } from "../utils/constants";

export const handleLogoutApi = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userInfo");
};

export const refreshTokenApi = async (accessToken, refreshToken) => {
  return await authorizedAxiosInstance.post(
    `${API_ROOT}/api/Identity/RenewToken`,
    {
      token: accessToken,
      refreshToken: refreshToken,
    }
  );
};
