import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { handleLogoutApi } from "../../apis";
import {
  DownOutlined,
  SettingOutlined,
  MenuOutlined,
  SearchOutlined,
  
} from "@ant-design/icons";
import {
  Breadcrumb,
  Layout,
  theme,
  Dropdown,
  Space,
  Button,
  Drawer,
  Input,
  Menu,
  Badge
} from "antd";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Slider from "./Slider";


const { Header, Content, Footer } = Layout;

function AppLayout() {
  const navigate = useNavigate(); // To use navigation



  const [visible, setVisible] = useState(false);


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


  ];


  

  const logout = () => {
    handleLogoutApi();
    navigate("/login");
  };

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const showDrawer = () => {
    setVisible(true);
  };

  const closeDrawer = () => {
    setVisible(false);
  };

  const menu = <Menu items={items} />;

  return (
    <Layout>
      <Header className="flex items-center justify-between bg-[#001529] p-0 px-6">
        <Button
          type="text"
          icon={<MenuOutlined className="text-white text-2xl" />}
          onClick={showDrawer}
        />

        <Input
          placeholder="Tìm kiếm..."
          className="w-72 mx-5 rounded-full bg-white"
          suffix={<SearchOutlined className="text-gray-400" />}
        />

        <Dropdown overlay={menu} trigger={["hover"]}>
          <a onClick={(e) => e.preventDefault()} className="text-white">
            <Space>
              Hover me
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
      </Header>

      <Layout>
        <Layout className="p-6">
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
            className="my-4"
          />
          <Content
            className={`p-6 bg-${colorBgContainer} rounded-lg min-h-[280px] mx-5`}
          >
            <Slider />
          </Content>
        </Layout>
      </Layout>

      <Drawer
        placement="left"
        closable={false}
        onClose={closeDrawer}
        visible={visible}
        width={200}
        bodyStyle={{ padding: 0 }}
      >
        <Sidebar onClose={closeDrawer} />
      </Drawer>

      <Footer className="text-center bg-[#001529] text-white">
        &copy; {new Date().getFullYear()} Your Company Name. All rights
        reserved.
      </Footer>
    </Layout>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node,
};

export default AppLayout;
