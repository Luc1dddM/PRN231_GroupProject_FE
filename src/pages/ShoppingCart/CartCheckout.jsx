import { useState } from "react";
import { Form, Input, Select, Radio, Button, Card, Row, Col, Typography, Space, Image, Divider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_GateWay } from "../../utils/constants";

const { Option } = Select;
const { Title, Text } = Typography;

// Mock data for cart items
const cartItems = [
  { name: "Product 1", price: 100, color: "Red", quantity: 2, image: "/placeholder.svg?height=80&width=80" },
  { name: "Product 2", price: 150, color: "Blue", quantity: 1, image: "/placeholder.svg?height=80&width=80" },
];

function CartCheckout() {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  //call Cart API to get the cart detail
  const { data: cartData, isLoading } = useQuery(
    ["cart"],
    async () => {
      const response = await authorizedAxiosInstance.get(`${API_GateWay}/gateway/cart`);
      return response.data;
    },
    {
      staleTime: 120000,
      retry: false,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      onSuccess: (data) => {
        //cal the total amount for the current cart
        const total = data.response.result.cartDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotalAmount(total);
      },
    }
  );
  console.log(totalAmount);
  console.log("data: ", cartData);

  const { data: productDetailData } = useQuery(
    ["productDetails", cartData?.response?.result?.cartDetails],
    async () => {
      const productIds = cartData.response.result.cartDetails.map((item) => item.productId);
      const promises = productIds.map((id) => authorizedAxiosInstance.get(`${API_GateWay}/gateway/products/Order/${id}`));
      const results = await Promise.all(promises);
      return results.map((res) => res.data.product.result.product);
    },
    {
      enabled: !!cartData, // Only run query if cartData is available
    }
  );

  console.log("product data: ", productDetailData);

  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const applyCoupon = () => {
    console.log("Applying coupon:", couponCode);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: "1200px" }}>
        <Button icon={<ArrowLeftOutlined />} style={{ marginBottom: "24px" }} onClick={() => navigate("/Cart")}>
          Back to Cart
        </Button>
        <Row gutter={24}>
          <Col xs={24} lg={14}>
            <Card title="Shipping Details">
              <Form layout="vertical" onFinish={onFinish}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="FirstName" label="First Name" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="LastName" label="Last Name" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="Phone" label="Phone" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="EmailAddress" label="Email Address">
                  <Input />
                </Form.Item>
                <Form.Item name="AddressLine" label="Address Line" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="City" label="City" rules={[{ required: true }]}>
                      <Select placeholder="Select city">
                        <Option value="Tp.HCM">Tp.HCM</Option>
                        <Option value="Ha Noi">Ha Noi</Option>
                        <Option value="Da Nang">Da Nang</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="District" label="District" rules={[{ required: true }]}>
                      <Select placeholder="Select district">
                        <Option value="Quan 9">Quan 9</Option>
                        <Option value="Quan 1">Quan 1</Option>
                        <Option value="Quan 7">Quan 7</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="Ward" label="Ward" rules={[{ required: true }]}>
                      <Select placeholder="Select ward">
                        <Option value="Linh Trung">Linh Trung</Option>
                        <Option value="Ben Nghe">Ben Nghe</Option>
                        <Option value="Tan Phu">Tan Phu</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="CardName" label="Card Name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="CardNumber" label="Card Number" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="Expiration" label="Expiration" rules={[{ required: true }]}>
                      <Input placeholder="MM/YY" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="CVV" label="CVV" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="PaymentMethod" label="Payment Method" rules={[{ required: true }]}>
                  <Radio.Group>
                    <Radio value="Online Banking">Online Banking</Radio>
                    <Radio value="Paypal">Paypal</Radio>
                    <Radio value="Credit Card">Credit Card</Radio>
                  </Radio.Group>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="Order Summary">
              {/*we only get the image from the productDetailData the rest properties get from the cartData*/}
              {cartData?.response?.result?.cartDetails?.map((item, index) => (
                <Row key={index} gutter={16} style={{ marginBottom: "16px" }}>
                  <Col span={6}>
                    <Image src={`https://raw.githubusercontent.com/Hvuthai/tesst/main/${productDetailData[index].imageUrl}`} alt={item.productName} width={80} height={80} />
                  </Col>
                  <Col span={12}>
                    <Text className="text-base" strong>
                      {item.productName}
                    </Text>
                    <br />
                    <Text className="text-xs">Color: {item.color}</Text>
                    <br />
                    <Text className="text-xs">Quantity: {item.quantity}</Text>
                  </Col>
                  <Col span={6} style={{ textAlign: "right" }}>
                    <Text strong>${item.price * item.quantity}</Text>
                  </Col>
                </Row>
              ))}
              <Divider />
              <Row>
                <Col span={18}>
                  <Title level={4}>Total:</Title>
                </Col>
                <Col span={6} style={{ textAlign: "right" }}>
                  <Title level={4}>${totalAmount}</Title>
                </Col>
              </Row>
              <Space direction="vertical" style={{ width: "100%", marginTop: "16px" }}>
                <Input placeholder="Enter Coupon Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                <Button onClick={applyCoupon} block>
                  Apply Coupon
                </Button>
              </Space>
              <Divider />
              <Button type="primary" size="large" style={{ width: "100%", marginTop: "16px" }}>
                Checkout
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default CartCheckout;
