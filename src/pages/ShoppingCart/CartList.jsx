import React from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  Layout,
  Card,
  Button,
  Divider,
  Typography,
  Space,
  Row,
  Col,
} from "antd";
import PropTypes from "prop-types";
import { useCartItem } from "../../hooks/cartItem";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function ShoppingCart({ userId }) {
  //fetching cart data
  const { data: cart, isLoading, error } = useCartItem(userId, `cart`);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading cart data</div>;

  const totalItems = cart?.cartDetails?.length || 0;
  const subtotal =
    cart?.cartDetails?.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ) || 0;

  const total = subtotal;

  return (
    <Layout>
      <Header style={{ background: "#fff", padding: "0 16px" }}>
        <Button type="link" icon={<ArrowLeftOutlined />}>
          Continue Shopping
        </Button>
      </Header>
      <Content style={{ padding: "0 50px" }}>
        <Row gutter={16}>
          <Col span={16}>
            <Card title="Shopping Cart" style={{ marginTop: 16 }}>
              {cart.cartDetails?.map((item, index) => (
                <React.Fragment key={item.cartDetailId}>
                  <CartItem item={item} />
                  {index < cart.cartDetails.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Card>
          </Col>
          <Col span={8}>
            <Card title="Summary" style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Text>Total Items</Text>
                  <Text>{totalItems}</Text>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Text>Subtotal</Text>
                  <Text>${subtotal.toFixed(2)}</Text>
                </div>
                <Divider />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Text strong>Total</Text>
                  <Text strong>${total.toFixed(2)}</Text>
                </div>
                <Button type="primary" block>
                  Checkout
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
ShoppingCart.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

// CartItem component with action logic commented out for now
function CartItem({ item }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div
          style={{
            width: 100,
            height: 100,
            background: "#f0f0f0",
            marginRight: 16,
          }}
        >
          {/* Placeholder for product image */}
        </div>
        <div style={{ flex: 1 }}>
          <Title level={4} style={{ marginBottom: 0 }}>
            {item.productName}
          </Title>
          <Text type="secondary">${item.price.toFixed(2)}</Text>
          <div style={{ marginTop: 8 }}>
            {/* Actions commented out */}
            {/* Color Selector */}
            {/* <Select value={item.color} style={{ width: 120 }} disabled /> */}
            {/* Quantity Input */}
            {/* <InputNumber value={item.quantity} disabled /> */}
          </div>
        </div>
        {/* Remove button commented out */}
        {/* <Button type="text" danger icon={<DeleteOutlined />} style={{ alignSelf: 'flex-start', marginTop: 8 }} /> */}
      </div>
      <Divider style={{ margin: "16px 0" }} />
    </>
  );
}
CartItem.propTypes = {
  item: PropTypes.shape({
    productName: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number,
    color: PropTypes.string,
  }).isRequired,
};
