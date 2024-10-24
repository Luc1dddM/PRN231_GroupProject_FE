// Author: TrungQuanDev: https://youtube.com/@trungquandev
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { API_GateWay } from "../utils/constants";
import { authorizedAxiosInstance } from "../utils/authorizedAxios";
function Dashboard() {
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("userInfo")).id;
    if(userId){
      setLoading(true);
      const fetchData = async () => {
        const res = await authorizedAxiosInstance.get(
          `${API_GateWay}/gateway/User/${userId}`
        );
        console.log(res.data.result)
        setUser(res.data.result);
      };
      fetchData().then(() => {
        setLoading(false);
      });
    }
  }, []);

  return (
    <>
      {loading ? (
        <Spin /> // Show spinner when loading is true
      ) : (
        <>
          <img src={user.imageBase64} alt="Girl in a jacket" width="500" height="600" />
        </> // Show user info when loading is false
      )}
    </>
  );
}

export default Dashboard;
