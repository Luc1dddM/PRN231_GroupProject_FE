import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, DatePicker, Upload, Avatar, Typography, Row, Col, Button, Radio } from 'antd';
import { UploadOutlined, UserOutlined,CalendarOutlined, SaveOutlined } from '@ant-design/icons';
import { API_GateWay } from "../utils/constants";
import { authorizedAxiosInstance } from "../utils/authorizedAxios";
import FormItem from 'antd/es/form/FormItem';
import dayjs from 'dayjs'
import { toast } from 'react-toastify';


const { Title } = Typography;
const { TextArea } = Input;

function Profile() {
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarfile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = JSON.parse(localStorage.getItem("userInfo")).id;

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const res = await authorizedAxiosInstance.get(
        `${API_GateWay}/gateway/User/${userId}`
      );

      const birthDay = res.data.result.birthDay ? dayjs(res.data.result.birthDay) : null;
      form.setFieldsValue({
        email: res.data.result.email,
        fullName: res.data.result.fullName,
        birthDay: birthDay,
        gender: res.data.result.gender,
        phoneNumber: res.data.result.phoneNumber,
      });
      setAvatarUrl(res.data.result.imageBase64)
    };
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  const onFinish = async (user) => {
     // Create a new FormData object
     const formData = new FormData();

     // Append all necessary fields
     formData.append('Id', userId); // Assuming editingId is defined
     formData.append('Email', user.email);
     formData.append('ImageFile', avatarfile); // This should be an instance of File
     formData.append('FullName', user.fullName);
     formData.append('Gender', user.gender);
     formData.append('BirthDay', user.birthDay.format('YYYY-MM-DD'));
 
    await authorizedAxiosInstance.put(
      `${API_GateWay}/gateway/User/${userId}`, 
      formData,
      {
        headers: {
            'Content-Type': 'multipart/form-data' // Specify the content type
        }
      }
    )

    toast.success("Update Profile Successfully!")
  };

  const handleAvatarChange = (info) => {
    const file = info.file; // Get the original file object
    setAvatarFile(file)
      const url = URL.createObjectURL(file); // Create a URL for the image
      setAvatarUrl(url); // Set the image URL in state
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Title level={2}>My Profile</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={24}>
          <Col span={16}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, type: 'email' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
                  name="birthDay"
                  label="Birth Day"
                  rules={[{ required: true, message: 'Please select the birth day!' }]}
                >
                  <DatePicker style={{ width: '100%' }} placeholder="Select birth day" prefix={<CalendarOutlined />} />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio value="Male">Male</Radio>
                <Radio value="Female">Female</Radio>
                <Radio value="Others">Other</Radio>
              </Radio.Group>
            </Form.Item>

          </Col>
          <Col span={8}>
            <FormItem
              name="imageFile"
            >
                <div style={{ textAlign: 'center' }}>
                <Avatar
                    size={128}
                    icon={<UserOutlined />}
                    src={avatarUrl}
                    style={{ marginBottom: 16 }}
                />
                <Upload
                    accept=".png,.jpg,.jpeg"
                    maxCount={1}
                    showUploadList={false}
                    customRequest={handleAvatarChange}
                >
                    <Button icon={<UploadOutlined />}>Change Avatar</Button>
                </Upload>
                </div>
            </FormItem>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large">
           Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

Profile.propTypes = {
  // Add any props here if needed
};

export default Profile;