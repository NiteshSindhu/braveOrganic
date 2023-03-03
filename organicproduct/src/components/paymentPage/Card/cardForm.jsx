import { useToast } from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoginUser } from "../../Pages/users";

const currentYear = new Date().getFullYear();
const monthsArr = Array.from({ length: 12 }, (x, i) => {
  const month = i + 1;
  return month <= 9 ? "0" + month : month;
});
const yearsArr = Array.from({ length: 9 }, (_x, i) => currentYear + i);

export default function CForm({
  cardMonth,
  cardYear,
  onUpdateState,
  cardNumberRef,
  cardHolderRef,
  cardDateRef,
  onCardInputFocus,
  onCardInputBlur,
  cardCvv,
  children,
}) {
  const [cardNumber, setCardNumber] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast=useToast();
  const { isUser } = useSelector((a) => a.userReducer);
  const OrderConfirm = async (id, data, e) => {
    e.preventDefault()
    try {
      await axios.post(`http://localhost:8080/order/add/${id}`, data);
      LoginUser(dispatch, isUser._id)
      toast({
        title: "Order confirmed successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      navigate("/order");
    }catch(err){console.log(err)}
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    onUpdateState(name, value);
  };

  const onCardNumberChange = (event) => {
    let { value, name } = event.target;
    let cardNumber = value;
    value = value.replace(/\D/g, "");
    if (/^3[47]\d{0,13}$/.test(value)) {
      cardNumber = value
        .replace(/(\d{4})/, "$1 ")
        .replace(/(\d{4}) (\d{6})/, "$1 $2 ");
    } else if (/^3(?:0[0-5]|[68]\d)\d{0,11}$/.test(value)) {
      // diner's club, 14 digits
      cardNumber = value
        .replace(/(\d{4})/, "$1 ")
        .replace(/(\d{4}) (\d{6})/, "$1 $2 ");
    } else if (/^\d{0,16}$/.test(value)) {
      // regular cc number, 16 digits
      cardNumber = value
        .replace(/(\d{4})/, "$1 ")
        .replace(/(\d{4}) (\d{4})/, "$1 $2 ")
        .replace(/(\d{4}) (\d{4}) (\d{4})/, "$1 $2 $3 ");
    }

    setCardNumber(cardNumber.trimRight());
    onUpdateState(name, cardNumber);
  };

  const onCvvFocus = (event) => {
    onUpdateState("isCardFlipped", true);
  };

  const onCvvBlur = (event) => {
    onUpdateState("isCardFlipped", false);
  };

  return (
    <div className="card-form">
      <div className="card-list">{children}</div>
      <form onSubmit={(e)=>OrderConfirm(isUser._id,isUser.cartItem,e)} className="card-form__inner">
        <div className="card-input">
          <label htmlFor="cardNumber" className="card-input__label">
            Card Number
          </label>
          <input
            type="tel"
            name="cardNumber"
            className="card-input__input"
            autoComplete="off"
            onChange={onCardNumberChange}
            minLength="19"
            maxLength="19"
            ref={cardNumberRef}
            onFocus={(e) => onCardInputFocus(e, "cardNumber")}
            onBlur={onCardInputBlur}
            value={cardNumber} required
          />
        </div>

        <div className="card-input">
          <label htmlFor="cardName" className="card-input__label">
            Card Holder
          </label>
          <input
            type="text"
            className="card-input__input"
            autoComplete="off"
            name="cardHolder"
            onChange={handleFormChange}
            ref={cardHolderRef}
            onFocus={(e) => onCardInputFocus(e, "cardHolder")}
            onBlur={onCardInputBlur} required
          />
        </div>

        <div className="card-form__row">
          <div className="card-form__col">
            <div className="card-form__group">
              <label htmlFor="cardMonth" className="card-input__label">
                Expiration Date
              </label>
              <select
                className="card-input__input -select"
                value={cardMonth}
                name="cardMonth"
                onChange={handleFormChange}
                ref={cardDateRef}
                onFocus={(e) => onCardInputFocus(e, "cardDate")}
                onBlur={onCardInputBlur} required
              >
                <option value="" disabled>
                  Month
                </option>

                {monthsArr.map((val, index) => (
                  <option key={index} value={val}>
                    {val}
                  </option>
                ))}
              </select>
              <select
                name="cardYear"
                className="card-input__input -select"
                value={cardYear}
                onChange={handleFormChange}
                onFocus={(e) => onCardInputFocus(e, "cardDate")}
                onBlur={onCardInputBlur} required
              >
                <option value="" disabled>
                  Year
                </option>

                {yearsArr.map((val, index) => (
                  <option key={index} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="card-form__col -cvv">
            <div className="card-input">
              <label htmlFor="cardCvv" className="card-input__label">
                CVV
              </label>
              <input
                type="tel"
                className="card-input__input"
                minLength="3"
                maxLength="4"
                autoComplete="off"
                name="cardCvv"
                onChange={handleFormChange}
                onFocus={onCvvFocus}
                onBlur={onCvvBlur}
                ref={cardCvv} required
              />
            </div>
          </div>
        </div>
        <button
          style={{
            width: "100%",
            backgroundColor: "rgb(59, 77, 62)",
            color: "white",
            padding: "5px",
            marginTop: "5px",
            borderRadius: "10px",
          }} type="submit"
          // onClick={()=>OrderConfirm(isUser._id,isUser.cartItem)}
        >
          Payment
        </button>
      </form>
    </div>
  );
}
