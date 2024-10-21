import { Form, Input, Button, Typography, Layout } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_GateWay } from "../../utils/constants";

const { Title } = Typography;
const { Content } = Layout;

function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    var res = await authorizedAxiosInstance.post(`${API_GateWay}/api/Identity/Register`, {
      email: values.email,
      name: values.fullName,
      phonenumber: values.phoneNumber,
      password: values.password,
    });

    if (res.data.result) {
      navigate("/login");
    }
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
            <img src="/placeholder.svg?height=48&width=48" alt="ToolShop Logo" style={{ width: "48px", height: "48px" }} />
            <Title level={2}>Create a New Account</Title>
          </div>
          <Form form={form} name="createAccount" onFinish={onFinish} layout="vertical">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
                {
                  type: "email",
                  message: "Please enter a valid email address!",
                },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item name="fullName" label="Full Name" rules={[{ required: true, message: "Please input your full name!" }]}>
              <Input prefix={<UserOutlined />} placeholder="Full Name" />
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[
                { required: true, message: "Please input your phone number!" },
                {
                  pattern: /^0\d{9}$/,
                  message: "Please enter a valid phone number!",
                },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: "Please input your password!" },
                {
                  min: 8,
                  message: "Password must be at least 8 characters long!",
                },
                {
                  pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*\W)[A-Za-z\d\W]{8,}$/,
                  message: 'Password must be at least 8 characters, include 1 uppercase, 1 digit, and 1 non-alphabet character.',
                },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("The two passwords do not match!"));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
                Create Account
              </Button>
            </Form.Item>
          </Form>
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            Already have an account?{" "}
            <Button type="link" onClick={() => navigate("/login")} style={{ padding: 0 }}>
              Log in
            </Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
}

export default Register;
