import { useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useItems } from "../../hooks/useList";
import { useSearchParams } from "react-router-dom";
import ActionBar from "../../components/partial/UserManagement/ActionBar";

const { TextArea } = Input;
const { Option } = Select;

function UserList() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState();
  const [search, setSearch] = useSearchParams();

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
  const response = useItems("/api/User", "UserList", pagination);
  const userList = response.data?.result?.items ?? [];
  const totalItems = response.data?.result?.totalItems;

  const showModal = (record) => {
    if (record) {
      setEditingKey(record.key);
      form.setFieldsValue(record);
    } else {
      setEditingKey(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    //values
    form.validateFields().then(() => {});
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingKey(null);
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
        title={editingKey !== null ? "Edit Template" : "Add Template"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Please input the subject!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: "Please input the content!" }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select the category!" }]}
          >
            <Select>
              <Option value="Onboarding">Onboarding</Option>
              <Option value="Account">Account</Option>
              <Option value="Notification">Notification</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Customer Service">Customer Service</Option>
              <Option value="Product">Product</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserList;
