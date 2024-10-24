import { Card, Typography, Divider, List, Button, Space } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

function OrderConfirmation() {
  const navigate = useNavigate();
  const { state: { orderData } = {} } = useLocation();
  const { response: { result } = {} } = orderData || {};

  const order = {
    date: new Date(result?.occurredOn || new Date()).toLocaleDateString(),
    total: result?.totalPrice,
    items: result?.cartItems,
    shippingAddress: result ? `${result.addressLine}, ${result.ward}, ${result.district}, ${result.city}` : "",
  };

  const renderOrderInfo = (label, value) => (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Text strong>{label}</Text>
      <Text>{value}</Text>
    </div>
  );

  return (
    <Card style={{ maxWidth: "600px", margin: "0 auto", padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div style={{ textAlign: "center" }}>
          <CheckCircleOutlined style={{ fontSize: "48px", color: "#52c41a" }} />
          <Title level={2}>Order Confirmed</Title>
          <Text type="secondary">Thank you for your purchase!</Text>
        </div>

        {renderOrderInfo("Order Date:", order.date)}

        <Space direction="vertical" style={{ width: "100%" }}>
          <Title level={5}>Shipping Address:</Title>
          <Text>{order.shippingAddress}</Text>
        </Space>

        <Divider />

        <Space direction="vertical" style={{ width: "100%" }}>
          <Title level={4}>Order Summary</Title>
          <List
            dataSource={order.items}
            renderItem={(item) => (
              <List.Item style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <Text>
                  {item.productName}
                  <br />
                  Color: {item.color}
                  <br />
                  Quantity: {item.quantity}
                </Text>
                <Text>${(item.price * item.quantity).toFixed(2)}</Text>
              </List.Item>
            )}
          />
        </Space>

        <Divider />

        {renderOrderInfo("Total:", `$${order.total.toFixed(2)}`)}

        <div style={{ textAlign: "center" }}>
          <Button type="primary" onClick={() => navigate("/dashboard")}>
            To Homepage
          </Button>
        </div>
      </Space>
    </Card>
  );
}

export default OrderConfirmation;
