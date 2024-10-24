import React from "react";
import { ArrowLeftOutlined, MinusOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, InputNumber, Select, Typography, Space, Empty } from "antd";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import GlobalLoading from "../../components/global/Loading";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_GateWay } from "../../utils/constants";

const { Title, Text } = Typography;
const { Option } = Select;

function CartItem({ item, updateQuantity, removeItem, updateColor }) {
  const { data: productDetailData } = useQuery(
    ["productDetailInCartUI", item.productId],
    async () => {
      const response = await authorizedAxiosInstance.get(`${API_GateWay}/gateway/products/Order/${item.productId}`);
      return response.data;
    },
    {
      staleTime: 120000,
      retry: false,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    }
  );

  const colorOptions = productDetailData?.product?.result?.color || [];
  const productObj = productDetailData?.product?.result?.product || {};
  console.log(colorOptions);

  return (
    <div className="flex items-center mb-4">
      <div className="w-24 h-24 bg-gray-200 mr-4 rounded-lg overflow-hidden">
        <img src={`https://raw.githubusercontent.com/Hvuthai/tesst/main/${productObj.imageUrl}`} alt="Product Image" className="object-cover w-full h-full" />
      </div>
      <div className="flex-1">
        <Title level={4} className="mb-0 text-sm md:text-base">
          {item.productName}
        </Title>
        <Text type="secondary">${item.price.toFixed(2)}</Text>
        <div className="mt-2">
          <Space>
            <Select value={item.color} className="w-32" onChange={(value, option) => updateColor(item.cartDetailId, value, option.productCategoryId)}>
              {colorOptions.map((color) => (
                //nsure that even if two colors are the same (e.g., "Black"),
                //they will have different keys when associated with different products.
                <Option key={`${color.productId}-${color.colorName}`} value={color.colorName} productCategoryId={color.productCategoryId}>
                  {color.colorName}
                </Option>
              ))}
            </Select>
            <div className="flex items-center">
              <Button icon={<MinusOutlined />} onClick={() => updateQuantity(item.cartDetailId, item.quantity - 1)} disabled={item.quantity === 1} />
              <InputNumber
                value={item.quantity}
                onChange={(value) => {
                  if (!isNaN(value) && value > 0) {
                    updateQuantity(item.cartDetailId, value);
                  }
                }}
                className="mx-2 w-16 text-center"
              />
              <Button icon={<PlusOutlined />} onClick={() => updateQuantity(item.cartDetailId, item.quantity + 1)} />
            </div>
          </Space>
        </div>
      </div>
      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(item.cartDetailId)} className="self-center ml-4 text-lg" />
    </div>
  );
}

CartItem.propTypes = {
  item: PropTypes.shape({
    cartDetailId: PropTypes.string.isRequired,
    productCategoryId: PropTypes.string.isRequired,
    productId: PropTypes.string.isRequired,
    productName: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  updateQuantity: PropTypes.func.isRequired,
  removeItem: PropTypes.func.isRequired,
  updateColor: PropTypes.func.isRequired,
};

function ShoppingCart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    }
  );

  const updateQuantityMutation = useMutation(
    async ({ cartHeader }) => {
      return await authorizedAxiosInstance.put(`${API_GateWay}/gateway/cart`, {
        cartHeader: cartHeader,
      });
    },
    {
      onSuccess: (data, { cartHeader }) => {
        queryClient.setQueryData(["cart"], (oldCartData) => {
          if (!oldCartData) return oldCartData;

          const updatedDetails = oldCartData.response.result.cartDetails.map((detail) =>
            detail.cartDetailId === cartHeader.cartDetails[0].cartDetailId ? { ...detail, quantity: cartHeader.cartDetails[0].quantity } : detail
          );

          return {
            ...oldCartData,
            response: {
              ...oldCartData.response,
              result: {
                ...oldCartData.response.result,
                cartDetails: updatedDetails,
              },
            },
          };
        });
      },
    }
  );

  const removeItemMutation = useMutation(
    async (cartDetailId) => {
      return await authorizedAxiosInstance.delete(`${API_GateWay}/gateway/cart/${cartDetailId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["cart"]);
      },
    }
  );

  const updateColorMutation = useMutation(
    async ({ cartHeader }) => {
      return await authorizedAxiosInstance.put(`${API_GateWay}/gateway/cart`, {
        cartHeader: cartHeader,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["cart"]);
      },
    }
  );

  const handleUpdateQuantity = (cartDetailId, newQuantity) => {
    if (newQuantity >= 1 && cartData?.response?.result) {
      const currentCart = cartData.response.result;
      const modifiedDetail = currentCart.cartDetails.find((detail) => detail.cartDetailId === cartDetailId);
      if (modifiedDetail) {
        const updatedCartHeader = {
          cartHeaderId: currentCart.cartHeader.cartHeaderId,
          cartDetails: [
            {
              ...modifiedDetail,
              quantity: newQuantity,
            },
          ],
        };
        updateQuantityMutation.mutate({ cartHeader: updatedCartHeader });
      }
    }
  };

  const handleRemoveItem = (cartDetailId) => {
    removeItemMutation.mutate(cartDetailId);
  };

  const handleUpdateColor = (cartDetailId, newColor, newProductCategoryId) => {
    if (cartData?.response?.result) {
      const currentCart = cartData.response.result;
      const modifiedDetail = currentCart.cartDetails.find((detail) => detail.cartDetailId === cartDetailId);
      if (modifiedDetail) {
        const updatedCartHeader = {
          cartHeaderId: currentCart.cartHeader.cartHeaderId,
          cartDetails: [
            {
              ...modifiedDetail,
              color: newColor,
              productCategoryId: newProductCategoryId,
            },
          ],
        };
        updateColorMutation.mutate({ cartHeader: updatedCartHeader });
      }
    }
  };

  const cart = cartData?.response?.result || { cartHeader: {}, cartDetails: [] };
  const totalItems = cart.cartDetails.length;
  const subtotal = cart.cartDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  return (
    <div className="bg-gray-100 min-h-screen">
      <GlobalLoading isLoading={isLoading} />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
          <header className="px-6 py-4 border-b border-gray-200">
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate("/dashboard")}>
              Continue Shopping
            </Button>
          </header>
          <main className="px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:space-x-8">
              <div className="w-full lg:w-2/3 mb-8 lg:mb-0">
                <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
                {totalItems === 0 ? (
                  <Empty description="Uh-oh! Your cart is feeling a bit lonely. Add some friends!" />
                ) : (
                  cart.cartDetails.map((item, index) => (
                    <React.Fragment key={item.cartDetailId}>
                      <CartItem item={item} updateQuantity={handleUpdateQuantity} removeItem={handleRemoveItem} updateColor={handleUpdateColor} />
                      {index < cart.cartDetails.length - 1 && <hr className="my-4" />}
                    </React.Fragment>
                  ))
                )}
              </div>
              <div className="w-full lg:w-1/3">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-6">Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Items</span>
                      <span>{totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <hr className="my-4" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <Button type="primary" block className="mt-6" disabled={totalItems === 0} onClick={() => navigate("/CartCheckout")}>
                      Checkout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCart;
