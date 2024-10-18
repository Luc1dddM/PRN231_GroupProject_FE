import { Layout } from "antd";
import Logo from "./Logo";
import MenuList from "./MenuList";
import { useState } from "react";
import ToggleThemeButton from "./ToggleThemeButton";

const { Sider } = Layout;

function Sidebar() {
  const [darkTheme, setDarkTheme] = useState(true);
  const toggleTheme = () => {
    setDarkTheme(!darkTheme);
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        theme={darkTheme ? "dark" : "light"}
        className="text-white h-screen"
      >
        <div className="flex flex-col h-full">
          <Logo />
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

      {/* CSS tùy chỉnh để ẩn thanh cuộn */}
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

export default Sidebar;
