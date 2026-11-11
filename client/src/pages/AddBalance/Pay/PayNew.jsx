import { TbCurrencyTaka } from "react-icons/tb";
import bkash from "../../../assets/images/bkash.png";
import nagad from "../../../assets/images/nagad.png";
import bkashPersonal from "../../../assets/images/payment/bkash-personal.jpeg";
import bkashPayment from "../../../assets/images/payment/bkash-payment.jpeg";
import bkashAgent from "../../../assets/images/payment/bkash-agent.jpeg";
import nagadPersonal from "../../../assets/images/payment/nagad-personal.jpeg";
import nagadAgent from "../../../assets/images/payment/nagad-agent.jpeg";
import logo from "../../../assets/topup-logo-crop.png";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { MdContentCopy } from "react-icons/md";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/Loader";
import useAuth from "../../../hooks/useAuth";
import toast from "react-hot-toast";

const paymentImages = {
  bkash: {
    personal: bkashPersonal,
    merchant: bkashPayment,
    agent: bkashAgent,
  },
  nagad: {
    personal: nagadPersonal,
    agent: nagadAgent,
  },
};

const PayNew = ({ id, amount, number, fee, provider, category, from, orderData }) => {
  const paymentImage = paymentImages[provider]?.[category];
  const [err, setErr] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const handleVerify = (e) => {
    e.preventDefault();
    setErr("");
    const trxID = e.target.trxID.value;
    const trx = { id, trxID };
    axiosPrivate.patch("/balance/add/check", trx).then((res) => {
      setAttempt(res.data.attempt);
      const amount = res?.data?.amount;
      if (res.data.success) {
        if(from==="direct"){
          // Item-listing purchases are placed through their own endpoint
          const isItemListing = orderData?.orderType === "itemListing";
          const orderEndpoint = isItemListing
            ? "/order/new/itemListing"
            : "/order/new/dynamic";
          axiosPrivate
        .post(orderEndpoint, {...orderData, trxID})
        .then((res) => {
          if (res.data.success) {
            toast.success("Order Placed Successfully!");
            if (isItemListing) {
              // Server reports the charged price for the claimed item
              const paid = res.data?.price || 0;
              setUser({
                ...user,
                balance: user?.balance + amount - paid,
                orders: user?.orders + 1,
                spent: user?.spent + paid,
              });
            } else {
            setUser({
              ...user,
              balance: user?.balance+amount-(orderData?.willHaveQuantity?orderData?.price*orderData?.quantity || 0: orderData?.price || 0),
              orders: user?.orders + 1,
              spent: user?.spent + orderData?.willHaveQuantity? (orderData?.price*orderData?.quantity) || 0:orderData?.price || 0,
            });
            }
            setIsLoading(false);
            navigate("/myOrders");
          } else {
            setIsLoading(false);
            toast.error(res.data.message || "Order Place Failed!");
          }
        })
        .catch((err) => {
          setIsLoading(false);
          toast.error(err.response.data.error || "Failed to purchase!");
        });
        }else{
          setUser({...user,balance: user?.balance+amount});
        }
        toast.success("Payment Verified")
        navigate("/myTransactions");
      } else {
        if (res.data.isBanned) {
          window.location.reload();
        } else {
          setErr(res.data.message);
        }
      }
    });
  };
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(number);
      Swal.fire({
        toast: true,
        title: "Number copied",
        icon: "success",
        position: "top",
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        toast: true,
        title: "Failed to copy",
        icon: "error",
        position: "top",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };
  useEffect(() => {
    axiosPrivate
      .get(`/transaction?id=${id}&email=${user?.email}`)
      .then((res) => {
        if (res.data?.status !== "pending") {
          navigate("/myTransactions");
        }
        setIsLoading(false);
      });
  }, [axiosPrivate, id, navigate, user?.email]);
  return (
    <div className="max-w-lg border rounded-md p-4 shadow-md block mx-auto space-y-3">
      <Loader isLoading={isLoading} />
      <img
        src={provider === "bkash" ? bkash : provider === "nagad" ? nagad : ""}
        alt="provider"
        className="h-14 md:h-24 mx-auto"
      />
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-3">
        <div className="flex items-center gap-3 border p-3 md:p-5 rounded-md shadow">
          <div>
            <img
              src={logo}
              alt=""
              className="w-10 md:w-12 h-10 md:h-12 rounded-full border shadow"
            />
          </div>
          <div className="">
            <h2 className="font-semibold opacity-60">Mezba Shop</h2>
            <p className="font-semibold opacity-60 text-xs md:text-sm">
              ইনভয়েস আইডিঃ {id}
            </p>
          </div>
        </div>
        <div className="border p-4 rounded-md shadow flex flex-col items-center justify-center">
          <p className="flex items-center justify-center text-xl text-gray-600 font-semibold t">
            <TbCurrencyTaka className="text-lg font-bold" /> {amount}
          </p>
          {fee > 0 ? (
            <p className="text-center text-xs text-red-500">
              {fee.toFixed(2)}% ফি যুক্ত হয়েছে
            </p>
          ) : (
            <></>
          )}
        </div>
      </div>
      <form onSubmit={handleVerify} className="space-y-3">
        <div
          className={`text-white px-5 rounded-md ${
            provider === "bkash" ? "bg-[#e2136df6]" : "bg-[#C90008]"
          }`}
        >
          <h2 className="text-xl font-bold text-center py-2.5">
            ট্রানজেকশন আইডি দিন
          </h2>
          {paymentImage && (
          <img
            src={paymentImage}
            alt={`${provider} ${category}`}
            className="w-full rounded-md shadow-md h-24"
          />
        )}
        <div
          className={`rounded-md shadow-lg text-white px-5 py-2 my-2 ${
            provider === "bkash"
              ? "bg-[#af0850]"
              : "bg-[#8b060a]"
          }`}
        >
          <p className="text-xs md:text-sm font-medium opacity-90 text-center">
            প্রাপক নম্বর (
            {category === "personal"
              ? "পার্সোনাল"
              : category === "agent"
              ? "এজেন্ট"
              : "পেমেন্ট"}
            )
          </p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-xl md:text-2xl font-bold tracking-wider">
              {number}
            </p>
            <MdContentCopy
              onClick={handleCopy}
              className="text-lg md:text-xl cursor-pointer text-white/80 hover:text-white transition"
            />
          </div>
        </div>
        <div
          className={`rounded-md shadow-lg text-white px-5 py-2 my-2 ${
            provider === "bkash"
              ? "bg-[#af0850]"
              : "bg-[#8b060a]"
          }`}
        >
         <p className="flex items-center justify-center text-xl font-semibold t">
            <TbCurrencyTaka className="text-lg font-bold" /> {amount}
          </p>
          {fee > 0 ? (
            <p className="text-center text-xs text-red-200">
              {fee.toFixed(2)}% ফি যুক্ত হয়েছে
            </p>
          ) : (
            <></>
          )}
        </div>

          <input
            type="text"
            name="trxID"
            required
            className="py-2 px-3 rounded w-[85%] mx-auto block text-black text-lg font-semibold focus:outline-1 focus:outline-gray-400 placeholder:text-sm"
            placeholder="ট্রানজেকশন আইডি দিন"
          />
          <div className="flex items-center gap-2 border-b border-gray-400 py-3 text-sm">
            <span className="w-1.5 h-1.5 p-0.5 bg-white rounded-full block"></span>
            <p>
              {provider === "bkash"
                ? "*247#"
                : provider === "nagad"
                ? "*167#"
                : " "}{" "}
              ডায়াল করে আপনার <span className="uppercase">{provider}</span>{" "}
              মোবাইল মেনুতে যান অথবা{" "}
              <span className="uppercase">{provider}</span> অ্যাপে যান।
            </p>
          </div>
          <div className="flex items-center gap-2 border-b border-gray-400 py-3 text-sm">
            <span className="w-1.5 h-1.5 p-0.5 bg-white rounded-full block"></span>
            <p>
              <span className="text-[#fddd2b] font-semibold">
                &quot;{category === "personal" ? "Send Money" : category==="agent"?"Cash Out":"Payment"}
                &quot;
              </span>{" "}
              -এ ক্লিক করুন।
            </p>
          </div>
          <div className="flex items-center gap-2 border-b border-gray-400 py-3 text-sm">
            <span className="w-1.5 h-1.5 p-0.5 bg-white rounded-full block"></span>
            <p>
              প্রাপক নম্বর হিসেবে এই নম্বরটি লিখুনঃ{" "}
              <span className="text-[#fddd2b] font-semibold">{number}</span>{" "}
              <MdContentCopy
                onClick={handleCopy}
                className="inline-block text-lg ml-1.5 cursor-pointer text-green-400"
              />
            </p>
          </div>
          <div className="flex items-center gap-2 border-b border-gray-400 py-3 text-sm">
            <span className="w-1.5 h-1.5 p-0.5 bg-white rounded-full block"></span>
            <p>
              টাকার পরিমাণঃ{" "}
              <span className="text-[#fddd2b] font-semibold">{amount}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 border-b border-gray-400 py-3 text-sm">
            <span className="w-1.5 h-1.5 p-0.5 bg-white rounded-full block"></span>
            <p>
              নিশ্চিত করতে এখন আপনার{" "}
              <span className="uppercase">{provider}</span> মোবাইল মেনু পিন
              লিখুন।
            </p>
          </div>
          <div className="flex items-center gap-2 border-b border-gray-400 py-3 text-sm">
            <span className="w-1.5 h-1.5 p-0.5 bg-white rounded-full block"></span>
            <p>
              সবকিছু ঠিক থাকলে, আপনি{" "}
              <span className="uppercase">{provider}</span> থেকে একটি নিশ্চিতকরণ
              বার্তা পাবেন।
            </p>
          </div>
          <div className="flex items-center gap-2 py-3 text-sm">
            <span className="w-1.5 h-1.5 p-0.5 bg-white rounded-full block"></span>
            <p>
              এখন উপরের বক্সে আপনার{" "}
              <span className="text-[#fddd2b] font-semibold">
                Transaction ID
              </span>{" "}
              দিন এবং নিচের{" "}
              <span className="text-[#fddd2b] font-semibold">VERIFY</span> বাটনে
              ক্লিক করুন।
            </p>
          </div>
        </div>
        {attempt > 0 ? (
          <p className="text-center text-sm font-medium">
            আপনি আর {5 - attempt} বার চেষ্টা করতে পারবেন।
          </p>
        ) : (
          <></>
        )}

        {err && <p className="text-center font-medium text-[#C90008]" dangerouslySetInnerHTML={{__html: err}} />}
        <button
          type="submit"
          className="w-full bg-[#C90008] py-2 text-lg font-semibold uppercase text-white rounded-lg hover:opacity-80"
        >
          Verify
        </button>
      </form>
    </div>
  );
};

export default PayNew;

PayNew.propTypes = {
  id: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  number: PropTypes.string.isRequired,
  fee: PropTypes.number.isRequired,
  provider: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  from: PropTypes.string.isRequired,
  orderData: PropTypes.object,
};
