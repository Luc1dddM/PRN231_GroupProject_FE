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
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import ActionBar from "../../components/partial/CouponManagement/ActionBar";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_ROOT } from "../../utils/constants";

const { TextArea } = Input;
const { Option } = Select;

function CouponList() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
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

  const { data, refetch } = useItems("/api/coupons", "coupons", pagination);
  const couponList = data?.items ?? [];
  const totalElements = data?.totalItems ?? 0;

  const showModal = (record) => {
    if (record) {
      setEditingKey(record.couponCode); // Use couponCode for editing
      form.setFieldsValue(record); // Populate form with existing coupon data
    } else {
      setEditingKey(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingKey) {
        // Update existing coupon
        await authorizedAxiosInstance.put(
          `${API_ROOT}/api/coupons/${editingKey}`,
          { ...values, couponCode: editingKey },
          {
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
              UserId: userInfo.id,
            },
          }
        );
      } else {
        // Create new coupon
        await authorizedAxiosInstance.post(
          API_ROOT + `/api/coupons`,
          { ...values, createdBy: userInfo.id },
          {
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
              UserId: userInfo.id,
            },
          }
        );
      }
      refetch(); // Refresh the coupon list
      setIsModalVisible(false); // Close modal
      form.resetFields(); // Reset form fields
      // Show success notification
      notification.success({
        message: editingKey ? "Coupon Updated" : "Coupon Created",
        description: `The coupon has been ${
          editingKey ? "updated" : "created"
        } successfully.`,
      });
    } catch (error) {
      console.error("Error saving coupon:", error);
      // Show error notification
      notification.error({
        message: "Error",
        description: "There was an error saving the coupon. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingKey(null);
  };

  const handleDelete = async (couponCode) => {
    // Handle delete logic
    await authorizedAxiosInstance.delete(`${API_ROOT}/coupons/${couponCode}`, {
      headers: {
        UserId: userInfo.id,
      },
    });
    refetch();
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
      render: (_, __, index) => <p>{index + 1}</p>,
    },
    {
      title: "Coupon Code",
      dataIndex: "couponCode",
      key: "couponCode",
      sorter: true,
    },
    {
      title: "Discount Amount",
      dataIndex: "discountAmount",
      key: "discountAmount",
      sorter: true,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      sorter: true,
    },
    {
      title: "Min Amount",
      dataIndex: "minAmount",
      key: "minAmount",
      sorter: true,
    },
    {
      title: "Max Amount",
      dataIndex: "maxAmount",
      key: "maxAmount",
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: true,
      render: (status) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created By",
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
          {/* <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.couponCode)}
            danger
          >
            Delete
          </Button> */}
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <ActionBar showModal={showModal} />
      <Table
        columns={columns}
        dataSource={couponList}
        rowKey="couponCode"
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
        title={editingKey ? "Edit Coupon" : "Add Coupon"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="couponCode"
            label="Coupon Code"
            rules={[
              { required: true, message: "Please input the coupon code!" },
            ]}
          >
            <Input type="text" />
            {/* Disable couponCode field if editing */}
          </Form.Item>
          <Form.Item
            name="discountAmount"
            label="Discount Amount"
            rules={[
              { required: true, message: "Please input the discount amount!" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: "Please input the quantity!" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="minAmount"
            label="Minimum Amount"
            rules={[
              { required: true, message: "Please input the minimum amount!" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="maxAmount"
            label="Maximum Amount"
            rules={[
              { required: true, message: "Please input the maximum amount!" },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item name="status" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default CouponList;
