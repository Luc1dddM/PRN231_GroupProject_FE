import axios from "axios"; // Import axios for calling the 3rd parites API
import { useState, useEffect } from "react";
import { Form, Input, Select, Radio, Button, Card, Row, Col, Typography, Space, Divider, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_GateWay } from "../../utils/constants";
import CartItemSummary from "../../components/partial/ShoppingCart/CartItemSummary";

const { Option } = Select;
const { Title, Text } = Typography;

function CartCheckout() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [couponCode, setCouponCode] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  //--------------------------------------------------3RD-Parties API Calling start-------------------------------------------------------//
  //---------------------------API Calling start----------------------------//
  //function to call the 3rd party API for provinces
  const callAPIProvince = async () => {
    try {
      const response = await axios.get("https://vapi.vnappmob.com/api/province", {
        headers: {
          Accept: "application/json",
        },
      });
      console.log("API Response:", response.data.results);
      setProvinces(response.data.results);
    } catch (error) {
      console.log("Error fetching provinces:", error);
    }
  };

  console.log("this is provinces: ", provinces);

  //function to call the 3rd-party API for districts
  const callAPIDistrict = async (province_id) => {
    try {
      const response = await axios.get(`https://vapi.vnappmob.com/api/province/district/${province_id}`);
      setDistricts(response.data.results);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  //function to call the 3rd party API for wards
  const callAPIWard = async (district_id) => {
    try {
      const response = await axios.get(`https://vapi.vnappmob.com/api/province/ward/${district_id}`);
      setWards(response.data.results);
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };
  //---------------------------API Calling end----------------------------//

  //---------------------------Handle data changed start----------------------------//
  //handle changes for Province
  const handleProvinceChange = (value, option) => {
    const provinceId = option["data-id"];
    // Clear district and ward form fields
    form.setFieldsValue({ District: undefined, Ward: undefined });
    // Reset district and ward states
    setDistricts([]);
    setWards([]);
    callAPIDistrict(provinceId); // Call districts based on selected province
  };

  // handle changes for District
  const handleDistrictChange = (value, option) => {
    const districtId = option["data-id"];
    // Clear ward form fields
    form.setFieldsValue({ Ward: undefined });
    // Reset ward states
    setWards([]);
    callAPIWard(districtId); // Call wards based on selected district
  };

  console.log("state of current district: ", districts);
  //---------------------------Handle data changed end----------------------------//

  useEffect(() => {
    callAPIProvince();
    calculateEstimatedDelivery();
  }, []);
  //--------------------------------------------------3RD-Parties API Calling end-------------------------------------------------------//

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
  console.log("Cart Data Status:", {
    isCartDataAvailable: !!cartData,
    cartDetailsExist: !!cartData?.response?.result?.cartDetails,
    cartDetailsLength: cartData?.response?.result?.cartDetails?.length,
  });

  const applyCoupon = () => {
    console.log("Applying coupon:", couponCode);
  };

  //handle checkout
  const checkoutMutation = useMutation(async (checkoutData) => {
    // Transform the checkout data to match backend DTO
    const cartCheckoutDto = {
      userName: checkoutData.email, // Assuming email is used as username
      customerId: "00000000-0000-0000-0000-000000000000", // This should be properly set based on your auth system
      totalPrice: totalAmount,
      couponCode: checkoutData.couponCode || "",
      firstName: checkoutData.firstName,
      lastName: checkoutData.lastName,
      phone: checkoutData.phone,
      emailAddress: checkoutData.email,
      addressLine: checkoutData.addressLine,
      city: checkoutData.province, // Using province as city
      district: checkoutData.district,
      ward: checkoutData.ward,
      payment: checkoutData.payment,
    };

    const response = await authorizedAxiosInstance.post(
      `${API_GateWay}/gateway/cart/checkout`,
      { cartCheckoutDto } // Wrap in object to match Command structure
    );
    return response.data;
  });

  const onFinish = (values) => {
    console.log("Form submitted with values: ", values); // Add this for debugging
    try {
      // Gather the checkout data from form values and coupon code
      const checkoutData = {
        firstName: values.FirstName,
        lastName: values.LastName,
        phone: values.Phone,
        email: values.EmailAddress,
        addressLine: values.AddressLine,
        province: values.Province,
        district: values.District,
        ward: values.Ward,
        payment: values.Payment,
        couponCode: couponCode, // Add the coupon code
      };

      // Call the mutation to send the checkout data
      checkoutMutation.mutate(checkoutData, {
        onSuccess: (data) => {
          // Handle successful checkout, e.g., navigate to order confirmation page
          console.log("Checkout successful!", data);
          navigate("/OrderConfirmation", { state: { orderData: data } });
        },
        onError: (error) => {
          // Handle error, show message to the user
          console.error("Checkout failed", error.response?.data?.message);
        },
      });
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  // Function to calculate the estimated delivery date (7 days from now)
  const calculateEstimatedDelivery = () => {
    const today = new Date();
    const estimatedDate = new Date(today.setDate(today.getDate() + 7));
    const options = { year: "numeric", month: "long", day: "numeric" };
    setEstimatedDeliveryDate(estimatedDate.toLocaleDateString(undefined, options));
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
              <Form form={form} layout="vertical" onFinish={onFinish}>
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
                    <Form.Item name="Province" label="Province" rules={[{ required: true }]}>
                      <Select placeholder="Select Province" onChange={handleProvinceChange}>
                        {provinces.map((province) => (
                          <Option key={province.province_id} value={province.province_name} data-id={province.province_id}>
                            {province.province_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item name="District" label="District" rules={[{ required: true }]}>
                      <Select placeholder="Select district" onChange={handleDistrictChange}>
                        {districts.map((district) => (
                          <Option key={district.district_id} value={district.district_name} data-id={district.district_id}>
                            {district.district_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item name="Ward" label="Ward" rules={[{ required: true }]}>
                      <Select placeholder="Select ward">
                        {wards.map((ward) => (
                          <Option key={ward.ward_id} value={ward.ward_name}>
                            {ward.ward_name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="Payment" label="Payment Method" rules={[{ required: true }]}>
                  <Radio.Group>
                    <Radio value="Cash On Delivery">Cash On Delivery</Radio>
                  </Radio.Group>
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="Order Summary">
              {/*we only get the image from the productDetailData the rest properties get from the cartData*/}
              {isLoading ? <Spin /> : cartData?.response?.result?.cartDetails?.map((item, index) => <CartItemSummary key={index} item={item} />)}
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
              {/* Estimated Delivery Date */}
              <Row>
                <Col span={18}>
                  <Text>Estimated Delivery: </Text>
                  <Text strong>{estimatedDeliveryDate}</Text>
                </Col>
              </Row>
              <Divider />
              <Button onClick={() => form.submit()} type="primary" size="large" style={{ width: "100%", marginTop: "16px" }}>
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
