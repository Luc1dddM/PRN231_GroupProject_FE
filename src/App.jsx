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
import RolePermissionManager from "./pages/Identity/RolePermissionManagement";
import Profile from "./pages/Profile";
import Test from "./pages/Test";


function App() {
  const user = JSON.parse(localStorage.getItem("userInfo"));

  // eslint-disable-next-line react/prop-types
  const ProtectedRoutes = ({isAllow}) => {
    if (!isAllow) return <Navigate to="/login" replace={true} />;
    return <Outlet />;
  };
  
  const UnAuthorizedRoutes = () => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) return <Navigate to="/dashboard" replace={true} />;
    return <Outlet />;
  };

  return (
    <GoogleOAuthProvider clientId="261302569295-6r40gqgs2qjfm2uj7ruq3ranfe7vdmfe.apps.googleusercontent.com">
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace={true} />} />
          <Route path="/Test" element={<Test/>}></Route>
          <Route element={<UnAuthorizedRoutes />}>
            <Route path="/login" element={<Login />} />
            <Route path="/reconfirm" element={<EmailReconfirm />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/ResetPassword" element={<ForgetPasswordConfirm />} />
          </Route>

          <Route element={<ProtectedRoutes isAllow={!!user} />}>
          <Route
              path="/dashboard"
              element={
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              }
            />
           
          </Route>
          <Route element={<ProtectedRoutes isAllow={!!user && user.userType === 'admin'} />}>
          <Route
              path="/profile"
              element={
                <AppLayout>
                  <Profile />
                </AppLayout>
              }
            />
            <Route path="/Admin/User" element={<UserList />}></Route>
            <Route path="/Admin/RolePermission" element={<RolePermissionManager/>}></Route>
          </Route>
        </Routes>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
