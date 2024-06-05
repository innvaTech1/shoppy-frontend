import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import apiRequest from "../../../utils/apiRequest";
import auth from "../../../utils/auth";
import wordCount from "../../../utils/wordCount";
import { fetchCart } from "../../store/Cart";
import InputCom from "../Helpers/InputCom";
import LoaderStyleOne from "../Helpers/Loaders/LoaderStyleOne";
import PageTitle from "../Helpers/PageTitle";
import Selectbox from "../Helpers/Selectbox";
// import { PayPalButton } from "react-paypal-button-v2";
import isAuth from "../../../Middleware/isAuth";
import DateFormat from "../../../utils/DateFormat";
import settings from "../../../utils/settings";
import ServeLangItem from "../Helpers/ServeLangItem";
import CheckProductIsExistsInFlashSale from "../Shared/CheckProductIsExistsInFlashSale";
import CurrencyConvert from "../Shared/CurrencyConvert";

function CheakoutPage() {
  const { websiteSetup } = useSelector((state) => state.websiteSetup);
  const { currency_icon } = settings();
  const router = useRouter();
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const [carts, setCarts] = useState(null);
  const [fName, setFname] = useState("");
  const [lName, setlname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [home, setHome] = useState(true);
  const [office, setOffice] = useState(false);
  const [stateDropdown, setStateDropdown] = useState(null);
  const [state, setState] = useState(null);
  const [cityDropdown, setCityDropdown] = useState(null);
  const [city, setcity] = useState(null);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState(null);
  const [activeAddress, setActiveAddress] = useState("billing");
  const [newAddress, setNewAddress] = useState(false);
  const [selectedShipping, setShipping] = useState(null);
  const [selectedBilling, setBilling] = useState(null);
  const [subTotal, setSubTotal] = useState(null);
  const [shippingRules, setShipppingRules] = useState(null);
  const [shippingRulesByCityId, setShippingRulesByCityId] = useState([]);
  const [selectPayment, setPaymentMethod] = useState(null);
  //selectdRule store shipping price
  const [selectedRule, setSelectedRule] = useState(null);
  const [shippingCharge, setShippingCharge] = useState(null);
  //TODO: stripe datas
  const [strpeNumber, setStrpeNumber] = useState("");
  const [expireDate, setExpireDate] = useState(null);
  const [cvv, setCvv] = useState("");
  const [cardHolderName, setHolderName] = useState("");
  const [stripeError, setStrpError] = useState(null);
  const [strpLoad, setStrpLoading] = useState(false);
  // const [paypalData, setPaypalData] = useState(null);
  const [inputCoupon, setInputCoupon] = useState("");
  const [couponCode, setCouponCode] = useState(null);
  // const [totalAmountWithCalc, setTotalAmountWithCalc] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);
  const [bkashInfo, setBkashInfo] = useState(null);
  const [rocketInfo, setRocketInfo] = useState(null);
  const [nagadInfo, setNagadInfo] = useState(null);

  const [discountCoupon, setDiscountCoupon] = useState(0);
  useEffect(() => {
    if (couponCode) {
      if (couponCode.offer_type === "2") {
        let price = totalPrice - parseInt(couponCode.discount);
        setDiscountCoupon(totalPrice - price);
      } else {
        //discout =10%
        // let price = (parseInt(totalPrice) / 100) * couponCode.discount;
        // setDiscountCoupon(totalPrice - price);
        let discount =
          (parseInt(couponCode.discount) / 100) * parseInt(totalPrice);
        setDiscountCoupon(discount);
      }
    }
  }, [couponCode, totalPrice]);
  const [transactionInfo, setTransactionInfo] = useState("");
  // useEffect(() => {
  //   if (transactionInfo && transactionInfo !== "") {
  //     setPaymentMethod("bankpayment");
  //   }
  // }, [transactionInfo]);

  //bank status
  const [cashOnDeliveryStatus, setCashOnDeliveryStatus] = useState(null);
  const [bkashStatus, setBkashStatus] = useState(null);
  const [rocketStatus, setRocketStatus] = useState(null);
  const [nagadStatus, setNagadStatus] = useState(null);

  const [bankPaymentStatus, setBankPaymentStatus] = useState(null);
  const [totalWeight, setTotalWeight] = useState(null);
  const [totalQty, setQty] = useState(null);

  const priceWithCoupon = (price) => {
    if (couponCode) {
      return (price / 100) * couponCode.discount;
    } else {
      return price;
    }
  };
  const submitCoupon = () => {
    if (auth()) {
      apiRequest
        .applyCoupon(auth().access_token, inputCoupon)
        .then((res) => {
          setInputCoupon("");
          if (res.data) {
            if (totalPrice >= parseInt(res.data.coupon.min_purchase_price)) {
              setCouponCode(res.data.coupon);
              localStorage.setItem(
                "coupon",
                JSON.stringify(res.data && res.data.coupon)
              );
              let currDate = new Date().toLocaleDateString();
              localStorage.setItem("coupon_set_date", currDate);

              toast.success(ServeLangItem()?.Coupon_Applied);
            } else {
              toast.error("Your total price not able to apply coupon");
            }
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error(err.response && err.response.data.message);
        });
    } else {
      return false;
    }
  };
  const dateHandler = (e) => {
    setExpireDate({
      value: e.target.value,
      formated: DateFormat(e.target.value, false),
    });
  };
  const getAllAddress = () => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_BASE_URL}api/user/checkout?token=${auth().access_token
        }`
      )
      .then((res) => {
        const { cartProducts } = res.data;
        setCashOnDeliveryStatus(
          !!(
            res.data &&
            res.data.bankPaymentInfo &&
            parseInt(res.data.bankPaymentInfo.cash_on_delivery_status) === 1
          )
        );
        setBankPaymentStatus(
          !!(
            res.data &&
            res.data.bankPaymentInfo &&
            parseInt(res.data.bankPaymentInfo.status) === 1
          )
        );
        setBkashStatus(
          !!(
            res.data &&
            res.data.bkash &&
            parseInt(res.data.bkash.status) === 1
          )
        );
        setRocketStatus(
          !!(
            res.data &&
            res.data.rocket &&
            parseInt(res.data.rocket.status) === 1
          )
        );
        setNagadStatus(
          !!(
            res.data &&
            res.data.nagad &&
            parseInt(res.data.nagad.status) === 1
          )
        );
        setBankInfo(
          res.data && res.data.bankPaymentInfo && res.data.bankPaymentInfo
        );

        // set mobile banking info
        setBkashInfo(res.data && res.data.bkash && res.data.bkash);
        setRocketInfo(res.data && res.data.rocket && res.data.rocket);
        setNagadInfo(res.data && res.data.nagad && res.data.nagad);


        setShipppingRules(res.data && res.data.shippings);
        setShippingRulesByCityId(() => {
          return res.data &&
            res.data.shippings.length > 0 &&
            res.data.shippings.filter((s) => parseInt(s.city_id) === 0);
        });
        res.data && setAddresses(res.data?.addresses);
        setShipping(res.data && res.data?.addresses[0]?.id);
        setBilling(res.data && res.data?.addresses[0]?.id);
        const cp = localStorage.getItem("coupon");
        if (cp) {
          let crrDate = new Date().toLocaleDateString();
          let storeDate = localStorage.getItem("coupon_set_date");
          if (crrDate === storeDate) {
            let dataK = JSON.parse(cp);
            setCouponCode(dataK);
          } else {
            localStorage.removeItem("coupon_set_date");
            localStorage.removeItem("coupon");
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    if (auth()) {
      getAllAddress();
    }
    getState();
  }, []);
  const getState = () => {
    if (auth()) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BASE_URL}api/user/state-by-country?token=${auth().access_token}`
        )
        .then((res) => {
          setCityDropdown(null);
          setStateDropdown(res.data && res.data.states);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return false;
    }
  };
  const getcity = (value) => {
    if (auth() && value) {
      setState(value.id);
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BASE_URL}api/user/city-by-state/${value.id
          }?token=${auth().access_token}`
        )
        .then((res) => {
          setCityDropdown(res.data && res.data.cities);
        })
        .catch((err) => {
          console.log(err.response);
        });
    } else {
      return false;
    }
  };
  const selectCity = (value) => {
    if (auth() && value) {
      setcity(value.id);
    }
  };
  const saveAddress = async () => {
    setLoading(true);
    axios
      .post(
        `${process.env.NEXT_PUBLIC_BASE_URL}api/user/address/store?token=${auth().access_token
        }`,
        {
          name: fName && lName ? fName + " " + lName : null,
          email: email,
          phone: phone,
          address: address,
          type: home ? home : office ? office : null,
          state: state,
          city: city,
        }
      )
      .then((res) => {
        setLoading(false);
        setFname("");
        setlname("");
        setEmail("");
        setPhone("");
        setAddress("");
        setCityDropdown(null);
        setErrors(null);
        getAllAddress();
        setNewAddress(false);
        toast.success('created', {
          autoClose: 1000,
        });
      })
    // if (auth()) {
    //   apiRequest
    //     .saveAddress(auth().access_token, {
    //       name: fName && lName ? fName + " " + lName : null,
    //       email: email,
    //       phone: phone,
    //       address: address,
    //       type: home ? home : office ? office : null,
    //       state: state,
    //       city: city,
    //     })
    //     .then((res) => {
    //       setLoading(false);
    //       setFname("");
    //       setlname("");
    //       setEmail("");
    //       setPhone("");
    //       setAddress("");
    //       setCityDropdown(null);
    //       setErrors(null);
    //       getAllAddress();
    //       setNewAddress(false);
    //       toast.success(res.data && res.data.notification, {
    //         autoClose: 1000,
    //       });
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //       setLoading(false);
    //       err.response && setErrors(err.response.data.errors);
    //       if(err.response.status===403){
    //         toast.error( err.response.data.message);
    //       }
    //     });
    // } else {
    //   return false;
    // }
  };
  // parseInt(item.qty)
  useEffect(() => {
    setCarts(cart && cart.cartProducts);
    //total weight
    const ttwList =
      cart &&
      cart.cartProducts.length > 0 &&
      cart.cartProducts.map(
        (item) => parseInt(item.product.weight) * parseInt(item.qty)
      );
    const ttw =
      ttwList &&
      ttwList.length > 0 &&
      ttwList.reduce((prev, curr) => parseInt(prev) + parseInt(curr), 0);
    setTotalWeight(ttw && ttw);
    //total qty
    const tqList =
      cart &&
      cart.cartProducts.length > 0 &&
      cart.cartProducts.map((item) => parseInt(item.qty));
    const tq =
      tqList &&
      tqList.length > 0 &&
      tqList.reduce((prev, curr) => parseInt(prev) + parseInt(curr), 0);
    setQty(tq && tq);
  }, [cart]);
  const checkProductExistsInFlashSale = (id, price) => {
    if (websiteSetup) {
      const flashSaleOffer =
        websiteSetup.payload.flashSale && websiteSetup.payload.flashSale.offer;
      const flashSaleIds =
        websiteSetup.payload.flashSaleProducts.length > 0 &&
        websiteSetup.payload.flashSaleProducts.find(
          (item) => parseInt(item.product_id) === parseInt(id)
        );
      if (flashSaleOffer && flashSaleIds) {
        const offer = parseInt(flashSaleOffer);
        const discountPrice = (offer / 100) * price; //confusion
        const mainPrice = price - discountPrice;
        return mainPrice;
      } else {
        return price;
      }
    }
  };
  const totalPrice = subTotal && subTotal.reduce((prev, curr) => prev + curr);
  useEffect(() => {
    if (carts && carts.length > 0) {
      setSubTotal(
        carts.map((v) => {
          let prices = [];
          v.variants.map(
            (item) =>
              item.variant_item &&
              prices.push(parseFloat(item.variant_item.price))
          );
          const sumCal = prices.length > 0 && prices.reduce((p, c) => p + c);
          if (v.product.offer_price) {
            if (v.variants && v.variants.length > 0) {
              const v_price = sumCal + parseFloat(v.product.offer_price);

              const checkFlshPrdct = checkProductExistsInFlashSale(
                v.product_id,
                v_price
              );
              return checkFlshPrdct * v.qty;
              // return checkProductExistsInFlashSale(v.product_id, v_price);
            } else {
              const wo_v_price = checkProductExistsInFlashSale(
                v.product_id,
                parseFloat(v.product.offer_price)
              );
              return wo_v_price * v.qty;
            }
          } else {
            if (v.variants && v.variants.length > 0) {
              const v_price = sumCal + parseFloat(v.product.price);
              const checkFlshPrdct = checkProductExistsInFlashSale(
                v.product_id,
                v_price
              );
              return checkFlshPrdct * v.qty;
            } else {
              const wo_v_price = checkProductExistsInFlashSale(
                v.product_id,
                parseFloat(v.product.price)
              );
              return wo_v_price * v.qty;
            }
          }
        })
      );
    }
  }, [carts]);
  const [mainTotalPrice, setMainTotalPrice] = useState(null);
  useEffect(() => {
    if (shippingCharge) {
      setMainTotalPrice(totalPrice + parseInt(shippingCharge));
    } else {
      setMainTotalPrice(totalPrice);
    }
  });
  const price = (item) => {
    if (item) {
      if (item.product.offer_price) {
        if (item.variants && item.variants.length > 0) {
          const prices = item.variants.map((item) =>
            item.variant_item ? parseInt(item.variant_item.price) : 0
          );
          const sumVarient = prices.reduce((p, c) => p + c);
          const sum = parseInt(item.product.offer_price) + parseInt(sumVarient);
          return sum * parseInt(item.qty);
        } else {
          return parseFloat(item.product.offer_price) * item.qty;
        }
      } else {
        if (item.variants && item.variants.length > 0) {
          const prices = item.variants.map((item) =>
            item.variant_item ? parseInt(item.variant_item.price) : 0
          );
          const sumVarient = prices.reduce((p, c) => p + c);
          const sum = parseInt(item.product.price) + parseInt(sumVarient);
          return sum * parseInt(item.qty);
        } else {
          return item.product.price * item.qty;
        }
      }
    }
  };
  const shippingHandler = (addressId, cityId) => {
    setShipping(addressId);
    const getRules =
      shippingRules &&
      shippingRules.filter((f) => parseInt(f.city_id) === cityId);
    const defaultRule = shippingRules.filter(
      (item) => parseInt(item.city_id) === 0
    );
    if (getRules && getRules.length > 0) {
      const isIncluded = shippingRulesByCityId.some((value) =>
        getRules.includes(value)
      );
      if (isIncluded) {
        return setShippingRulesByCityId([...defaultRule, ...getRules]);
      } else {
        if (shippingRulesByCityId.length > 0) {
          setShippingRulesByCityId([...defaultRule, ...getRules]);
        } else {
          setShippingRulesByCityId((prev) => [...prev, ...getRules]);
        }
      }
    } else {
      const defaultRule = shippingRules.filter(
        (item) => parseInt(item.city_id) === 0
      );
      setShippingRulesByCityId(defaultRule);
    }
  };
  useEffect(() => {
    if (
      addresses &&
      addresses.length > 0 &&
      shippingRules &&
      shippingRules.length > 0
    ) {
      shippingHandler(
        parseInt(addresses[0].id),
        parseInt(addresses[0].city_id)
      );
    }
  }, [shippingRules, addresses]);

  const selectedRuleHandler = (e, price) => {
    setSelectedRule(e.target.value);
    setShippingCharge(price);
  };
  //delete address
  const deleteAddress = (id) => {
    if (auth()) {
      apiRequest
        .deleteAddress(id, auth().access_token)
        .then((res) => {
          toast.success(res.data && res.data.notification);
          getAllAddress();
        })
        .catch((err) => {
          console.log(err);
          toast.error(err.response && err.response.data.notification);
        });
    }
  };
  //=================placeOrder
  const placeOrderHandler = async () => {
    if (auth()) {
      if (selectedBilling && selectedShipping) {
        if (selectedRule) {
          if (selectPayment) {
            if (selectPayment && selectPayment === "cashOnDelivery") {
              await apiRequest
                .cashOnDelivery(
                  {
                    shipping_address_id: selectedShipping,
                    billing_address_id: selectedBilling,
                    shipping_method_id: parseInt(selectedRule),
                    coupon: couponCode && couponCode.code,
                  },
                  auth().access_token
                )
                .then((res) => {
                  if (res.data) {
                    toast.success(res.data.message);
                    router.push(`/order/${res.data.order_id}`);
                    dispatch(fetchCart());
                    localStorage.removeItem("coupon_set_date");
                    localStorage.removeItem("coupon");
                  }
                })
                .catch((err) => {
                  console.log(err);
                  toast.success(err.response && err.response.message);
                });
            } else if (selectPayment && (selectPayment === "bankpayment" || selectPayment === 'bkashpayment' || selectPayment === 'rocketpayment' || selectPayment === 'nagadpayment')) {
              await apiRequest
                .bankPayment(
                  {
                    shipping_address_id: selectedShipping,
                    billing_address_id: selectedBilling,
                    shipping_method_id: parseInt(selectedRule),
                    tnx_info: transactionInfo,
                    coupon: couponCode && couponCode.code,
                    type: selectPayment,
                  },
                  auth().access_token
                )
                .then((res) => {
                  if (res.data) {
                    toast.success(res.data.message);
                    router.push(`/order/${res.data.order_id}`);
                    dispatch(fetchCart());
                    localStorage.removeItem("coupon_set_date");
                    localStorage.removeItem("coupon");
                  }
                })
                .catch((err) => {
                  console.log(err);
                  toast.success(err.response && err.response.message);
                });
            } else if (selectPayment && selectPayment === "sslcommerce") {
              const url = `${process.env.NEXT_PUBLIC_BASE_URL
                }user/checkout/sslcommerz-web-view?token=${auth().access_token
                }&shipping_method_id=${parseInt(
                  selectedRule
                )}&shipping_address_id=${selectedShipping}&coupon=${couponCode && couponCode.code
                }&billing_address_id=${selectedBilling}&request_from=react_web&frontend_success_url=${typeof window !== "undefined" && window.location.origin
                  ? window.location.origin + "/order/"
                  : ""
                }&frontend_faild_url=${typeof window !== "undefined" && window.location.origin
                  ? window.location.origin + "/payment-faild"
                  : ""
                }`;

              router.push(url);
              localStorage.removeItem("coupon_set_date");
              localStorage.removeItem("coupon");
            } else {
              toast.error(ServeLangItem()?.Select_your_payment_system);
            }
          } else {
            toast.error(ServeLangItem()?.Please_Select_Your_Payment_Method);
          }
        } else {
          toast.error(ServeLangItem()?.Please_Select_Shipping_Rule);
        }
      }
    }
  };

  return (
    <>
      {carts && (
        <div className="checkout-page-wrapper w-full bg-white pb-[60px]">
          <div className="w-full mb-5">
            <PageTitle
              title="Checkout"
              breadcrumb={[
                { name: ServeLangItem()?.home, path: "/" },
                { name: ServeLangItem()?.Checkout, path: "/checkout" },
              ]}
            />
          </div>
          <div className="checkout-main-content w-full">
            <div className="container-x mx-auto">
              <div className="w-full lg:flex lg:space-x-[30px] rtl:space-x-reverse">
                <div className="lg:w-4/6 w-full">
                  <h1 className="sm:text-2xl text-xl text-qblack font-medium mt-5 mb-5">
                    {ServeLangItem()?.Addresses}
                  </h1>
                  {!newAddress && (
                    <div className="addresses-widget w-full">
                      <div className="sm:flex justify-between items-center w-full mb-5">
                        <div className="bg-qyellowlow/10 border border-qyellow rounded p-2">
                          <button
                            onClick={() => setActiveAddress("billing")}
                            type="button"
                            className={`px-4 py-3 text-md font-medium rounded-md  ${activeAddress === "billing"
                              ? "text-qblack bg-qyellow"
                              : "text-qyellow"
                              } `}
                          >
                            {ServeLangItem()?.Billing_Address}
                          </button>
                          <button
                            onClick={() => setActiveAddress("shipping")}
                            type="button"
                            className={`px-4 py-3 text-md font-medium rounded-md ml-1 ${activeAddress === "shipping"
                              ? "text-qblack bg-qyellow"
                              : "text-qyellow"
                              } `}
                          >
                            {ServeLangItem()?.Shipping_Address}
                          </button>
                        </div>

                        <button
                          onClick={() => setNewAddress(!newAddress)}
                          type="button"
                          className="w-[100px] h-[40px] mt-2 sm:mt-0 border border-qblack hover:bg-qblack hover:text-white transition-all duration-300 ease-in-out"
                        >
                          <span className="text-sm font-semibold">
                            {ServeLangItem()?.Add_New}
                          </span>
                        </button>
                      </div>
                      {activeAddress === "billing" ? (
                        <div
                          data-aos="zoom-in"
                          className="grid sm:grid-cols-2 grid-cols-1 gap-3"
                        >
                          {addresses &&
                            addresses.length > 0 &&
                            addresses.map((address, i) => (
                              <div
                                onClick={() => setBilling(address.id)}
                                key={i}
                                className={`w-full p-5 border cursor-pointer relative ${address.id === selectedBilling
                                  ? "border-qyellow bg-qyellowlow/10"
                                  : "border-transparent bg-primarygray"
                                  }`}
                              >
                                <div className="flex justify-between items-center">
                                  <p className="title text-[22px] font-semibold">
                                    {ServeLangItem()?.Address} #{i + 1}
                                  </p>
                                  <button
                                    onClick={() => deleteAddress(address.id)}
                                    type="button"
                                    className="border border-qgray w-[34px] h-[34px] rounded-full flex justify-center items-center"
                                  >
                                    <svg
                                      width="17"
                                      height="19"
                                      viewBox="0 0 17 19"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M15.7768 5.95215C15.6991 6.9104 15.6242 7.84603 15.5471 8.78237C15.3691 10.9285 15.1917 13.0747 15.0108 15.2209C14.9493 15.9473 14.9097 16.6773 14.8065 17.3988C14.6963 18.1726 14.0716 18.7161 13.2929 18.7196C10.3842 18.7323 7.47624 18.7337 4.56757 18.7189C3.70473 18.7146 3.08639 18.0794 3.00795 17.155C2.78181 14.493 2.57052 11.8302 2.35145 9.16821C2.2716 8.19442 2.1875 7.22133 2.10623 6.24824C2.09846 6.15638 2.09563 6.06451 2.08998 5.95286C6.65579 5.95215 11.2061 5.95215 15.7768 5.95215ZM5.25375 8.05803C5.25234 8.05803 5.25163 8.05803 5.25022 8.05803C5.27566 8.4573 5.3011 8.85657 5.32583 9.25584C5.46717 11.5228 5.60709 13.7891 5.75125 16.0561C5.77245 16.3897 5.99081 16.6038 6.28196 16.6024C6.58724 16.601 6.80066 16.3636 6.8056 16.0159C6.80702 15.9339 6.80136 15.8512 6.79571 15.7692C6.65367 13.4789 6.51304 11.1886 6.36888 8.89826C6.33849 8.41702 6.31164 7.93507 6.26146 7.45524C6.22966 7.1549 6.0318 6.99732 5.73076 6.99802C5.44526 6.99873 5.24033 7.2185 5.23043 7.52873C5.22619 7.7054 5.24598 7.88207 5.25375 8.05803ZM12.6102 8.05521C12.6088 8.05521 12.6074 8.05521 12.606 8.05521C12.6152 7.89055 12.6321 7.7259 12.6307 7.56195C12.6286 7.24465 12.4399 7.02417 12.1622 6.99873C11.888 6.97329 11.6484 7.16268 11.5961 7.46443C11.5665 7.63756 11.5615 7.81494 11.5502 7.9909C11.4626 9.38799 11.3749 10.7851 11.2887 12.1822C11.2103 13.4499 11.1276 14.7184 11.0576 15.9869C11.0379 16.3431 11.2463 16.5819 11.5495 16.6003C11.8562 16.6194 12.088 16.4017 12.1099 16.0505C12.2788 13.3856 12.4441 10.7208 12.6102 8.05521ZM9.45916 11.814C9.45916 10.4727 9.45986 9.13147 9.45916 7.79091C9.45916 7.25101 9.28603 6.99449 8.92845 6.99661C8.56805 6.99802 8.40198 7.24819 8.40198 7.79586C8.40127 10.4664 8.40127 13.1369 8.40268 15.8074C8.40268 15.948 8.37088 16.1289 8.44296 16.2194C8.56946 16.3763 8.76591 16.5748 8.93198 16.5741C9.09805 16.5734 9.29309 16.3727 9.41746 16.2151C9.48955 16.124 9.45704 15.9431 9.45704 15.8032C9.46057 14.4725 9.45916 13.1432 9.45916 11.814Z"
                                        fill="#EB5757"
                                      />
                                      <path
                                        d="M5.20143 2.75031C5.21486 2.49449 5.21839 2.2945 5.23747 2.09593C5.31733 1.25923 5.93496 0.648664 6.77449 0.637357C8.21115 0.618277 9.64923 0.618277 11.0859 0.637357C11.9254 0.648664 12.5438 1.25852 12.6236 2.09522C12.6427 2.2938 12.6462 2.49379 12.6582 2.73335C12.7854 2.739 12.9084 2.74889 13.0314 2.7496C13.9267 2.75101 14.8221 2.74677 15.7174 2.75172C16.4086 2.75525 16.8757 3.18774 16.875 3.81244C16.8742 4.43643 16.4078 4.87103 15.716 4.87174C11.1926 4.87386 6.66849 4.87386 2.14508 4.87174C1.45324 4.87103 0.986135 4.43713 0.985429 3.81314C0.984722 3.18915 1.45183 2.75525 2.14296 2.75243C3.15421 2.74677 4.16545 2.75031 5.20143 2.75031ZM11.5799 2.73335C11.5799 2.59625 11.5806 2.49096 11.5799 2.38637C11.5749 1.86626 11.4018 1.69313 10.876 1.69242C9.55878 1.69101 8.24225 1.68959 6.92501 1.69313C6.48546 1.69454 6.30031 1.87545 6.28265 2.3051C6.27699 2.4422 6.28194 2.58 6.28194 2.73335C8.05851 2.73335 9.7941 2.73335 11.5799 2.73335Z"
                                        fill="#EB5757"
                                      />
                                    </svg>
                                  </button>
                                </div>
                                <div className="mt-5">
                                  <table>
                                    <tbody>
                                      <tr className="flex mb-3">
                                        <td className="text-base text-qgraytwo w-[70px] block line-clamp-1 capitalize">
                                          {ServeLangItem()?.Name}:
                                        </td>
                                        <td className="text-base text-qblack line-clamp-1 font-medium">
                                          {address.name}
                                        </td>
                                      </tr>
                                      <tr className="flex mb-3">
                                        <td className="text-base text-qgraytwo w-[70px] block line-clamp-1 capitalize">
                                          {ServeLangItem()?.Email}:
                                        </td>
                                        <td className="text-base text-qblack line-clamp-1 font-medium">
                                          {address.email}
                                        </td>
                                      </tr>
                                      <tr className="flex mb-3">
                                        <td className="text-base text-qgraytwo w-[70px] block line-clamp-1 capitalize">
                                          {ServeLangItem()?.phone}:
                                        </td>
                                        <td className="text-base text-qblack line-clamp-1 font-medium">
                                          {address.phone}
                                        </td>
                                      </tr>
                                      <tr className="flex mb-3">
                                        <td className="text-base text-qgraytwo w-[70px] block line-clamp-1 capitalize">
                                          {ServeLangItem()?.State}:
                                        </td>
                                        <td className="text-base text-qblack line-clamp-1 font-medium">
                                          {address.country_state.name}
                                        </td>
                                      </tr>
                                      <tr className="flex mb-3">
                                        <td className="text-base text-qgraytwo w-[70px] block line-clamp-1 capitalize">
                                          {ServeLangItem()?.City}:
                                        </td>
                                        <td className="text-base text-qblack line-clamp-1 font-medium">
                                          {address.city.name}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                                {address.id === selectedBilling && (
                                  <span className="text-qblack bg-qyellow px-2 text-sm absolute right-2 -top-2 font-medium">
                                    {ServeLangItem()?.Selected}
                                  </span>
                                )}
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div
                          data-aos="zoom-in"
                          className="grid sm:grid-cols-2 grid-cols-1 gap-3"
                        >
                          {addresses &&
                            addresses.length > 0 &&
                            addresses.map((address, i) => (
                              <div
                                onClick={() =>
                                  shippingHandler(
                                    address.id,
                                    parseInt(address.city_id)
                                  )
                                }
                                key={i}
                                className={`w-full p-5 border relative cursor-pointer ${address.id === selectedShipping
                                  ? "border-qyellow bg-qyellowlow/10"
                                  : "border-transparent bg-primarygray"
                                  }`}
                              >
                                <div className="flex justify-between items-center">
                                  <p className="title text-[22px] font-semibold">
                                    {ServeLangItem()?.Address} #{i + 1}
                                  </p>
                                  <button
                                    onClick={() => deleteAddress(address.id)}
                                    type="button"
                                    className="border border-qgray w-[34px] h-[34px] rounded-full flex justify-center items-center"
                                  >
                                    <svg
                                      width="17"
                                      height="19"
                                      viewBox="0 0 17 19"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M15.7768 5.95215C15.6991 6.9104 15.6242 7.84603 15.5471 8.78237C15.3691 10.9285 15.1917 13.0747 15.0108 15.2209C14.9493 15.9473 14.9097 16.6773 14.8065 17.3988C14.6963 18.1726 14.0716 18.7161 13.2929 18.7196C10.3842 18.7323 7.47624 18.7337 4.56757 18.7189C3.70473 18.7146 3.08639 18.0794 3.00795 17.155C2.78181 14.493 2.57052 11.8302 2.35145 9.16821C2.2716 8.19442 2.1875 7.22133 2.10623 6.24824C2.09846 6.15638 2.09563 6.06451 2.08998 5.95286C6.65579 5.95215 11.2061 5.95215 15.7768 5.95215ZM5.25375 8.05803C5.25234 8.05803 5.25163 8.05803 5.25022 8.05803C5.27566 8.4573 5.3011 8.85657 5.32583 9.25584C5.46717 11.5228 5.60709 13.7891 5.75125 16.0561C5.77245 16.3897 5.99081 16.6038 6.28196 16.6024C6.58724 16.601 6.80066 16.3636 6.8056 16.0159C6.80702 15.9339 6.80136 15.8512 6.79571 15.7692C6.65367 13.4789 6.51304 11.1886 6.36888 8.89826C6.33849 8.41702 6.31164 7.93507 6.26146 7.45524C6.22966 7.1549 6.0318 6.99732 5.73076 6.99802C5.44526 6.99873 5.24033 7.2185 5.23043 7.52873C5.22619 7.7054 5.24598 7.88207 5.25375 8.05803ZM12.6102 8.05521C12.6088 8.05521 12.6074 8.05521 12.606 8.05521C12.6152 7.89055 12.6321 7.7259 12.6307 7.56195C12.6286 7.24465 12.4399 7.02417 12.1622 6.99873C11.888 6.97329 11.6484 7.16268 11.5961 7.46443C11.5665 7.63756 11.5615 7.81494 11.5502 7.9909C11.4626 9.38799 11.3749 10.7851 11.2887 12.1822C11.2103 13.4499 11.1276 14.7184 11.0576 15.9869C11.0379 16.3431 11.2463 16.5819 11.5495 16.6003C11.8562 16.6194 12.088 16.4017 12.1099 16.0505C12.2788 13.3856 12.4441 10.7208 12.6102 8.05521ZM9.45916 11.814C9.45916 10.4727 9.45986 9.13147 9.45916 7.79091C9.45916 7.25101 9.28603 6.99449 8.92845 6.99661C8.56805 6.99802 8.40198 7.24819 8.40198 7.79586C8.40127 10.4664 8.40127 13.1369 8.40268 15.8074C8.40268 15.948 8.37088 16.1289 8.44296 16.2194C8.56946 16.3763 8.76591 16.5748 8.93198 16.5741C9.09805 16.5734 9.29309 16.3727 9.41746 16.2151C9.48955 16.124 9.45704 15.9431 9.45704 15.8032C9.46057 14.4725 9.45916 13.1432 9.45916 11.814Z"
                                        fill="#EB5757"
                                      />
                                      <path
                                        d="M5.20143 2.75031C5.21486 2.49449 5.21839 2.2945 5.23747 2.09593C5.31733 1.25923 5.93496 0.648664 6.77449 0.637357C8.21115 0.618277 9.64923 0.618277 11.0859 0.637357C11.9254 0.648664 12.5438 1.25852 12.6236 2.09522C12.6427 2.2938 12.6462 2.49379 12.6582 2.73335C12.7854 2.739 12.9084 2.74889 13.0314 2.7496C13.9267 2.75101 14.8221 2.74677 15.7174 2.75172C16.4086 2.75525 16.8757 3.18774 16.875 3.81244C16.8742 4.43643 16.4078 4.87103 15.716 4.87174C11.1926 4.87386 6.66849 4.87386 2.14508 4.87174C1.45324 4.87103 0.986135 4.43713 0.985429 3.81314C0.984722 3.18915 1.45183 2.75525 2.14296 2.75243C3.15421 2.74677 4.16545 2.75031 5.20143 2.75031ZM11.5799 2.73335C11.5799 2.59625 11.5806 2.49096 11.5799 2.38637C11.5749 1.86626 11.4018 1.69313 10.876 1.69242C9.55878 1.69101 8.24225 1.68959 6.92501 1.69313C6.48546 1.69454 6.30031 1.87545 6.28265 2.3051C6.27699 2.4422 6.28194 2.58 6.28194 2.73335C8.05851 2.73335 9.7941 2.73335 11.5799 2.73335Z"
                                        fill="#EB5757"
                                      />
                                    </svg>
                                  </button>
                                </div>
                                <div className="mt-5">
                                  <table>
                                    <tbody>
                                      <tr className="flex mb-3">
                                        <td className="text-base text-qgraytwo w-[70px] block line-clamp-1 capitalize">
                                          {ServeLangItem()?.Name}:
                                        </td>
                                        <td className="text-base text-qblack line-clamp-1 font-medium">
                                          {address.name}
                                        </td>
                                      </tr>
                                      <tr className="flex mb-3">
                                        <td className="text-base text-qgraytwo w-[70px] block line-clamp-1 capitalize">
                                          {ServeLangItem()?.Email}:
                                        </td>
                                        <td className="text-base text-qblack line-clamp-1 font-medium">
                                          {address.email}
                                        </td>
                                      </tr>
                                      <tr className="flex mb-3">
                                        <td className="text-base text-qgraytwo w-[70px] block line-clamp-1 capitalize">
                                          {ServeLangItem()?.phone}:
                                        </td>
                                        <td className="text-base text-qblack line-clamp-1 font-medium">
                                          {address.phone}
                                        </td>
                                      </tr>
                                      <tr className="flex mb-3">
                                        <td className="text-base text-qgraytwo w-[70px] block line-clamp-1 capitalize">
                                          {ServeLangItem()?.State}:
                                        </td>
                                        <td className="text-base text-qblack line-clamp-1 font-medium">
                                          {address.country_state.name}
                                        </td>
                                      </tr>
                                      <tr className="flex mb-3">
                                        <td className="text-base text-qgraytwo w-[70px] block line-clamp-1 capitalize">
                                          {ServeLangItem()?.City}:
                                        </td>
                                        <td className="text-base text-qblack line-clamp-1 font-medium">
                                          {address.city.name}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                                {address.id === selectedShipping && (
                                  <span className="text-qblack bg-qyellow px-2 text-sm absolute right-2 -top-2 font-medium">
                                    {ServeLangItem()?.Selected}
                                  </span>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                  {newAddress && (
                    <div data-aos="zoom-in" className="w-full">
                      <div className="flex justify-between items-center">
                        <h1 className="sm:text-2xl text-xl text-qblack font-medium mb-5">
                          {ServeLangItem()?.Add_new_address}
                        </h1>
                        <span
                          onClick={() => setNewAddress(!newAddress)}
                          className="text-qyellow cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
                      <div className="form-area">
                        <form>
                          <div className="mb-6">
                            <div className="sm:flex sm:space-x-5 items-center">
                              <div className="sm:w-1/2 w-full  mb-5 sm:mb-0">
                                <InputCom
                                  label={ServeLangItem()?.First_Name + "*"}
                                  placeholder={ServeLangItem()?.Name}
                                  inputClasses="w-full h-[50px]"
                                  value={fName}
                                  inputHandler={(e) => setFname(e.target.value)}
                                  error={
                                    !!(errors && Object.hasOwn(errors, "name"))
                                  }
                                />
                              </div>
                              <div className="sm:w-1/2 w-full">
                                <InputCom
                                  label={ServeLangItem()?.Last_Name + "*"}
                                  placeholder={ServeLangItem()?.Name}
                                  inputClasses="w-full h-[50px]"
                                  value={lName}
                                  inputHandler={(e) => setlname(e.target.value)}
                                  error={
                                    !!(errors && Object.hasOwn(errors, "name"))
                                  }
                                />
                              </div>
                            </div>
                            {errors && Object.hasOwn(errors, "name") ? (
                              <span className="text-sm mt-1 text-qred">
                                {errors.name[0]}
                              </span>
                            ) : (
                              ""
                            )}
                          </div>

                          <div className="flex space-x-5 items-center mb-6">
                            <div className="sm:w-1/2 w-full">
                              <InputCom
                                label={ServeLangItem()?.Email_Address + "*"}
                                placeholder={ServeLangItem()?.Email}
                                inputClasses="w-full h-[50px]"
                                value={email}
                                inputHandler={(e) => setEmail(e.target.value)}
                                error={
                                  !!(errors && Object.hasOwn(errors, "email"))
                                }
                              />
                              {errors && Object.hasOwn(errors, "email") ? (
                                <span className="text-sm mt-1 text-qred">
                                  {errors.email[0]}
                                </span>
                              ) : (
                                ""
                              )}
                            </div>
                            <div className="sm:w-1/2 w-full">
                              <InputCom
                                label={ServeLangItem()?.Phone_Number + "*"}
                                placeholder="012 3  *******"
                                inputClasses="w-full h-[50px]"
                                value={phone}
                                inputHandler={(e) => setPhone(e.target.value)}
                                error={
                                  !!(errors && Object.hasOwn(errors, "phone"))
                                }
                              />
                              {errors && Object.hasOwn(errors, "phone") ? (
                                <span className="text-sm mt-1 text-qred">
                                  {errors.phone[0]}
                                </span>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-5 items-center mb-6">
                            <div className="w-1/2">
                              <h1 className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
                                {ServeLangItem()?.State}*
                              </h1>
                              <div
                                className={`w-full h-[50px] border px-5 flex justify-between items-center mb-2 ${!!(errors && Object.hasOwn(errors, "state"))
                                  ? "border-qred"
                                  : "border-[#EDEDED]"
                                  }`}
                              >
                                <Selectbox
                                  action={getcity}
                                  className="w-full"
                                  defaultValue="Select"
                                  datas={stateDropdown && stateDropdown}
                                >
                                  {({ item }) => (
                                    <>
                                      <div className="flex justify-between items-center w-full">
                                        <div>
                                          <span className="text-[13px] text-qblack">
                                            {item}
                                          </span>
                                        </div>
                                        <span>
                                          <svg
                                            width="11"
                                            height="7"
                                            viewBox="0 0 11 7"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M5.4 6.8L0 1.4L1.4 0L5.4 4L9.4 0L10.8 1.4L5.4 6.8Z"
                                              fill="#222222"
                                            />
                                          </svg>
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </Selectbox>
                              </div>
                              {errors && Object.hasOwn(errors, "state") ? (
                                <span className="text-sm mt-1 text-qred">
                                  {errors.state[0]}
                                </span>
                              ) : (
                                ""
                              )}
                            </div>
                            <div className="w-1/2">
                              <h1 className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
                                {ServeLangItem()?.City}*
                              </h1>
                              <div
                                className={`w-full h-[50px] border px-5 flex justify-between items-center mb-2 ${!!(errors && Object.hasOwn(errors, "city"))
                                  ? "border-qred"
                                  : "border-[#EDEDED]"
                                  }`}
                              >
                                <Selectbox
                                  action={selectCity}
                                  className="w-full"
                                  defaultValue="select"
                                  datas={cityDropdown && cityDropdown}
                                >
                                  {({ item }) => (
                                    <>
                                      <div className="flex justify-between items-center w-full">
                                        <div>
                                          <span className="text-[13px] text-qblack">
                                            {item}
                                          </span>
                                        </div>
                                        <span>
                                          <svg
                                            width="11"
                                            height="7"
                                            viewBox="0 0 11 7"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M5.4 6.8L0 1.4L1.4 0L5.4 4L9.4 0L10.8 1.4L5.4 6.8Z"
                                              fill="#222222"
                                            />
                                          </svg>
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </Selectbox>
                              </div>
                              {errors && Object.hasOwn(errors, "city") ? (
                                <span className="text-sm mt-1 text-qred">
                                  {errors.city[0]}
                                </span>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                          <div className=" mb-6">
                            <div className="w-full">
                              <InputCom
                                value={address}
                                inputHandler={(e) => setAddress(e.target.value)}
                                label={ServeLangItem()?.Address + "*"}
                                placeholder={ServeLangItem()?.your_address_here}
                                inputClasses="w-full h-[50px]"
                                error={
                                  !!(errors && Object.hasOwn(errors, "address"))
                                }
                              />
                              {errors && Object.hasOwn(errors, "address") ? (
                                <span className="text-sm mt-1 text-qred">
                                  {errors.address[0]}
                                </span>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-5 items-center ">
                            <div className="flex space-x-2 items-center mb-10">
                              <div>
                                <input
                                  checked={home}
                                  onChange={() => {
                                    setHome(!home);
                                    setOffice(false);
                                  }}
                                  type="checkbox"
                                  name="home"
                                  id="home"
                                />
                              </div>
                              <label
                                htmlFor="home"
                                className="text-qblack text-[15px] select-none capitalize"
                              >
                                {ServeLangItem()?.home}
                              </label>
                            </div>
                            <div className="flex space-x-2 items-center mb-10">
                              <div>
                                <input
                                  checked={office}
                                  onChange={() => {
                                    setOffice(!office);
                                    setHome(false);
                                  }}
                                  type="checkbox"
                                  name="office"
                                  id="office"
                                />
                              </div>
                              <label
                                htmlFor="office"
                                className="text-qblack text-[15px] select-none"
                              >
                                {ServeLangItem()?.Office}
                              </label>
                            </div>
                          </div>
                          <button
                            onClick={saveAddress}
                            type="button"
                            className="w-full h-[50px]"
                          >
                            <div className="yellow-btn">
                              <span className="text-sm">Save Address</span>
                              {loading && (
                                <span
                                  className="w-5 "
                                  style={{ transform: "scale(0.3)" }}
                                >
                                  <LoaderStyleOne />
                                </span>
                              )}
                            </div>
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-10">
                    <h1 className="sm:text-2xl text-xl text-qblack font-medium mt-5 mb-5">
                      {ServeLangItem()?.Apply_Coupon}
                    </h1>
                    <div className="discount-code  w-full mb-5 sm:mb-0 h-[50px] flex ">
                      <div className="flex-1 h-full">
                        <InputCom
                          value={inputCoupon}
                          inputHandler={(e) => setInputCoupon(e.target.value)}
                          type="text"
                          placeholder="Discount Code"
                        />
                      </div>
                      <button
                        onClick={submitCoupon}
                        type="button"
                        className="w-[90px] h-[50px] black-btn"
                      >
                        <span className="text-sm font-semibold">
                          {ServeLangItem()?.Apply}
                        </span>
                      </button>
                    </div>
                  </div>
                  <h1 className="sm:text-2xl text-xl text-qblack font-medium mt-5 mb-5">
                    {ServeLangItem()?.Order_Summary}
                  </h1>

                  <div className="w-full px-10 py-[30px] border border-[#EDEDED]">
                    <div className="sub-total mb-6">
                      <div className=" flex justify-between mb-5">
                        <p className="text-[13px] font-medium text-qblack uppercase">
                          {ServeLangItem()?.Product}
                        </p>
                        <p className="text-[13px] font-medium text-qblack uppercase">
                          {ServeLangItem()?.total}
                        </p>
                      </div>
                      <div className="w-full h-[1px] bg-[#EDEDED]"></div>
                    </div>
                    <div className="product-list w-full mb-[30px]">
                      <ul className="flex flex-col space-y-5">
                        {carts &&
                          carts.length > 0 &&
                          carts.map((item) => (
                            <li key={item.id}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4
                                    title={item.product.name}
                                    className="text-[15px] text-qblack line-clamp-1 mb-2.5"
                                  >
                                    {wordCount(`${item.product.name}`)}
                                    <sup className="text-[13px] text-qgray ml-2 mt-2">
                                      x{parseInt(item.qty)}
                                    </sup>
                                  </h4>
                                  <p className="text-[13px] text-qgray line-clamp-1">
                                    {item.variants.length >= 0 &&
                                      item.variants.map((variant, i) => (
                                        <span key={i}>
                                          {variant.variant_item &&
                                            variant.variant_item.name + ','}
                                        </span>
                                      ))}
                                  </p>
                                </div>
                                <div>
                                  <span
                                    suppressHydrationWarning
                                    className="text-[15px] text-qblack font-medium"
                                  >
                                    <CheckProductIsExistsInFlashSale
                                      id={item.product_id}
                                      price={price(item)}
                                    />
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                    <div className="w-full h-[1px] bg-[#EDEDED]"></div>
                    <div className="mt-[20px]">
                      <div className=" flex justify-between mb-5">
                        <p className="text-[13px] text-qblack uppercase font-bold">
                          {ServeLangItem()?.SUBTOTAL}
                        </p>
                        <p
                          suppressHydrationWarning
                          className="text-[15px] font-bold text-qblack uppercase"
                        >
                          <CurrencyConvert price={totalPrice} />
                        </p>
                      </div>
                      <div className=" flex justify-between mb-5">
                        <p className="text-[13px] text-qblack uppercase font-bold">
                          {ServeLangItem()?.Discount_coupon} (-)
                        </p>
                        <p
                          suppressHydrationWarning
                          className="text-[15px] font-bold text-qblack uppercase"
                        >
                          <CurrencyConvert price={discountCoupon} />
                        </p>
                      </div>
                    </div>
                    <div className="shipping mb-6 mt-6">
                      <span className="text-[15px] font-medium text-qblack mb-[18px] block">
                        {ServeLangItem()?.Shipping} (+)
                      </span>
                      <div className="flex flex-col space-y-2.5">
                        {shippingRulesByCityId &&
                          shippingRulesByCityId.length > 0 &&
                          shippingRulesByCityId.map((rule, i) => (
                            <div key={i}>
                              {rule.type === "base_on_price" ? (
                                <>
                                  {parseInt(rule.condition_from) <=
                                    parseInt(totalPrice) && (
                                      <div className="flex justify-between items-center">
                                        <div className="flex space-x-2.5 items-center">
                                          <div className="input-radio">
                                            <input
                                              onChange={(e) =>
                                                selectedRuleHandler(
                                                  e,
                                                  rule.shipping_fee
                                                )
                                              }
                                              value={rule.id}
                                              type="radio"
                                              name="price"
                                              className="accent-pink-500"
                                            />
                                          </div>
                                          <span className="text-[15px] text-normal text-qgraytwo">
                                            {rule.shipping_rule}
                                          </span>
                                        </div>
                                        <span
                                          suppressHydrationWarning
                                          className="text-[15px] text-normal text-qgraytwo"
                                        >
                                          <CurrencyConvert price={rule.shipping_fee} />

                                        </span>
                                      </div>
                                    )}
                                </>
                              ) : rule.type === "base_on_weight" ? (
                                <>
                                  {parseInt(rule.condition_from) <=
                                    parseInt(totalWeight) && (
                                      <>
                                        {parseInt(rule.condition_to) >=
                                          parseInt(totalWeight) ? (
                                          <div className="flex justify-between items-center">
                                            <div className="flex space-x-2.5 items-center">
                                              <div className="input-radio">
                                                <input
                                                  onChange={(e) =>
                                                    selectedRuleHandler(
                                                      e,
                                                      rule.shipping_fee
                                                    )
                                                  }
                                                  value={rule.id}
                                                  type="radio"
                                                  name="price"
                                                  className="accent-pink-500"
                                                />
                                              </div>
                                              <span className="text-[15px] text-normal text-qgraytwo">
                                                {rule.shipping_rule}
                                              </span>
                                            </div>
                                            <span
                                              suppressHydrationWarning
                                              className="text-[15px] text-normal text-qgraytwo"
                                            >

                                              <CurrencyConvert price={rule.shipping_fee} />
                                            </span>
                                          </div>
                                        ) : parseInt(rule.condition_to) === -1 ? (
                                          <div className="flex justify-between items-center">
                                            <div className="flex space-x-2.5 items-center">
                                              <div className="input-radio">
                                                <input
                                                  onChange={(e) =>
                                                    selectedRuleHandler(
                                                      e,
                                                      rule.shipping_fee
                                                    )
                                                  }
                                                  value={rule.id}
                                                  type="radio"
                                                  name="price"
                                                  className="accent-pink-500"
                                                />
                                              </div>
                                              <span className="text-[15px] text-normal text-qgraytwo">
                                                {rule.shipping_rule}
                                              </span>
                                            </div>
                                            <span
                                              suppressHydrationWarning
                                              className="text-[15px] text-normal text-qgraytwo"
                                            >
                                              <CurrencyConvert price={rule.shipping_fee} />
                                            </span>
                                          </div>
                                        ) : (
                                          ""
                                        )}
                                      </>
                                    )}
                                </>
                              ) : rule.type === "base_on_qty" ? (
                                <>
                                  {parseInt(rule.condition_from) <=
                                    totalQty && (
                                      <>
                                        {parseInt(rule.condition_to) >=
                                          totalQty ? (
                                          <div className="flex justify-between items-center">
                                            <div className="flex space-x-2.5 items-center">
                                              <div className="input-radio">
                                                <input
                                                  onChange={(e) =>
                                                    selectedRuleHandler(
                                                      e,
                                                      rule.shipping_fee
                                                    )
                                                  }
                                                  value={rule.id}
                                                  type="radio"
                                                  name="price"
                                                  className="accent-pink-500"
                                                />
                                              </div>
                                              <span className="text-[15px] text-normal text-qgraytwo">
                                                {rule.shipping_rule}
                                              </span>
                                            </div>
                                            <span
                                              suppressHydrationWarning
                                              className="text-[15px] text-normal text-qgraytwo"
                                            >
                                              <CurrencyConvert price={rule.shipping_fee} />
                                            </span>
                                          </div>
                                        ) : parseInt(rule.condition_to) == -1 ? (
                                          <div className="flex justify-between items-center">
                                            <div className="flex space-x-2.5 items-center">
                                              <div className="input-radio">
                                                <input
                                                  onChange={(e) =>
                                                    selectedRuleHandler(
                                                      e,
                                                      rule.shipping_fee
                                                    )
                                                  }
                                                  value={rule.id}
                                                  type="radio"
                                                  name="price"
                                                  className="accent-pink-500"
                                                />
                                              </div>
                                              <span className="text-[15px] text-normal text-qgraytwo">
                                                {rule.shipping_rule}
                                              </span>
                                            </div>
                                            <span
                                              suppressHydrationWarning
                                              className="text-[15px] text-normal text-qgraytwo"
                                            >
                                              <CurrencyConvert price={rule.shipping_fee} />
                                            </span>
                                          </div>
                                        ) : (
                                          ""
                                        )}
                                      </>
                                    )}
                                </>
                              ) : (
                                <div></div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="mt-[30px]">
                      <div className=" flex justify-between mb-5">
                        <p className="text-2xl font-medium text-qblack capitalize">
                          {ServeLangItem()?.total}
                        </p>
                        <p
                          suppressHydrationWarning
                          className="text-2xl font-medium text-qred"
                        >
                          <CurrencyConvert price={(mainTotalPrice - discountCoupon)} />
                        </p>
                      </div>
                    </div>
                    {/*payment methods*/}
                    <div className="mt-[30px] mb-5 relative">
                      <div className="w-full">
                        <div className="flex flex-col space-y-3">
                          {cashOnDeliveryStatus && (
                            <div
                              onClick={() => setPaymentMethod("cashOnDelivery")}
                              className={`payment-item relative bg-[#F8F8F8] text-center w-full h-[50px] text-sm text-qgreen flex justify-center items-center px-3 uppercase cursor-pointer
                              ${selectPayment === "cashOnDelivery"
                                  ? "border-2 border-qyellow"
                                  : "border border-gray-200"
                                }
                              `}
                            >
                              <div className="w-full">
                                <span className="text-qblack font-bold text-base">
                                  {ServeLangItem()?.Cash_On_Delivery}
                                </span>
                              </div>
                              {selectPayment === "cashOnDelivery" && (
                                <span
                                  data-aos="zoom-in"
                                  className="absolute text-white z-10 w-6 h-6 rounded-full bg-qyellow -right-2.5 -top-2.5"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                              )}
                            </div>
                          )}
                          {bankPaymentStatus && (
                            <div
                              onClick={() => setPaymentMethod("bankpayment")}
                              className={`payment-item text-center bg-[#F8F8F8] relative w-full h-[50px] font-bold text-sm text-white text-qyellow  flex justify-center items-center px-3 uppercase cursor-pointer ${selectPayment === "bankpayment"
                                ? "border-2 border-qyellow"
                                : "border border-gray-200"
                                }`}
                            >
                              <div className="w-full">
                                <span className="text-qblack font-bold text-base">
                                  {ServeLangItem()?.Bank_Payment}
                                </span>
                              </div>
                              {selectPayment === "bankpayment" && (
                                <span
                                  data-aos="zoom-in"
                                  className="absolute text-white z-10 w-6 h-6 rounded-full bg-qyellow -right-2.5 -top-2.5"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                              )}
                            </div>
                          )}
                          {bkashStatus && (
                            <div
                              onClick={() => setPaymentMethod("bkashpayment")}
                              className={`payment-item text-center bg-[#F8F8F8] relative w-full h-[50px] font-bold text-sm text-white text-qyellow  flex justify-center items-center px-3 uppercase cursor-pointer ${selectPayment === "bkashpayment"
                                ? "border-2 border-qyellow"
                                : "border border-gray-200"
                                }`}
                            >
                              <div className="w-full">
                                <span className="text-qblack font-bold text-base">
                                  Bkash Payment
                                </span>
                              </div>
                              {selectPayment === "bkashpayment" && (
                                <span
                                  data-aos="zoom-in"
                                  className="absolute text-white z-10 w-6 h-6 rounded-full bg-qyellow -right-2.5 -top-2.5"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                              )}
                            </div>
                          )}
                          {rocketStatus && (
                            <div
                              onClick={() => setPaymentMethod("rocketpayment")}
                              className={`payment-item text-center bg-[#F8F8F8] relative w-full h-[50px] font-bold text-sm text-white text-qyellow  flex justify-center items-center px-3 uppercase cursor-pointer ${selectPayment === "rocketpayment"
                                ? "border-2 border-qyellow"
                                : "border border-gray-200"
                                }`}
                            >
                              <div className="w-full">
                                <span className="text-qblack font-bold text-base">
                                  Rocket Payment
                                </span>
                              </div>
                              {selectPayment === "rocketpayment" && (
                                <span
                                  data-aos="zoom-in"
                                  className="absolute text-white z-10 w-6 h-6 rounded-full bg-qyellow -right-2.5 -top-2.5"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                              )}
                            </div>
                          )}
                          {nagadStatus && (
                            <div
                              onClick={() => setPaymentMethod("nagadpayment")}
                              className={`payment-item text-center bg-[#F8F8F8] relative w-full h-[50px] font-bold text-sm text-white text-qyellow  flex justify-center items-center px-3 uppercase cursor-pointer ${selectPayment === "nagadpayment"
                                ? "border-2 border-qyellow"
                                : "border border-gray-200"
                                }`}
                            >
                              <div className="w-full">
                                <span className="text-qblack font-bold text-base">
                                  Nagad Payment
                                </span>
                              </div>
                              {selectPayment === "nagadpayment" && (
                                <span
                                  data-aos="zoom-in"
                                  className="absolute text-white z-10 w-6 h-6 rounded-full bg-qyellow -right-2.5 -top-2.5"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectPayment === "bankpayment" && (
                      <div className="w-full bank-inputs mt-5">
                        <div className="input-item mb-5">
                          <div className="bank-info-alert w-full p-5 bg-amber-100 rounded mb-4 overflow-x-scroll">
                            <pre className="w-full table table-fixed">
                              {bankInfo.account_info}
                            </pre>
                          </div>
                          <h6 className="input-label  capitalize text-[13px] font-600 leading-[24px] text-qblack block mb-2 ">
                            {ServeLangItem()?.Transaction_Information}*
                          </h6>
                          <textarea
                            name=""
                            id=""
                            cols="5"
                            rows="7"
                            value={transactionInfo}
                            onChange={(e) => setTransactionInfo(e.target.value)}
                            className={`w-full focus:ring-0 focus:outline-none py-3 px-4 border  placeholder:text-sm text-sm`}
                            placeholder={"Example:\r\n" + bankInfo.account_info}
                          ></textarea>
                        </div>
                      </div>
                    )}
                    {selectPayment === "bkashpayment" && (
                      <div className="w-full bank-inputs mt-5">
                        <div className="input-item mb-5">
                          <div className="bank-info-alert w-full p-5 bg-amber-100 rounded mb-4 overflow-x-scroll">
                            <pre className="w-full table table-fixed">
                              {bkashInfo?.account_info}
                            </pre>
                          </div>
                          <h6 className="input-label  capitalize text-[13px] font-600 leading-[24px] text-qblack block mb-2 ">
                            {ServeLangItem()?.Transaction_Information}*
                          </h6>
                          <textarea
                            name=""
                            id=""
                            cols="5"
                            rows="7"
                            value={transactionInfo}
                            onChange={(e) => setTransactionInfo(e.target.value)}
                            className={`w-full focus:ring-0 focus:outline-none py-3 px-4 border  placeholder:text-sm text-sm`}
                            placeholder={"Example:\r\n" + bkashInfo?.instruction}
                          ></textarea>
                        </div>
                      </div>
                    )}
                    {selectPayment === "rocketpayment" && (
                      <div className="w-full bank-inputs mt-5">
                        <div className="input-item mb-5">
                          <div className="bank-info-alert w-full p-5 bg-amber-100 rounded mb-4 overflow-x-scroll">
                            <pre className="w-full table table-fixed">
                              {rocketInfo?.account_info}
                            </pre>
                          </div>
                          <h6 className="input-label  capitalize text-[13px] font-600 leading-[24px] text-qblack block mb-2 ">
                            {ServeLangItem()?.Transaction_Information}*
                          </h6>
                          <textarea
                            name=""
                            id=""
                            cols="5"
                            rows="7"
                            value={transactionInfo}
                            onChange={(e) => setTransactionInfo(e.target.value)}
                            className={`w-full focus:ring-0 focus:outline-none py-3 px-4 border  placeholder:text-sm text-sm`}
                            placeholder={"Example:\r\n" + rocketInfo?.instruction}
                          ></textarea>
                        </div>
                      </div>
                    )}
                    {selectPayment === "nagadpayment" && (
                      <div className="w-full bank-inputs mt-5">
                        <div className="input-item mb-5">
                          <div className="bank-info-alert w-full p-5 bg-amber-100 rounded mb-4 overflow-x-scroll">
                            <pre className="w-full table table-fixed">
                              {nagadInfo?.account_info}
                            </pre>
                          </div>
                          <h6 className="input-label  capitalize text-[13px] font-600 leading-[24px] text-qblack block mb-2 ">
                            {ServeLangItem()?.Transaction_Information}*
                          </h6>
                          <textarea
                            name=""
                            id=""
                            cols="5"
                            rows="7"
                            value={transactionInfo}
                            onChange={(e) => setTransactionInfo(e.target.value)}
                            className={`w-full focus:ring-0 focus:outline-none py-3 px-4 border  placeholder:text-sm text-sm`}
                            placeholder={"Example:\r\n" + nagadInfo?.instruction}
                          ></textarea>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={placeOrderHandler}
                      className="w-full"
                    >
                      <div className="w-full h-[50px] black-btn flex justify-center items-center">
                        <span className="text-sm font-semibold">
                          {ServeLangItem()?.Place_Order_Now}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default isAuth(CheakoutPage);


