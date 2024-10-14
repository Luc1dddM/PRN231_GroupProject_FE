import React from "react";
import PropTypes from "prop-types";
import { handleLogoutApi } from "../../apis";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme, Dropdown, Space } from "antd";
import { useNavigate } from "react-router-dom";
const { Header, Content, Sider } = Layout;

const items1 = ["1", "2", "3"].map((key) => ({
  key,
  label: `nav ${key}`,
}));

const items2 = [UserOutlined, LaptopOutlined, NotificationOutlined].map(
  (icon, index) => {
    const key = String(index + 1);
    return {
      key: `sub${key}`,
      icon: React.createElement(icon),
      label: `subnav ${key}`,
      childrenitems: new Array(4).fill(null).map((_, j) => {
        const subKey = index * 4 + j + 1;
        return {
          key: subKey,
          label: `option${subKey}`,
        };
      }),
    };
  }
);

function AppLayout({ children }) {
  const items = [
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
      extra: "⌘P",
    },
    {
      key: "3",
      label: "Billing",
      extra: "⌘B",
    },
    {
      key: "4",
      label: "Logout",
      icon: <SettingOutlined />,
      extra: "⌘S",
      onClick: () => logout(),
    },
  ];

  const navigate = useNavigate();

  const logout = () => {
    handleLogoutApi();
    navigate("/login");
  };

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
            items,
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
}

AppLayout.propTypes = {
  children: PropTypes.node, // Ensure 'children' is properly validated
};

export default AppLayout;
