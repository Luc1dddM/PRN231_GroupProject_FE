import PropTypes from "prop-types";
import { Row, Col, Image, Typography, Spin } from "antd";
import { useQuery } from "react-query";
import { authorizedAxiosInstance } from "../../../utils/authorizedAxios";
import { API_GateWay } from "../../../utils/constants";

const { Text } = Typography;

function CartItemSummary({ item }) {
  // Fetch product details for this specific item
  const {
    data: productDetail,
    isLoading,
    error,
  } = useQuery(
    [`product-${item.productId}`, item.productId], // Unique query key for each product
    async () => {
      const response = await authorizedAxiosInstance.get(`${API_GateWay}/gateway/products/Order/${item.productId}`);
      return response.data;
    },
    {
      staleTime: 300000, // Cache for 5 minutes
      retry: false,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    }
  );

  if (isLoading) {
    return (
      <Row gutter={16} style={{ marginBottom: "16px" }}>
        <Col span={24} style={{ textAlign: "center" }}>
          <Spin size="small" />
        </Col>
      </Row>
    );
  }

  if (error) {
    return (
      <Row gutter={16} style={{ marginBottom: "16px" }}>
        <Col span={24}>
          <Text type="danger">Error loading product details</Text>
        </Col>
      </Row>
    );
  }

  console.log("product detail: ", productDetail);
  const productObj = productDetail?.product?.result?.product || {};
  return (
    <Row gutter={16} style={{ marginBottom: "16px" }}>
      <Col span={6}>
        <Image src={`https://raw.githubusercontent.com/Hvuthai/tesst/main/${productObj.imageUrl}`} alt={item.productName} width={80} height={80} />
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
  );
}

// Props validation
CartItemSummary.propTypes = {
  item: PropTypes.shape({
    productId: PropTypes.string.isRequired,
    productName: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  productDetail: PropTypes.shape({
    imageUrl: PropTypes.string.isRequired,
  }),
};

export default CartItemSummary;
