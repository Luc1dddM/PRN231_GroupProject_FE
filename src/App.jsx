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
import CategoryList from "./pages/Catalog/CategoryManagement/CategoryList";
import CustomerChatbox from "./pages/ChatBox/CustomerChatBox";
import AdminChatBox from "./pages/ChatBox/AdminChatBox";
import EmailList from "./pages/EmailManagement/EmailList";
import ShoppingCart from "./pages/ShoppingCart/Cart";
import RolePermissionManager from "./pages/Identity/RolePermissionManagement";
import CouponList from "./pages/CouponManagement/CouponList";
import Profile from "./pages/Profile";
import ProductDetail from "./pages/Catalog/ProductDetail";

function App() {

  const ProtectedRoutes = () => {
  const user = JSON.parse(localStorage.getItem("userInfo"));
    if (!user) return <Navigate to="/login" replace={true} />;
    return <Outlet />;
  };

  // eslint-disable-next-line react/prop-types
  const ProtectedRoutesAdmin = () => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (!user && !user.userType == "Admin") return <Navigate to="/login" replace={true} />;
    return <Outlet />;
  };

  const ProtectedRoutesCustomer = () => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (!user && !user.userType == "Customer") return <Navigate to="/dashboard" replace={true} />;
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
        {/* Have to login routes */}
          <Route element={<ProtectedRoutes />}>
              <Route
                path="/dashboard"
                element={
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                }
              />
              <Route path="/CartList" element={<ShoppingCart />} />
              <Route
                  path="/profile"
                  element={
                      <Profile />
                  }
              />
          </Route>
          <Route path="/Category/" element={<CategoryList />}></Route>
          <Route path="/Email/" element={<EmailList />}></Route>
          <Route path="/Coupon/" element={<CouponList />}></Route>
          <Route
            path="/Admin/RolePermission"
            element={<RolePermissionManager />}
          ></Route>
          <Route path="/Cart" element={<ShoppingCart />} />
          <Route path="/ProductDetail/:id" element={<ProductDetail />} />
          <Route path="/Admin/RolePermission" element={<RolePermissionManager />}></Route>
          <Route path="/" element={<Navigate to="/login" replace={true} />} />
          <Route element={<UnAuthorizedRoutes />}>
            <Route path="/login" element={<Login />} />
            <Route path="/reconfirm" element={<EmailReconfirm />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/ResetPassword" element={<ForgetPasswordConfirm />} />
           
          </Route>

          <Route element={<ProtectedRoutesCustomer />}>
          
           
          </Route>
          <Route element={<ProtectedRoutesAdmin />}>
             
              <Route path="/Admin/User" element={<UserList />}></Route>
              <Route path="/Admin/RolePermission" element={<RolePermissionManager/>}></Route>
          </Route>
          <Route path="/CustomerChatBox/:groupId" element={<CustomerChatbox />} />
          <Route path="/AdminChatBox/:groupId?" element={<AdminChatBox />} />

        </Routes>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
