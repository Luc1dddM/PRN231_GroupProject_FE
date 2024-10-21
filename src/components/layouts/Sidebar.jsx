import { Layout, Button } from "antd";
import Logo from "./Logo";
import MenuList from "./MenuList";
import { useState } from "react";
import ToggleThemeButton from "./ToggleThemeButton";
import { CloseOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
const { Sider } = Layout;

function Sidebar({ onClose }) {
  const [darkTheme, setDarkTheme] = useState(true);

  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
  };

  const closeButtonColor = darkTheme ? "text-white" : "text-black";

  return (
    <Layout className="min-h-screen">
      <Sider theme={darkTheme ? "dark" : "light"} className="h-screen">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-2">
            <div className="ml-5 flex-grow flex justify-center">
              {" "}
              <Logo />
            </div>
            <Button
              type="text"
              icon={<CloseOutlined className={closeButtonColor} />}
              onClick={onClose}
              className={`p-0 ${closeButtonColor} ml-2`}
            />
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hidden">
            <MenuList darkTheme={darkTheme} />
          </div>
          <div>
            <ToggleThemeButton
              darkTheme={darkTheme}
              toggleTheme={toggleTheme}
            />
          </div>
        </div>
      </Sider>

      <style>
        {`
          /* Ẩn thanh cuộn */
          .scrollbar-hidden {
            scrollbar-width: none; /* Firefox */
          }

          .scrollbar-hidden::-webkit-scrollbar {
            display: none; /* Ẩn thanh cuộn trong các trình duyệt Webkit (Chrome, Safari) */
          }
        `}
      </style>
    </Layout>
  );
}
Sidebar.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;
