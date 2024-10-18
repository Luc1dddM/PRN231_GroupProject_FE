import  { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Tree, Typography, Space, Checkbox } from 'antd';
import { PlusOutlined, EditFilled } from '@ant-design/icons';
import GlobalLoading from "../../components/global/Loading";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_GateWay } from "../../utils/constants";

const { Title } = Typography;

const initialRoles = [
  { id: 1, name: 'Admin', permissions: ['ReadUser', 'UpdateUser', 'DeleteUser', 'ReadProduct', 'UpdateProduct'] },
  { id: 2, name: 'Editor', permissions: ['ReadUser', 'UpdateUser', 'ReadProduct'] },
  { id: 3, name: 'Viewer', permissions: ['ReadUser', 'ReadProduct'] },
];

const availablePermissionsInit = [
  { type: "User", permissions: ['ReadUser', 'UpdateUser', 'DeleteUser'] },
  { type: "Product", permissions: ['ReadProduct', 'UpdateProduct', 'DeleteProduct'] },
];

export default function RolePermissionManager() {
  const [availablePermissions, setAvailablePermissions] = useState(availablePermissionsInit);
  const [roles, setRoles] = useState(initialRoles);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [checkedKeys, setCheckedKeys] = useState([]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const rolesRes = await authorizedAxiosInstance.get(
        `${API_GateWay}/gateway/Identity/GetRolesManager`
      );
      setRoles(rolesRes.data.result);

      const perRes = await authorizedAxiosInstance.get(`${API_GateWay}/gateway/Identity/GetPermissions`);
      setAvailablePermissions(perRes.data.result);
    };
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);

  const showModal = (role) => {
    setEditingRole(role || null);
    form.setFieldsValue(role || { name: '', permissions: [] });
    setCheckedKeys(role ? role.permissions : []);
    setIsModalVisible(true);
  };

  const handleAddRole = async (roleName)=> {
   const res = await authorizedAxiosInstance.post(
        `${API_GateWay}/gateway/Identity/AddRole`, {
            name: roleName,
            permissions: checkedKeys
        }
    )
    setRoles(roles => [...roles, res.data.result])
  }

  const handleUpdateRole = async (roleId, roleName)=> {
    const res = await authorizedAxiosInstance.post(
         `${API_GateWay}/gateway/Identity/UpdateRole`, {
             RoleId: roleId,
             name: roleName,
             permissions: checkedKeys
         }
     )
     const updatedRole = res.data.result;
     setRoles((prevRoles) =>
        prevRoles.map((role) => (role.roleId === roleId ? updatedRole : role))
      );
   }

  const handleOk = () => {
    form.validateFields().then((values) => {
        if(!editingRole){
            handleAddRole(values.name)
        }

        handleUpdateRole(editingRole.roleId, values.name)

      setIsModalVisible(false);
      form.resetFields();
      setCheckedKeys([]);
    });
  };

  const onCheck = (checked) => {
    setCheckedKeys(checked);
  };

  const columns = [
    {
      title: 'Type/Permission',
      dataIndex: 'permission',
      key: 'permission',
      render: (text, record) => {
        if (record.isType) {
          return <strong>{text}</strong>;
        }
        return text;
      },
    },
    ...roles.map((role) => ({
      title: (
        <Space>
          {role.name}
          <Button
            type="primary"
            size="small"
            icon={<EditFilled />}
            onClick={() => showModal(role)}
            aria-label={`Edit ${role.name} role`}
          />
        </Space>
      ),
      dataIndex: role.roleId,
      key: role.roleId,
      render: (hasPermission) => (
        <Checkbox checked={hasPermission} disabled />
      ),
    })),
  ];

  const data = availablePermissions.flatMap(({ type, permissions }) => [
    { key: `${type}-type`, permission: type, isType: true },
    ...permissions.map((permission) => ({
      key: permission,
      permission,
      ...Object.fromEntries(
        roles.map((role) => [
          role.roleId,
          role.permissions.includes(permission),
        ])
      ),
    })),
  ]);

  const treeData = availablePermissions.map(({ type, permissions }) => ({
    title: type,
    key: type,
    children: permissions.map((permission) => ({
      title: permission,
      key: permission,
    })),
  }));

  return (
    <div style={{ padding: '24px' }}>
      <GlobalLoading isLoading={loading} />
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Title level={2}>Role and Permission Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add New Role
        </Button>
      </Space>

      <Table columns={columns} dataSource={data} scroll={{ x: 'max-content' }} pagination={false} />

      <Modal
        title={editingRole ? 'Edit Role' : 'Add New Role'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => {
          setIsModalVisible(false);
          setCheckedKeys([]);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: 'Please input the role name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="permissions" label="Permissions">
            <Tree
              checkable
              treeData={treeData}
              defaultExpandAll
              checkedKeys={checkedKeys}
              onCheck={onCheck}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
