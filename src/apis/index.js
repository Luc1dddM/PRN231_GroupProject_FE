import { authorizedAxiosInstance } from "../utils/authorizedAxios";
import { API_GateWay } from "../utils/constants";

export const handleLogoutApi = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userInfo");
};

export const refreshTokenApi = async (accessToken, refreshToken) => {
  console.log("test")
  return await authorizedAxiosInstance.post(
    `${API_GateWay}"/gateway/Identity/RenewToken`,
    {
      token: accessToken,
      refreshToken: refreshToken,
    }
  );
};
