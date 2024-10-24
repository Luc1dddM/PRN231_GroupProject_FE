import { useState } from "react";
import { API_GateWay } from "../../utils/constants";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Layout,
  message,
} from "antd";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import GlobalLoading from "../../components/global/Loading"; 
const { Title } = Typography;
const { Content } = Layout;

function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true)
    const { email, password } = values;
    const res = await authorizedAxiosInstance.post(
      `${API_GateWay}/gateway/Identity/Login`,
      {
        userName: email,
        password: password,
      }
    ).finally(() =>{
      setLoading(false)
    });

    const userInfo = {
      email: res.data.result.email,
      id: res.data.result.userId,
      userType: res.data.result.userType
    };

    handleLoginSuccess(
      res.data.result.token,
      res.data.result.refreshToken,
      userInfo
    );
  };

  const handleLoginSuccess = (accessToken, refreshToken, userInfo) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
    navigate("/dashboard");
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    // Check if the credential is available
    if (credentialResponse.credential) {
      // Send the Google ID token to your backend API
      const res = await authorizedAxiosInstance.post(
        `${API_GateWay}/gateway/Identity/GoogleSignIn`,
        {
          token: credentialResponse.credential,
        }
      );
      // Check if the response is ok (status code 200)
      if (res.data.isSuccess) {
        const userInfo = {
          email: res.data.result.email,
          id: res.data.result.userId,
        };

        handleLoginSuccess(
          res.data.result.token,
          res.data.result.refreshToken,
          userInfo
        );
      }
    }
  };

  return (
    <Layout>
      <GlobalLoading isLoading={loading} />
      <Content
        style={{
          padding: "50px",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "24px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <img
              src="/placeholder.svg?height=48&width=48"
              alt="ToolShop Logo"
              style={{ width: "48px", height: "48px" }}
            />
            <Title level={2}>Sign in to ToolShop</Title>
          </div>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please input your Email!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>
            <Form.Item>
              <Button type="link" style={{ padding: 0 }} href="/forgotpassword">
                Forgot password?
              </Button>
            </Form.Item>
            <Form.Item>
              <Button type="link" style={{ padding: 0 }} href="/reconfirm">
                Reconfirm account?
              </Button>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%" }}
              >
                Sign in
              </Button>
            </Form.Item>
            <Form.Item>
              <Button type="link" style={{ width: "100%" }} href="/register">
                Sign up
              </Button>
            </Form.Item>
          </Form>
          <Divider>Or continue with</Divider>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => message.error("Google Sign In Failed")}
            />
          </div>
        </div>
      </Content>
    </Layout>
  );
}

export default Login;
