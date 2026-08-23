import { TbCurrencyTaka } from "react-icons/tb";
import bkash from "../../../assets/images/bkash.png";
import nagad from "../../../assets/images/nagad.png";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const MethodCard = ({ method, amount, setErr, from, orderData }) => {
  const [Bonus, setBonus] = useState(0);
  const [Amount, setAmount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const { _id, provider, category, bonus, special_bonus, fee, number } = method || {};

  const handleAddReq = () => {
    if (method?.type == 'auto') {
      const paymentdata = {
        email: user?.email,
        amount,
      };
      
      axiosPrivate.post("/payment/bkash/create", paymentdata).then((res) => {
        if (res.data.success) {
          window.location.replace(res.data.url)
        } else {
          setErr(res.data.message);
          window.scrollTo(0, 0);
        }
      });
    }
    else {
      const newTransaction = {
        id: _id,
        amount,
        email: user?.email,
        previousBalance: user?.balance
      };
      axiosPrivate.post("/balance/add", newTransaction).then((data) => {
        if (data.data?.insertedId) {
          navigate("/addBalance/pay", {
            state: {
              id: data.data.insertedId,
              provider,
              category,
              amount: Amount,
              number,
              fee,
              from,
              orderData
            },
          });
        } else {
          setErr(data.data.message);
          window.scrollTo(0, 0);
        }
      });
    }
  };
  useEffect(() => {
    setAmount(Math.ceil(amount + (amount * fee) / 100));
    setBonus(amount%5===0?((amount*special_bonus)/100).toFixed(2):((amount * bonus) / 100).toFixed(2));
  }, [amount, bonus, fee, special_bonus]);
  return (
    <div
      onClick={handleAddReq}
      className="border border-red-400 h-fit w-32 md:w-48 rounded-md transition ease-in-out duration-300 hover:scale-95 cursor-pointer relative overflow-hidden"
    >
      {Bonus > 0 ? (
        <p className="ribbon text-[10px] md:text-[12px]">
          Bonus: {Bonus} <TbCurrencyTaka />
        </p>
      ) : (
        <></>
      )}

      <img
        src={provider === "bkash" ? bkash : provider === "nagad" ? nagad : ""}
        alt="provider"
        className="mx-auto h-16 md:h-20"
      />
      <p className="bg-gradient-to-r from-primary to-secondary py-1.5 px-5 md:text-lg text-white text-center font-medium md:font-semibold rounded-b flex flex-col items-center justify-center">
        Pay {Amount || 0} BDT{" "}
        <span className="text-xs capitalize">( {category} )</span>
      </p>
    </div>
  );
};

export default MethodCard;

MethodCard.propTypes = {
  method: PropTypes.object.isRequired,
  amount: PropTypes.number.isRequired,
  setErr: PropTypes.func.isRequired,
  from: PropTypes.string.isRequired,
  orderData: PropTypes.object
};
