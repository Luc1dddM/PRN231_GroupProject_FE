import { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Switch,
  Tag,
} from "antd";
import { useItems } from "../../hooks/useList";
import { EditOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import ActionBar from "../../components/partial/EmailManagement/ActionBar";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_ROOT } from "../../utils/constants";
import EditorComponent from "../../components/partial/EmailManagement/EditorComponent";

const { TextArea } = Input;
const { Option } = Select;

function EmailList() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  console.log(userInfo);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState();
  const [search, setSearch] = useSearchParams();

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

  const { data, refetch } = useItems("/emails", "emails", pagination);
  const emailList = data?.listEmail ?? [];
  // const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 5;
  const showModal = (record) => {
    if (record) {
      setEditingKey(record.emailTemplateId); // Lưu lại id email cần edit
      form.setFieldsValue(record); // Điền dữ liệu vào form từ id email được chọn
    } else {
      setEditingKey(null); // Không có dữ liệu nào => form trống
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      // Handle form submission
      console.log(values);
      if (editingKey) {
        console.log("edit");
        console.log(values);
        console.log(editingKey);
        await authorizedAxiosInstance.put(
          API_ROOT + `/emails/${editingKey}`,
          { ...values, emailTemplateId: editingKey },
          {
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
              UserId: userInfo.id,
            },
          }
        );
        refetch();
        // setResponseMessage("Success: " + response.data);
      } else {
        await authorizedAxiosInstance.post(API_ROOT + `/emails`, values, {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            UserId: userInfo.id,
          },
        });
        refetch();
        // setResponseMessage("Success: " + response.data);
      }
      setIsModalVisible(false);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingKey(null);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination({
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
    });

    if (sorter.order) {
      search.set("SortBy", sorter.columnKey);
      search.set("SortOrder", sorter.order);
    } else {
      search.delete("SortBy");
      search.delete("SortOrder");
    }

    search.set("PageNumber", String(pagination.current));
    search.set("PageSize", String(pagination.pageSize));
    setSearch(`?${search.toString()}`, { replace: true });
  };

  const columns = [
    {
      title: "#",
      sorter: true,
      render: (_, record, index) => <p>{++index}</p>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      sorter: true,
      render: (active) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sorter: true,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: true,
    },
    {
      title: "CreatedBy",
      dataIndex: "createdBy",
      key: "createdBy",
      sorter: true,
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      sorter: true,
      render: (text) => new Date(text).toLocaleString(),
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
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
      <ActionBar showModal={showModal} />

      <Table
        columns={columns}
        dataSource={emailList}
        rowKey="id"
        pagination={{
          current: pagination.pageNumber,
          pageSize: pagination.pageSize,
          total: totalElements,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={
          editingKey !== null ? "Edit Email Template" : "Add Email Template"
        }
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        style={{ top: 20 }}
        width={1000}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Please input the subject!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="body"
            label="Body"
            rules={[{ required: true, message: "Please input the body!" }]}
          >
            {/* <TextArea rows={4} /> */}
            <EditorComponent />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please input description!" }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select the category!" }]}
          >
            <Select>
              <Option value="Notification">Notification</Option>
              <Option value="Coupon">Coupon</Option>
            </Select>
          </Form.Item>
          <Form.Item name="active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default EmailList;
