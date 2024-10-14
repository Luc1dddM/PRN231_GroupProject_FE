import { Form, Input, Button, Typography, Layout, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_ROOT } from "../../utils/constants";
import { useEffect } from "react";

const { Title } = Typography;
const { Content } = Layout;

function ForgetPasswordConfirm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("Email");
  const code = searchParams.get("Code");

  useEffect(() => {
    if (email) form.setFieldsValue({ email });
    if (code) form.setFieldsValue({ code });
  }, [location, form]);

  const onFinish = async (values) => {
    await authorizedAxiosInstance.post(
      `${API_ROOT}/api/Identity/ResetPassword`,
      {
        email: values.email,
        code: values.code,
        newPassword: values.password,
      }
    );

    message.success("Password reset successfully!");
    navigate("/login");
  };

  return (
    <Layout>
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
            <Title level={2}>Reset Password</Title>
          </div>
          <Form
            form={form}
            name="resetPassword"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="password"
              label="New Password"
              rules={[
                { required: true, message: "Please input your new password!" },
                {
                  min: 8,
                  message: "Password must be at least 8 characters long!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="New Password"
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your new password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm New Password"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%" }}
              >
                Reset Password
              </Button>
            </Form.Item>
          </Form>
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            Remember your password?{" "}
            <Button
              type="link"
              onClick={() => navigate("/login")}
              style={{ padding: 0 }}
            >
              Log in
            </Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
}

export default ForgetPasswordConfirm;
