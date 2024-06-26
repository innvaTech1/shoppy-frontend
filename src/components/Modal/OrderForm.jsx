import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CurrencyConvert from "../Shared/CurrencyConvert";

export default function OrderForm({ isOpen, onClose, product }) {
  const [quantity, setQuantity] = useState(1);
  const [districts, setDistricts] = useState([]);
  const [thanas, setThanas] = useState([]);
  const [subTotal, setSubTotal] = useState(product.offer_price);
  const [total, setTotal] = useState(product.offer_price);

  const [delivery, setDelivery] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState({});
  const [formData, setFormData] = useState({
    product_id: product.id,
    productQuantity: quantity,
    productPrice: product.offer_price,
    product_variant: [],
    name: "",
    phone: "",
    district: "",
    thana: "",
    address: "",
    orderNote: "",
    shipping_method_id: '',
    shippingFee: 0,
    discount: "",
    total: "",
  });

  const increment = () => {
    const val = product.offer_price * (quantity + 1);
    // set subtotal
    setSubTotal(val);
    setTotal(val + parseInt(formData.shippingFee));

    setQuantity((prev) => prev + 1);

  };
  const decrement = () => {
    if (quantity > 1) {

      const val = product.offer_price * (quantity - 1);
      // set subtotal
      setSubTotal(val);
      setTotal(val + parseInt(formData.shippingFee));
      setQuantity((prev) => prev - 1);
    }
  };

  useEffect(() => {
    // Fetch districts from API
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/user/state-by-country`) // Replace with your actual API endpoint
      .then((response) => response.json())
      .then((data) => setDistricts(data))
      .catch((error) => console.error("Error fetching districts:", error));
  }, []);

  useEffect(() => {
    if (formData.district) {
      // Fetch thanas based on selected district
      fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}api/user/city-by-state/${formData.district}`
      ) // Replace with your actual API endpoint
        .then((response) => response.json())
        .then((data) => setThanas(data))
        .catch((error) => console.error("Error fetching thanas:", error));
    }
  }, [formData.district]);

  // Shipping 
  useEffect(() => {
    // Fetch shippings from API
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/user/shipping-methods`) // Replace with your actual API endpoint
      .then((response) => response.json())
      .then((data) => setDelivery(data && data.shippings))
      .catch((error) => console.error("Error fetching shipping:", error));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // set sub total
    if (e.target.name === "shipping_method_id") {
      const shipping = delivery?.find(
        (item) => item.id === parseInt(e.target.value)
      );
      const shippingFee = shipping?.shipping_fee;
      setFormData({ ...formData, shippingFee: shippingFee, shipping_method_id: e.target.value });
      setTotal(parseFloat(subTotal) + parseInt(shippingFee));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // get the values
    const product_variant = Object.values(selectedVariant);

    const data = { ...formData, product_variant: product_variant, productQuantity: quantity }

    if (!data?.product_variant?.length && product.active_variants.length > 0) {
      toast.error("Please select a variant");
      return;
    }
    else if (!data.shipping_method_id) {
      toast.error("Please select a delivery method");
      return;
    }
    else if (!data.district) {
      toast.error("Please select a district");
      return;
    }
    else if (!data.thana) {
      toast.error("Please select a thana");
      return;
    }

    else if (!data.address) {
      toast.error("Please provide an address");
      return;
    }

    else if (!data.name) {
      toast.error("Please provide a name");
      return;
    }
    else if (!data.phone) {
      toast.error("Please provide a phone number");
      return;
    }


    const products = [{
      product_id: data.product_id,
      qty: data.productQuantity,
      variants: data.product_variant,
    }];

    data.products = products;
    data.total = total;

    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}api/user/place/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.order_id) {
          toast.success(data.message);
          onClose();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("Error placing order");
      })
  }


  // Modal scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;


  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-md shadow-lg max-w-2xl w-full max-h-full">
          <div className="relative p-6 overflow-y-auto max-h-[850px]">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-500 text-4xl rounded-full p-2"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">
              অর্ডার করার জন্য ফর্মটি পূরণ করুন...
            </h2>
            <hr />
            <form
              onSubmit={handleSubmit}
              className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md"
            >
              {/* <div className="mb-4">
                <label
                  htmlFor="productId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Product ID
                </label>
                <input
                  type="hidden"
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="productQuantity"
                  className="block text-sm font-medium text-gray-700"
                >
                  Product Quantity
                </label>
                <input
                  type="number"
                  name="productQuantity"
                  value={formData.productQuantity}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="productPrice"
                  className="block text-sm font-medium text-gray-700"
                >
                  Product Price
                </label>
                <input
                  type="number"
                  name="productPrice"
                  value={formData.productPrice}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div> */}
              <div className="my-3 flex flex-col space-y-3">
                <div className=" flex justify-between items-center">
                  <div className=" flex justify-start items-center gap-4">
                    <div className=" relative w-[50px] h-[50px] border rounded-md ">
                      <img
                        className=" w-12 h-12 p-1"
                        src={`${process.env.NEXT_PUBLIC_BASE_URL + product.thumb_image
                          }`}
                        alt={product.name}
                      />
                      <div className=" absolute -top-2 -right-2 bg-gray-500 w-5 h-5 rounded-full flex justify-center items-center text-white p-1">
                        {quantity}
                      </div>
                    </div>
                    <h1 className="text-xl font-bold">{product.name}</h1>
                  </div>
                  <div className="w-[120px] h-full px-[26px] flex items-center border border-qgray-border">
                    <div className="flex justify-between items-center w-full">
                      <button
                        onClick={decrement}
                        type="button"
                        className="text-base text-qgray"
                      >
                        -
                      </button>
                      <span className="text-qblack">{quantity}</span>
                      <button
                        onClick={increment}
                        type="button"
                        className="text-base text-qgray"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <h1 className="text-xl font-bold">
                    <CurrencyConvert price={product.offer_price} />
                  </h1>
                </div>
                <div className=" flex justify-between items-center gap-4">
                  {product.active_variants.map((variant, index) => {
                    return (
                      <div
                        key={index}
                        className="flex items-center w-1/2 gap-2"
                      >
                        <div>
                          <p>Select {variant?.name}:</p>
                        </div>
                        <select
                          name={variant?.name}
                          value={selectedVariant[variant?.name]}
                          id=""
                          className=" w-full border p-2"
                          onChange={(e) => {
                            setSelectedVariant({
                              ...selectedVariant,
                              [variant?.name]: e.target.value,
                            });

                          }}
                        >
                          <option value="">Select</option>
                          {variant.active_variant_items.map((value, index) => {

                            return (
                              <option value={value.id} key={value.id}>
                                {value.name}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    );
                  })}
                  {/* {product.productId && (
                    <select
                      name={`variantId${index}`}
                      value={item.variantId}
                      onChange={(e) =>
                        handleVariantChange(index, e.target.value)
                      }
                      className="select select-bordered w-full"
                    >
                      <option value="">Select Variant</option>
                      {variants[item.productId]?.map((variant) => (
                        <option key={variant.id} value={variant.id}>
                          {variant.name}
                        </option>
                      ))}
                    </select>
                  )} */}
                </div>
                <hr />
                <h1>ডেলিভারি চার্জ সিলেক্ট করুন..</h1>
                <div className=" flex flex-col">
                  {delivery?.map((item, index) => {
                    return (
                      <div key={index} className=" border p-3 my-1 rounded-md">
                        <label
                          htmlFor={`delivery${index}`}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <input
                              type="radio"
                              name="shipping_method_id"
                              id={`delivery${index}`}
                              value={item.id}
                              onChange={handleChange}
                            />
                            <span className="ml-2">{item.shipping_rule}</span>
                          </div>
                          <span>
                            <CurrencyConvert price={item.shipping_fee} />
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Order Summary */}
              <div className=" border rounded-md p-3">
                <div>
                  <p className=" flex justify-between items-center">
                    <strong>Sub Total</strong>
                    <span>
                      <CurrencyConvert price={subTotal} />
                    </span>
                  </p>
                  <hr />
                  <p className=" text-lg font-semibold  flex justify-between items-center">
                    <span>Total</span>
                    <span>
                      <CurrencyConvert price={total} />
                    </span>
                  </p>
                </div>
              </div>
              {/* Customer Info Form */}
              <div className=" mt-5">
                <div className=" flex justify-between items-center gap-3">
                  <div className="mb-4">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className=" flex justify-between items-center gap-3">
                  <div className="mb-4 w-full">
                    <label
                      htmlFor="district"
                      className="block text-sm font-medium text-gray-700"
                    >
                      District
                    </label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    >
                      <option value="">Select District</option>
                      {districts?.states?.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4 w-full">
                    <label
                      htmlFor="thana"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Thana
                    </label>
                    <select
                      name="thana"
                      value={formData.thana}
                      onChange={handleChange}
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                      disabled={!formData.district}
                    >
                      <option value="">Select Thana</option>
                      {thanas?.cities?.map((thana) => (
                        <option key={thana.id} value={thana.id}>
                          {thana.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    rows="1"
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="orderNote"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Order Note
                  </label>
                  <textarea
                    name="orderNote"
                    value={formData.orderNote}
                    onChange={handleChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                    rows="3"
                  ></textarea>
                </div>
                {/* <div className="mb-4">
                <label
                  htmlFor="shippingFee"
                  className="block text-sm font-medium text-gray-700"
                >
                  Shipping Fee
                </label>
                <input
                  type="number"
                  name="shippingFee"
                  value={formData.shippingFee}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="discount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Discount
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                />
              </div> */}
                <button
                  type="submit"
                  className=" w-full px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  Confirm your order
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
