import { authorizedAxiosInstance } from "../utils/authorizedAxios";
import { API_GateWay } from "../utils/constants";

export const handleLogoutApi = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userInfo");
};

export const refreshTokenApi = async (accessToken, refreshToken) => {
  return await authorizedAxiosInstance.post(
    `${API_GateWay}/api/Identity/RenewToken`,
    {
      token: accessToken,
      refreshToken: refreshToken,
    }
  );
};
