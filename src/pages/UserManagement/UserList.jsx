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

  //Get List Student by custom UseItems Hook
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

  const response = useItems("/api/User", "UserList", pagination);
  const studentList = response.data?.result?.items ?? [];
  // Calculate the total number of pages
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

  const handleTableChange = (pagination) => {
    setPagination({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
    });
    search.set("PageNumber", String(pagination.current));
    setSearch(`?${search.toString()}`, { replace: true });
    search.set("PageSize", String(pagination.pageSize));
    setSearch(`?${search.toString()}`, { replace: true });
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => <span>{isActive ? "Active" : "Disabled"}</span>,
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
        dataSource={studentList}
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
