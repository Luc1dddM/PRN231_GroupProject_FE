import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, DatePicker, Switch, Upload, message  } from "antd";
import { EditOutlined, DeleteOutlined, UploadOutlined} from "@ant-design/icons";
import { useItems } from "../../../hooks/useList";
import { useSearchParams } from "react-router-dom";
import GlobalLoading from "../../../components/global/Loading";

import ActionBar from "../../../components/partial/Catalog/CategoryManagement/ActionBar";

const { TextArea } = Input;
const { Option } = Select;

function CategoryList() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState();
  const [loading, setLoading] = useState(false);

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

  const {data, refetch, isLoading} = useItems("/categories", "CategoryList", pagination);
  console.log(data)
  const categoryList = data?.categories?.result?.items ?? [];
  // Calculate the total number of pages
  const totalItems = data?.categories?.result?.totalItems;

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
      console.log("hello")
      search.set("SortBy", sorter.columnKey)
      search.set("SortOrder", sorter.order)
    }

    search.set("PageNumber", String(pagination.current));
    search.set("PageSize", String(pagination.pageSize));
    setSearch(`?${search.toString()}`, { replace: true });
  };

  const columns = [
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Category Type",
      dataIndex: "type",
      key: "type",
      sorter: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: true,
      render: (status) => <span>{status ? "Active" : "Disabled"}</span>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
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
        dataSource={categoryList}
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

export default CategoryList;
