import { FireFilled } from "@ant-design/icons";

function Logo() {
  return (
    <div className="flex items-center justify-center text-white p-2.5">
      <div className="logo-icon w-10 h-10 flex items-center justify-center text-xl rounded-full bg-[rgba(28,17,41,0.88)]">
        <FireFilled />
      </div>
    </div>
  );
}

export default Logo;
