import { useEffect, useState } from "react";
import { Menu, Badge } from "antd";
import PropTypes from "prop-types";
import {
  AppstoreOutlined,
  AreaChartOutlined,
  BarsOutlined,
  HomeOutlined,
  PayCircleOutlined,
  SettingOutlined,
  MessageOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_GateWay } from "../../utils/constants";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
const MenuList = ({ darkTheme }) => {

  const navigate = useNavigate(); // To use navigation
  const [newCustomerMessages, setNewCustomerMessages] = useState();
  const [newAdminMessages, setNewAdminMessages] = useState();
  const userId = JSON.parse(localStorage.getItem("userInfo")).id;
  const [GroupId, setGroupId] = useState()
  const [connection, setConnection] = useState();
  useEffect(() => {
    const fetchData = async () => {
      const res = await authorizedAxiosInstance.get(`${API_GateWay}/gateway/chat/group`);
      setGroupId(res.data.response.result[0].groupId)

      const res2 = await authorizedAxiosInstance.get(`${API_GateWay}/gateway/chat/totalNotify`);
      setNewCustomerMessages(res2.data.response.result)
      setNewAdminMessages(res2.data.response.result)
    };
    fetchData().then(() => {

    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {


      const connection = new HubConnectionBuilder()
        .withUrl(`https://localhost:6019/chat`, {
          withCredentials: true
        })
        .configureLogging(LogLevel.Information)
        .build();
      await connection.start();
      setConnection(connection);
      console.log(connection)
      await connection.invoke("OnConnected", userId);



      connection.on("ReceiveNotifyTotal", (totalNotify) => {
        const handlerNotify = async () => {
          const notifi = await authorizedAxiosInstance.get(`${API_GateWay}/gateway/chat/totalNotify`);
          setNewCustomerMessages(notifi.data.response.result)
          setNewAdminMessages(notifi.data.response.result)
        }
        handlerNotify()

      })


      return () => {
        // Disconnect SignalR when the component unmounts (i.e., user navigates away)
        if (connection) {
          connection.stop()
            .then(() => console.log('Connection stopped'))
            .catch(err => console.error('Disconnection failed:', err));
        }
      };


    };
    fetchData();
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", () => {
      window.location.reload();
    });

    return () => {
      window.removeEventListener("popstate", () => {
        window.location.reload();
      });
    };
  }, [location]);

  const handleMenuClick = ({ key }) => {
    if (key === "customerChat") {
      // Check if chat is enabled before navigating
      navigate(`/CustomerChatBox/${GroupId}`); // Redirect to /CustomerChatBox when clicked
    }
    else if (key === "adminChat") {
      // Check if chat is enabled before navigating
      navigate(`/AdminChatBox/`); // Redirect to /CustomerChatBox when clicked
    }
  };


  const showAdminChat = GroupId? true:false;  // Replace with your condition


  return (
    <Menu
      theme={darkTheme ? "dark" : "light"}
      mode="inline"
      className="menu-bar h-[88vh] mt-8 flex flex-col gap-4 text-base relative"
      onClick={handleMenuClick}
    >
      <Menu.Item key="home" icon={<HomeOutlined />}>
        Home
      </Menu.Item>
      <Menu.Item key="activity" icon={<AppstoreOutlined />}>
        Activity
      </Menu.Item>
      <Menu.SubMenu key="tasks" icon={<BarsOutlined />} title="Tasks">
        <Menu.Item key="task-1">Task 1</Menu.Item>
        <Menu.Item key="task-2">Task 2</Menu.Item>
        <Menu.SubMenu key="subtasks" title="Task 3">
          <Menu.Item key="subtask-1">Subtask 1</Menu.Item>
          <Menu.Item key="subtask-2">Subtask 2</Menu.Item>
        </Menu.SubMenu>
      </Menu.SubMenu>
      <Menu.Item key="Progress" icon={<AreaChartOutlined />}>
        Progress
      </Menu.Item>
      <Menu.Item key="Payment" icon={<PayCircleOutlined />}>
        Payment
      </Menu.Item>
      <Menu.Item key="Settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      {/* Conditional rendering of the admin chat option */}
      {showAdminChat && (
        <Menu.Item
          key="adminChat"
          icon={
            <Badge count={newAdminMessages || 0} size="small">
              <MessageOutlined />
            </Badge>
          }
        >
          Admin Chat
        </Menu.Item>

      )}
      {/* Conditional rendering of the admin chat option */}
      {showAdminChat && (
        <Menu.Item
          key="customerChat"
          icon={
            <Badge count={newCustomerMessages || 0} size="small">
              <MessageOutlined />
            </Badge>
          }
        >
          Customer Chat
        </Menu.Item>

      )}
      
    </Menu>
  );
};

// Xác thực kiểu dữ liệu cho props
MenuList.propTypes = {
  darkTheme: PropTypes.bool.isRequired, // Kiểu dữ liệu boolean và bắt buộc
};

export default MenuList;
