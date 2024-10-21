import { Button, Input, Select, Divider, message } from "antd";
import { ArrowLeftOutlined, ShoppingCartOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "react-query";
import { authorizedAxiosInstance } from "../../utils/authorizedAxios";
import { API_GateWay } from "../../utils/constants";
import GlobalLoading from "../../components/global/Loading";
import { useParams } from "react-router-dom";

const { Option } = Select;

function ProductDetail() {
  const { id } = useParams(); // Get the product id from the route on App.jsx
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null); // State for the selected color
  const [selectedColorId, setSelectedColorId] = useState(null); // New state for color ID
  const [stock, setStock] = useState(0); // State for the stock of the selected color
  const [isSubmitting, setIsSubmitting] = useState(false);

  //Get data product detail------------------------------
  const { data: productDetailData, isLoading } = useQuery(
    ["productDetail", id],
    async () => {
      const response = await authorizedAxiosInstance.get(`${API_GateWay}/gateway/products/Order/${id}`);
      return response.data;
    },
    {
      staleTime: 120000,
      retry: false,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    }
  );
  //-------------------------------------------------------

  // Memoize the colorsView to avoid unnecessary re-renders
  const colorsView = useMemo(() => productDetailData?.product?.result?.color || [], [productDetailData]);
  // Define a safe product variable, defaulting to an empty object in case data is not yet loaded
  const productView = productDetailData?.product?.result?.product || {};

  //handle action----------------------------------------
  useEffect(() => {
    if (colorsView.length > 0 && !selectedColor) {
      // Added check for !selectedColor
      setSelectedColor(colorsView[0].colorName);
      setSelectedColorId(colorsView[0].productCategoryId);
      setStock(colorsView[0].quantity);
    }
  }, [colorsView, selectedColor]); // Added selectedColor to dependencies

  const handleColorChange = (value) => {
    const selected = colorsView.find((color) => color.colorName === value);
    console.log("test", selected.categoryId);
    if (selected) {
      // Added safety check
      setSelectedColor(selected.colorName);
      setSelectedColorId(selected.productCategoryId);
      setStock(selected.quantity);
    }
  };

  const increaseQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedColorId) {
      message.error("Please select a color");
      return;
    }

    if (quantity > stock) {
      message.error("Quantity exceeds available stock");
      return;
    }

    setIsSubmitting(true);

    const cartData = {
      cartHeader: {
        cartDetails: [
          {
            productId: id,
            productName: productView.name,
            quantity: quantity,
            color: selectedColor,
            price: productView.price,
            productCategoryId: selectedColorId,
          },
        ],
      },
    };

    addToCartMutation.mutate(cartData);
  };
  //-------------------------------------------------------

  //Add to cart implement----------------------------------
  const addToCartMutation = useMutation(
    async (cartData) => {
      const response = await authorizedAxiosInstance.post(`${API_GateWay}/gateway/cart`, cartData);
      return response.data;
    },
    {
      onSuccess: () => {
        message.success("Product added to cart successfully!");
        setIsSubmitting(false);
      },
      onError: (error) => {
        message.error(error.response?.data?.message || "Failed to add product to cart");
        setIsSubmitting(false);
      },
    }
  );
  //-------------------------------------------------------
  return (
    <div className="bg-gray-100 min-h-screen">
      <GlobalLoading isLoading={isLoading} />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
          <header className="px-6 py-4 border-b border-gray-200">
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => (window.location.href = "/dashboard")}>
              Back to Dashboard
            </Button>
          </header>

          <main className="px-6 py-8">
            <div className="flex flex-col md:flex-row">
              {/* Product Image */}
              <div className="md:w-1/2 mb-4 md:mb-0">
                <img src={`https://raw.githubusercontent.com/Hvuthai/tesst/main/${productView.imageUrl}`} alt="Product Image" className="rounded-lg object-cover w-full h-full" />
              </div>

              {/* Product Details */}
              <div className="md:w-1/2 md:pl-8">
                <p className="text-sm text-gray-500 mb-2">In Stock: {stock}</p>
                <h1 className="text-3xl font-bold mb-2">{productView.name}</h1>
                <p className="text-2xl font-semibold text-blue-600 mb-4">${productView.price}</p>
                <p className="text-gray-700 mb-6">{productView.description}</p>

                <Divider />

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <Select value={selectedColor} onChange={handleColorChange} className="w-36">
                      {colorsView.map((color) => (
                        <Option key={color.categoryId} value={color.colorName}>
                          {color.colorName}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <div className="flex items-center">
                      <Button icon={<MinusOutlined />} onClick={decreaseQuantity} disabled={quantity === 1} />
                      <Input value={quantity} onChange={handleQuantityChange} className="mx-2 w-16 text-center" />
                      <Button icon={<PlusOutlined />} onClick={increaseQuantity} />
                    </div>
                  </div>

                  <Button
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    size="large"
                    className="w-full bg-blue-500 hover:bg-blue-600 border-none"
                    onClick={handleAddToCart}
                    loading={isSubmitting}
                    disabled={isSubmitting || stock === 0}
                  >
                    {stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
