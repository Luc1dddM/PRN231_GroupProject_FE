import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClientProvider } from "react-query";
import AppLayout from "./components/layouts/AppLayout";
import Login from "./pages/Identity/Login";
import Dashboard from "./pages/Dashboard";
import "./App.css";
import EmailReconfirm from "./pages/Identity/Reconfirm";
import Register from "./pages/Identity/Register";
import ForgotPassword from "./pages/Identity/ForgotPassword";
import ForgetPasswordConfirm from "./pages/Identity/ForgotPasswordConfirm";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { queryClient } from "./utils/authorizedAxios";

import UserList from "./pages/UserManagement/UserList";
import ShoppingCart from "./pages/ShoppingCart/CartList";
import CustomerChatbox from "./pages/ChatBox/CustomerChatBox";
import AdminChatBox from "./pages/ChatBox/AdminChatBox";

const ProtectedRoutes = () => {
  const user = JSON.parse(localStorage.getItem("userInfo"));
  if (!user) return <Navigate to="/login" replace={true} />;
  return <Outlet />;
};

const UnAuthorizedRoutes = () => {
  const user = JSON.parse(localStorage.getItem("userInfo"));
  if (user) return <Navigate to="/dashboard" replace={true} />;
  return <Outlet />;
};

function App() {
  return (
    <GoogleOAuthProvider clientId="261302569295-6r40gqgs2qjfm2uj7ruq3ranfe7vdmfe.apps.googleusercontent.com">
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/User/" element={<UserList />}></Route>
          <Route path="/" element={<Navigate to="/login" replace={true} />} />
          <Route element={<UnAuthorizedRoutes />}>
            <Route path="/login" element={<Login />} />
            <Route path="/reconfirm" element={<EmailReconfirm />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/ResetPassword" element={<ForgetPasswordConfirm />} />
            <Route path="/CartList" element={<ShoppingCart />} />
          </Route>

          <Route element={<ProtectedRoutes />}>
            <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              }
            />
          </Route>
          <Route path="/CustomerChatBox/:groupId" element={<CustomerChatbox />} />
          <Route path="/AdminChatBox/:groupId?" element={<AdminChatBox />} />

        </Routes>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
