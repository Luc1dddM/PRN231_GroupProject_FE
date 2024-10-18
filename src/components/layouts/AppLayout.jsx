import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { handleLogoutApi } from "../../apis";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
  DownOutlined,
  SettingOutlined,
  MessageOutlined
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme, Dropdown, Space, Badge } from "antd";
import { useNavigate } from "react-router-dom";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_GateWay } from "../../utils/constants";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
//import { API_GateWay } from "../../utils/constants";
const { Header, Content, Sider } = Layout;

const items1 = ["1", "2", "3"].map((key) => ({
  key,
  label: `nav ${key}`,
}));

const AppLayout = ({ children }) => {
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
  console.log(GroupId)

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



      // setNewCustomerMessages(transformedMessages); // Update the messages state with oldMessages


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

  window.addEventListener("beforeunload", function () {
    connection.stop()
  });


  const logout = () => {
    handleLogoutApi();
    navigate("/login");
  };



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

  const items2 = [
    {
      key: "sub1",
      icon: <UserOutlined />,
      label: "User",
      children: [
        { key: "1", label: "Profile" },
        { key: "2", label: "Settings" },
      ],
    },
    {
      key: "sub2",
      icon: <LaptopOutlined />,
      label: "Laptop",
      children: [
        { key: "3", label: "Laptops" },
        { key: "4", label: "More options" },
      ],
    },
    {
      key: "sub3",
      icon: <NotificationOutlined />,
      label: "Notification",
      children: [
        { key: "5", label: "Alerts" },
        { key: "6", label: "Updates" },
      ],
    },


  ];

if(GroupId){
  items2.push(    {
    key: "customerChat", // New key for CustomerChatBox
    icon: (
      <Badge count={newCustomerMessages || 0} size="small">
        <MessageOutlined />
      </Badge>
    ),
    label: "Customer Chatbox", // Label for the new route
  },)
}


if(true){
  items2.push(    {
    key: "adminChat", // New key for CustomerChatBox
    icon: (
      <Badge count={newAdminMessages || 0} size="small">
        <MessageOutlined />
      </Badge>
    ),
    label: "Admin Chatbox", // Label for the new route
  },)
}

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["2"]}
          items={items1}
          style={{
            flex: 1,
            minWidth: 0,
          }}
        />
        <Dropdown
          style={{
            color: "white",
          }}
          menu={{
            items: [
              {
                key: "1",
                label: "My Account",
                disabled: true,
              },
              {
                type: "divider",
              },
              {
                key: "2",
                label: "Profile",
              },
              {
                key: "3",
                label: "Billing",
              },
              {
                key: "4",
                label: "Logout",
                icon: <SettingOutlined />,
                onClick: () => logout(),
              },
            ],
          }}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space style={{ color: "white" }}>
              Hover me
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
      </Header>
      <Layout>
        <Sider
          width={200}
          style={{
            background: colorBgContainer,
          }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["sub1"]}
            style={{
              height: "100%",
              borderRight: 0,
            }}
            items={items2}
            onClick={handleMenuClick} // Call this when menu items are clicked
          />
        </Sider>
        <Layout
          style={{
            padding: "0 24px 24px",
          }}
        >
          <Breadcrumb
            items={[
              {
                title: "Home",
              },
              {
                title: "List",
              },
              {
                title: "App",
              },
            ]}
            style={{
              margin: "16px 0",
            }}
          />
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node, // Ensure 'children' is properly validated
};

export default AppLayout;
