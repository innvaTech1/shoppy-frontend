function CurrencyConvert({ price }) {
  // console.log(price);
  if (price) {
    const priceTypeConst = parseFloat(price).toFixed(2);
    // console.log(priceTypeConst)
    if (typeof window !== "undefined") {
      if (localStorage.getItem("shopoDefaultCurrency")) {
        const getDefaultCurrency = JSON.parse(
          localStorage.getItem("shopoDefaultCurrency")
        );
        const priceConverted = priceTypeConst * 1;
        if (getDefaultCurrency.currency_position === 'left') {
          return `${priceConverted.toFixed(2)}TK`;
        } else {
          return `TK${priceConverted.toFixed(2)}`;
        }
      }
      console.log(priceTypeConst);
      return priceTypeConst;
    } else {
      return priceTypeConst;
    }
  } else {
    return "";
  }
}

export default CurrencyConvert;
