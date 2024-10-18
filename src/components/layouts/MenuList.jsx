import { Menu } from "antd";
import PropTypes from "prop-types";
import {
  AppstoreOutlined,
  AreaChartOutlined,
  BarsOutlined,
  HomeOutlined,
  PayCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const MenuList = ({ darkTheme }) => {
  return (
    <Menu
      theme={darkTheme ? "dark" : "light"}
      mode="inline"
      className="menu-bar h-[88vh] mt-8 flex flex-col gap-4 text-base relative"
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
    </Menu>
  );
};

// Xác thực kiểu dữ liệu cho props
MenuList.propTypes = {
  darkTheme: PropTypes.bool.isRequired, // Kiểu dữ liệu boolean và bắt buộc
};

export default MenuList;
