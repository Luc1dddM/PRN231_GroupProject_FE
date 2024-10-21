import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, DatePicker, Switch, Upload, message } from "antd";
import { EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from 'dayjs'
import { useItems } from "../../hooks/useList";
import { useSearchParams } from "react-router-dom";
import ActionBar from "../../components/partial/UserManagement/ActionBar";
import GlobalLoading from "../../components/global/Loading";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_GateWay } from "../../utils/constants";
const { TextArea } = Input;
const { Option } = Select;

function UserList() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [search, setSearch] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null)

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
  const {data, refetch, isLoading} = useItems("/api/User", "UserList", pagination);
  const userList = data?.result?.items ?? [];
  const totalItems = data?.result?.totalItems;

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
    if (record) {
      setEditingId(record.id);
      const birthDay = record.birthDay ? dayjs(record.birthDay) : null;
      form.setFieldsValue({...record, birthDay});
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleFileChange = (info) => {
    const file = info.fileList[0]?.originFileObj; // Get the selected file

    if (!file) {

      return;
    }

    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return;
    }

  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if(editingId){
        handleUpdateUser(values)
      }

      handleAddUser(values)
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
     user.roles.forEach(role => formData.append('Roles', role)); // Append roles individually
 
    await authorizedAxiosInstance.put(
      `${API_GateWay}/gateway/User/${editingId}`, 
      formData,
      {
        headers: {
            'Content-Type': 'multipart/form-data' // Specify the content type
        }
      }
    )
    refetch()
    setIsModalVisible(false)
    setEditingId(null)
  }

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const handleDelete = () => {
    //key
    // setTemplates((prevTemplates) => {
    //   const newTemplates = prevTemplates.filter((item) => item.key !== key);
    //   // Adjust current page if necessary
    //   const newTotalPages = Math.ceil(newTemplates.length / pageSize);
    //   if (currentPage > newTotalPages) {
    //     setCurrentPage(newTotalPages || 1);
    //   }
    //   return newTemplates;
    // });
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
      sorter: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,

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
      title: "Actions",
      key: "actions",
      render: (record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
            danger
          >
            Delete
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
        onChange={handleTableChange}
      />

      <Modal
        title={editingId !== null ? "Edit User" : "Add User"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please input the full name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input />
          </Form.Item>
          {!editingId ?  
          <>
            <Form.Item
            name="password"
            label="Password"
            rules={[{ required: !editingId, message: 'Please input the password!' }]}
            >
              <Input.Password />
            </Form.Item>

          </> : ""
          }
          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[{ required: true, message: 'Please input the phone number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
              name="imageFile"
              label="Profile Image"
            >
              <Upload
                accept=".png,.jpg,.jpeg"
                maxCount={1}
                beforeUpload={() => false} // Prevent automatic upload
                onChange={handleFileChange} // Handle file selection manually
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Is Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="birthDay"
            label="Birth Day"
            rules={[{ required: true, message: 'Please select the birth day!' }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="roles"
            label="Roles"
            rules={[{ required: true, message: 'Please select at least one role!' }]}
          >
            <Select mode="multiple">
              <Option value="Customer">Customer</Option>
              <Option value="Admin">Admin</Option>
              <Option value="Manager">Manager</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserList;
