import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, DatePicker, Switch, Tabs } from 'antd'
import { EditOutlined, ClockCircleOutlined, UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useItems } from "../../hooks/useList";
import { useSearchParams } from "react-router-dom";
import ActionBar from "../../components/partial/UserManagement/ActionBar";
import GlobalLoading from "../../components/global/Loading";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_GateWay } from "../../utils/constants";


const { TabPane } = Tabs
const { Option } = Select;

function UserList() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [search, setSearch] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null)
  const [activeTab, setActiveTab] = useState('1')

  //Get Paginations from url
  const pageSizeUrl = search.get("PageSize")
    ? Number(search.get("PageSize"))
    : 5;

  const pageNumberUrl = search.get("PageNumber")
    ? Number(search.get("PageNumber"))
    : 1;

  const [pagination, setPagination] = useState({
    pageNumber: pageNumberUrl,
    pageSize: pageSizeUrl,
  });

  //Get List Student and ralative info by custom UseItems Hook
  const {data, refetch, isLoading} = useItems("/gateway/User", "UserList", pagination);
  const userList = data?.result?.items ?? [];
  const totalItems = data?.result?.totalItems;

  console.log(userList)

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [
    isLoading,
  ]);

  const showModal = (record) => {
    console.log(record)
    if (record) {
      setEditingId(record.id);
      const birthDay = record.birthDay ? dayjs(record.birthDay) : null;
      const createdAt = record.createdAt ? dayjs(record.createdAt) : null;
      const updatedAt = record.updatedAt ? dayjs(record.updatedAt) : null;

      form.setFieldsValue({...record, birthDay, createdAt, updatedAt});
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    console.log("ts")
    form.validateFields().then((values) => {
      console.log(values)
      if(editingId){
        handleUpdateUser(values)
      }else{
        handleAddUser(values)
      }

    });
  };

  const handleAddUser = async (user) => {
    // Create a new FormData object
    const formData = new FormData();

    // Append all necessary fields
    formData.append('Email', user.email);
    formData.append('Password', user.password)
    formData.append('PhoneNumber', user.phoneNumber);
    formData.append('ImageFile', user.imageFile); // This should be an instance of File
    formData.append('IsActive', user.isActive);
    formData.append('FullName', user.fullName);
    formData.append('BirthDay', user.birthDay.format('YYYY-MM-DD'));
    user.roles.forEach(role => formData.append('Roles', role)); // Append roles individually

   await authorizedAxiosInstance.post(
     `${API_GateWay}/gateway/User`, 
     formData,
     {
       headers: {
           'Content-Type': 'multipart/form-data' // Specify the content type
       }
     }
   )
   refetch()
   setIsModalVisible(false)
 }

  const handleUpdateUser = async (user) => {
     // Create a new FormData object
     const formData = new FormData();

     // Append all necessary fields
     formData.append('Id', editingId); // Assuming editingId is defined
     formData.append('Email', user.email);
     formData.append('PhoneNumber', user.phoneNumber);
     formData.append('ImageFile', user.imageFile); // This should be an instance of File
     formData.append('IsActive', user.isActive);
     formData.append('FullName', user.fullName);
     formData.append('BirthDay', user.birthDay.format('YYYY-MM-DD'));
    //  user.roles.forEach(role => formData.append('Roles', role)); // Append roles individually
    
    setLoading(true)
    await authorizedAxiosInstance.put(
      `${API_GateWay}/gateway/User/${editingId}`, 
      formData,
      {
        headers: {
            'Content-Type': 'multipart/form-data' // Specify the content type
        }
      }
    )
    setLoading(false)
    refetch()
    setIsModalVisible(false)
    setEditingId(null)
  }

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const handleTableChange = (pagination, filters, sorter) => {

    setPagination({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
    });

    if(sorter.order){
      search.set("SortBy", sorter.columnKey)
      search.set("SortOrder", sorter.order)
    }

    search.set("PageNumber", String(pagination.current));
    search.set("PageSize", String(pagination.pageSize));
    setSearch(`?${search.toString()}`, { replace: true });
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      fixed: 'left',
      sorter: true,
      width: '10%',
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
      responsive: ['lg'],
      width: 200,
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: true,
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      sorter: true,
      responsive: ['lg'],
      width: 200,
    },
    {
      title: "Birth Day",
      dataIndex: "birthDay",
      key: "birthday",
      sorter: true,
      render: (text) => {
         // Kiểm tra xem text có giá trị không
        if (!text) return '';

        // Chuyển đổi định dạng
        const date = new Date(text);
        const day = String(date.getDate()).padStart(2, '0'); 
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const year = String(date.getFullYear()); 

        return `${day}/${month}/${year}`;
      }
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      sorter: true,
      render: (isActive) => <span>{isActive ? "Active" : "Disabled"}</span>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAd",
      sorter: true,
      
      render: (text) => {
        // Kiểm tra xem text có giá trị không
       if (!text) return '';

       // Chuyển đổi định dạng
       const date = new Date(text);
       const day = String(date.getDate()).padStart(2, '0'); 
       const month = String(date.getMonth() + 1).padStart(2, '0'); 
       const year = String(date.getFullYear()); 

       const hours = String(date.getHours()).padStart(2, '0'); 
       const minutes = String(date.getMinutes()).padStart(2, '0'); 
   
       return `${hours}:${minutes} ${day}/${month}/${year} `;
     }
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAd",
      sorter: true,
      
      render: (text) => {
        // Kiểm tra xem text có giá trị không
       if (!text) return '';

       // Chuyển đổi định dạng
       const date = new Date(text);
       const day = String(date.getDate()).padStart(2, '0'); 
       const month = String(date.getMonth() + 1).padStart(2, '0'); 
       const year = String(date.getFullYear()); 

       const hours = String(date.getHours()).padStart(2, '0'); 
       const minutes = String(date.getMinutes()).padStart(2, '0'); 
   
       return `${hours}:${minutes} ${day}/${month}/${year} `;
     }
    },
    {
      title: "Actions",
      key: "actions",
      render: (record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>
            Edit
          </Button>
          
        </Space>
      ),
    },
  ];
  return (
    <div className="container mx-auto p-4">
      <GlobalLoading isLoading={loading} />
      <ActionBar showModal={showModal} />

      <Table
        columns={columns}
        dataSource={userList}
        pagination={{
          current: pagination.pageNumber,
          pageSize: pagination.pageSize,
          total: totalItems,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        scroll={{
          x: '1200',
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingId !== null ? "Edit User" : "Add User"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            {editingId !== null ? "Update" : "Add"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Basic Info" key="1">
              <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Form.Item
                  name="fullName"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please input the full name!' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Enter full name" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please input the email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Enter email" />
                </Form.Item>
                <Form.Item
                  name="phoneNumber"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please input the phone number!' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
                </Form.Item>
                <Form.Item
                  name="birthDay"
                  label="Birth Day"
                  rules={[{ required: true, message: 'Please select the birth day!' }]}
                >
                  <DatePicker style={{ width: '100%' }} placeholder="Select birth day" prefix={<CalendarOutlined />} />
                </Form.Item>
              </Space>
            </TabPane>
            <TabPane tab="Account Details" key="2">
              <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                {!editingId ? <>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: !editingId, message: 'Please input the password!' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Enter password" />
                  </Form.Item>
                </> : ""}
                <Form.Item
                  name="roles"
                  label="Roles"
                  rules={[{ required: true, message: 'Please select at least one role!' }]}
                >
                  <Select mode="multiple" placeholder="Select roles" prefix={<TeamOutlined />}>
                    <Option value="User">User</Option>
                    <Option value="Admin">Admin</Option>
                    <Option value="Manager">Manager</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="isActive"
                  label="Active Status"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
                {editingId && (
                  <Form.Item 
                    name="updatedBy"
                    label="Updated By"
                  >
                    <Input prefix={<UserOutlined />} placeholder="Updated By" disabled />
                  </Form.Item>
                )}
              </Space>
            </TabPane>
            <TabPane tab="Audit Info" key="3">
              <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Form.Item
                  name="createdAt"
                  label="Created At"
                >
                  <DatePicker 
                    showTime 
                    style={{ width: '100%' }} 
                    disabled={editingId !== null}
                    prefix={<ClockCircleOutlined />}
                  />
                </Form.Item>
                <Form.Item
                  name="createdBy"
                  label="Created By"
                >
                  <Input prefix={<UserOutlined />} disabled={editingId !== null} />
                </Form.Item>
                <Form.Item
                  name="updatedAt"
                  label="Updated At"
                >
                  <DatePicker 
                    showTime 
                    style={{ width: '100%' }} 
                    disabled 
                    prefix={<ClockCircleOutlined />}
                  />
                </Form.Item>
                <Form.Item
                  name="updatedBy"
                  label="Updated By"
                >
                  <Input prefix={<UserOutlined />} disabled />
                </Form.Item>
              </Space>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    </div>
  );
}

export default UserList;
