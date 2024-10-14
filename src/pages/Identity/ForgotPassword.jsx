import { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { MailOutlined, LoginOutlined } from "@ant-design/icons";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_ROOT } from "../../utils/constants";

const { Title, Paragraph } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const nav = useNavigate();

  const onFinish = async (values) => {
    await authorizedAxiosInstance
      .post(`${API_ROOT}/api/Identity/ForgotPassword`, {
        emailAddress: values.email,
      })
      .then(() => {
        setIsSubmitted(true);
        form.resetFields();
      });
  };

  const handleBackToLogin = () => {
    nav("/login");
  };

  if (isSubmitted) {
    return (
      <div
        style={{ maxWidth: "400px", margin: "40px auto", textAlign: "center" }}
      >
        <Title level={2}>Email Reconfirmed</Title>
        <Paragraph>
          Thank you for requesting a password reset. You will receive an email
          shortly with instructions to reset your password.
        </Paragraph>
        <Button
          type="primary"
          icon={<LoginOutlined />}
          onClick={handleBackToLogin}
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Forgot Password
      </Title>
      <Paragraph style={{ textAlign: "center" }}>
        Please enter your email address to Reset your password.
        <br />
        <Button
          type="link"
          icon={<LoginOutlined />}
          onClick={handleBackToLogin}
        >
          Back to Login
        </Button>
      </Paragraph>
      <Form
        form={form}
        name="reconfirm_email"
        onFinish={onFinish}
        layout="vertical"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email address!" },
          ]}
        >
          <Input
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="Your email address"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPassword;
