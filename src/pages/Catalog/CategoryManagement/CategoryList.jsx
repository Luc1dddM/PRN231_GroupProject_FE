import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, DatePicker, Switch, Upload, message, Tabs   } from "antd";
import { EditOutlined, ClockCircleOutlined, DeleteOutlined, UploadOutlined, UserOutlined,MailOutlined, PhoneOutlined, LockOutlined, TeamOutlined, CalendarOutlined} from "@ant-design/icons";
import { useItems } from "../../../hooks/useList";
import { useSearchParams } from "react-router-dom";
import GlobalLoading from "../../../components/global/Loading";
import { API_GateWay } from "../../../utils/constants";
import { authorizedAxiosInstance } from "../../../utils/authorizedAxios";

import ActionBar from "../../../components/partial/Catalog/CategoryManagement/ActionBar";

const { TabPane } = Tabs
const { TextArea } = Input;
const { Option } = Select;

function CategoryList() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1')
  const [search, setSearch] = useSearchParams();
  const Types = [
      { id: "brand", label: "Brand", value: "Brand" },
      { id: "device", label: "Device", value: "Device" },
      { id: "color", label: "Color", value: "Color" },
    ]

  

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

  const {data, refetch, isLoading} = useItems("/gateway/categories", "CategoryList", pagination);
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
      setEditingKey(record.categoryId);
      console.log(record)
      form.setFieldsValue(record);
    } else {
      setEditingKey(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    //values
    form.validateFields().then((values) => {
      if(editingKey){
        handleUpdateCategory(values)
      }else{
        handleAddCategory(values)
      }

    });
  };
  const handleAddCategory = async (category) => {
    // Create a new FormData object
    const categoryData = {
      Name: category.name,
      Type: category.type,
      Status: category.status
    };
    // Send JSON data using Axios
    await authorizedAxiosInstance.post(
      `${API_GateWay}/gateway/categories`, 
      categoryData, // Send data as JSON
      {
        headers: {
          'Content-Type': 'application/json' // Specify content type as JSON
        }
      }
    )
   refetch()
   setIsModalVisible(false)
 }

  const handleUpdateCategory = async (category) => {
    console.log(category)
    // Create a new FormData object
    const categoryData = {
      Name: category.name,
      Type: category.type,
      Status: category.status
    };
    setLoading(true)
    await authorizedAxiosInstance.put(
      `${API_GateWay}/gateway/categories/${editingKey}`, 
      categoryData,
      {
        headers: {
            'Content-Type': 'application/json' // Specify content type as JSON
        }
      }
    ).finally(() =>{
      setLoading(false)
    })
    setLoading(false)
    refetch()
    setIsModalVisible(false)
    setEditingId(null)
  }




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
        title={editingKey !== null ? "Edit Category" : "Add Category"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            {editingKey !== null ? "Update" : "Add"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Basic Info" key="1">
              <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Form.Item
                  name="name"
                  label="Category Name"
                  rules={[{ required: true, message: 'Please input the category name!' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Enter category name" />
                </Form.Item>
                <Form.Item
                  name="type"
                  label="Category Type"
                  rules={[{ required: true, message: 'Please select at least one type!' }]}
                >
                  <Select placeholder="Select roles" prefix={<TeamOutlined />}>
                    {Types.map((item) => {return(
                      <Option key={item.id} value={item.value}>{item.label}</Option>
                    )})}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="status"
                  label="Active Status"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              </Space>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    </div>
  );
}

export default CategoryList;
