import { Link, useLocation, useNavigate } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { useEffect, useRef, useState } from "react";
import Loader from "../../components/Loader";
// import { MdArrowOutward } from "react-icons/md";
import {
  TbCurrencyTaka,
  TbSquareRoundedNumber1Filled,
  TbSquareRoundedNumber2Filled,
} from "react-icons/tb";
import { FaMinus, FaPlus } from "react-icons/fa";
import { IoInformationCircleOutline } from "react-icons/io5";
import useAuth from "../../hooks/useAuth";
import { HiOutlineInformationCircle } from "react-icons/hi";
import OptionCard from "./OptionCard";
import rechargeImg from "../../assets/images/recharge-card.jpeg";
import toast from 'react-hot-toast';
import bkashLogo from '../../assets/images/bkash.png';
import nagadLogo from '../../assets/images/nagad.png';
import Coin from "../../components/reusuable/Coin/Coin";
import RechargeModal from "./RechargeModal";


const CardsOptions = () => {
  const [selected, setSelected] = useState({ id: "", name: "", price: 0, coin: 0 });
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [price, setPrice] = useState(0);
  const [error, setError] = useState("");
  const location = useLocation();
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const [mobileNumber, setMobileNumber] = useState("");
  const [rechargeType, setRechargeType] = useState("prepaid");
  const navigate = useNavigate();
  const purchaseRef = useRef(null);


  useEffect(() => {
    axiosPublic
      .get(
        `/option/all?category=recharge&id=${location.state?.id}&docName=${location.state?.docName}`
      )
      .then((res) => {
        setOptions(res.data);
        setIsLoading(false);
      });
    setPrice(selected.price * quantity);
  }, [
    axiosPublic,
    location.state?.docName,
    location.state?.id,
    quantity,
    selected.price,
  ]);


  const handlePurchase = () => {

    setError("");
    setIsLoading(true);

    // check option selected or not
    if (!selected.id || !selected.price) {
      setError("Please select an option");
      setIsLoading(false);
      return;
    }

    // check funds
    if (selected.price > user?.balance) {
      toast.error('Insufficient Funds!');
      navigate("/addBalance")
      setIsLoading(false);
      return;
    }

    if (location?.state?.type == "offerCard") {

      // check if number is empty
      if (mobileNumber == "") {
        toast.error('Please Fill Mobile Number');
        setIsLoading(false);
        return;
      }

      // check bd number
      const bdMobileRegex = /^(?:\+8801|01)[3-9]\d{8}$/;
      if (!bdMobileRegex.test(mobileNumber)) {
        toast.error("Please enter valid BD number");
        setIsLoading(false);
        return;
      }

      // console.log(mobileNumber, rechargeType);

      const orderData = {
        id: selected.id,
        email: user.email,
        type: rechargeType,
        phone: mobileNumber
      };

      setIsLoading(false);
      navigate("/confirmPurchase", { state: { name: "recharge", category: "offerCard", company: location?.state?.companyName, option: selected, orderData, } });
    }
    else {
      if (!selected.id || !selected.price) {
        setError("Please select option and quantity");
        setIsLoading(false);
        return;
      }

      const orderData = { id: selected.id, email: user?.email, quantity };

      setIsLoading(false);
      navigate("/confirmPurchase", { state: { name: "recharge", category: "rechargeCard", company: location?.state?.companyName, option: selected, orderData } })
    }

  };


  // console.log("location--------", location?.state);
  // console.log(options);


  // page appear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  return (
    <div className="flex flex-col gap-5">
      <RechargeModal />
      <Loader isLoading={isLoading} />
      <div className="flex items-center gap-3 border-2 py-4 px-6 rounded">
        <img
          src={rechargeImg}
          alt=""
          className="w-24 h-20 md:w-28 md:h-24 rounded-[30px]"
        />
        <div>
          <p className="text-xl md:text-2xl font-semibold">
            {location?.state?.title}
          </p>

        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {/* {
          location.state?.type != "offerCard" &&
          <div className="border-2 rounded p-3 md:hidden">
            <Link
              to={"https://youtu.be/GLM0yU_Xzkg?si=qo_Ma0WOVVgU7kQ_"}
              target="_blank"
              className="text-blue-700 font-semibold flex items-center justify-center gap-1"
            >
              কিভাবে টপ আপ করবেন ভিডিও <MdArrowOutward className="" />{" "}
            </Link>
          </div>
        } */}
        <div className="md:col-span-2 border-2 rounded">
          <h1 className="text-xl font-semibold py-2 px-5 border-b-2 flex items-center gap-2">
            <TbSquareRoundedNumber1Filled className="text-red-500" />
            {location.state?.docName == "mbMinOffer" ? "Select Item" : "Select Category"}
          </h1>
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-3 md:px-5 py-5">
            {options?.map((option) => (
              <OptionCard
                option={option}
                selected={selected}
                setSelected={setSelected}
                key={option._id}
                purchaseRef={purchaseRef}
              />
            ))}
          </div>
        </div>
        <div>

          {/* {
            location.state?.type != "offerCard" &&
            <div className="border-2 rounded p-3 mb-3 hidden md:block">
              <Link
                to={"https://youtu.be/GLM0yU_Xzkg?si=qo_Ma0WOVVgU7kQ_"}
                target="_blank"
                className="text-blue-600 font-semibold flex items-center justify-center gap-1"
              >
                কিভাবে টপ আপ করবেন ভিডিও <MdArrowOutward className="" />{" "}
              </Link>
            </div>
          } */}
          {
            location.state?.type != "offerCard" &&
            <div className="text-xl font-semibold py-2 px-5 border-2 rounded flex md:flex-col lg:flex-row items-center gap-2 w-full">
              <h2 className="flex-1 flex items-center gap-2">
                <TbSquareRoundedNumber2Filled className="text-red-500" /> Quantity
              </h2>
              <div className="flex items-center gap-2 border-[3px] rounded-full">
                <span
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="cursor-pointer w-full h-full py-3 pl-3"
                >
                  <FaMinus className="text-base" />
                </span>
                <input
                  className="w-10 text-center"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                ></input>
                <span
                  onClick={() => setQuantity(quantity + 1)}
                  className="cursor-pointer w-full h-full py-3 pr-3"
                >
                  <FaPlus className="text-base" />
                </span>
              </div>
            </div>
          }

          {/* inputs for mbMinOffer */}
          {
            location.state?.type == "offerCard" &&
            <form ref={purchaseRef} className="p-3 border rounded">
              <div>
                <label>Mobile Number</label>
                <input type="number" onChange={(e) => setMobileNumber(e.target.value)} className="w-full px-3 py-1 rounded border mt-1 mb-3" placeholder="Type mobile number" value={mobileNumber} required />
              </div>
              <div>
                <label>Type</label>
                <select onChange={(e) => setRechargeType(e.target.value)} className="w-full px-3 py-1 rounded border mt-1" value={rechargeType}>
                  <option value="prepaid">Prepaid</option>
                  <option value="postpaid">Postpaid</option>
                </select>
              </div>
            </form>
          }

          <div className="border-2 rounded mt-3">
            <h2 className="text-xl text-center font-semibold border-b-2 py-2">
              Summary
            </h2>
            <div className="px-5 py-4 space-y-3">
              {user && (
                <>
                  <p className="text-sm flex gap-1">
                    <IoInformationCircleOutline className="text-lg" />
                    আপনার ব্যালেন্সঃ{" "}
                    <span className="flex items-center font-semibold text-red-600">
                      <TbCurrencyTaka />
                      {(user?.balance)?.toFixed(2)}
                    </span>
                  </p>
                </>
              )}
              <p className="text-sm flex gap-1">
                <IoInformationCircleOutline className="text-lg" />
                বোনাস কয়েনঃ
                <span className="flex items-center font-semibold text-red-600">
                  <Coin />
                  {selected?.coin || 0}
                </span>
              </p>
              <p className="text-sm flex gap-1">
                <IoInformationCircleOutline className="text-lg" />
                প্রোডাক্টের মোট মূল্যঃ
                <span className="flex items-center font-semibold text-red-600">
                  <TbCurrencyTaka />
                  {price}
                </span>
              </p>
              {user && (
                <>
                  <p className="text-sm flex gap-1">
                    <IoInformationCircleOutline className="text-lg" />
                    আপনার অবশিষ্ট ব্যালেন্সঃ{" "}
                    <span className="flex items-center font-semibold text-red-600">
                      <TbCurrencyTaka />
                      {(user?.balance - price)?.toFixed(2)}
                    </span>
                  </p>
                </>
              )}
              {error && (
                <p className="text-xl font-semibold text-red-500 text-center">
                  {error}
                </p>
              )}
              {user ? (
                <div className="space-y-3">
                  <button
                    onClick={handlePurchase}
                    className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-full py-1.5 px-5 rounded-md font-semibold text-white"
                  >
                    Purchase
                  </button>
                  <Link to={"/addBalance"} className="block p-3 rounded border-2">
                    <button
                      className="border-2 border-[#FA6023] px-4 py-0.5 rounded font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] bg-clip-text text-transparent block mx-auto w-fit mt-2"
                    >
                      Add Balance
                    </button>
                    <div className="flex justify-center items-center py-3">
                      <div className="w-20 h-fit">
                        <img src={bkashLogo} className="w-full h-full object-contain" alt="Bkash Logo" />
                      </div>
                      <div className="w-20 h-fit">
                        <img src={nagadLogo} className="w-full h-full object-contain" alt="Nagad Logo" />
                      </div>
                    </div>
                  </Link>
                </div>
              ) : (
                <Link
                  to={"/login"}
                  state={location.pathname}
                  className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] block text-center w-full py-1.5 px-5 rounded-md font-semibold text-white"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-md">
        <h2 className="flex items-center gap-1 text-2xl font-semibold border rounded-md py-2 px-3">
          <HiOutlineInformationCircle className="mt-0.5" /> Rules & Conditions
        </h2>
        <div className="px-8 py-5 space-y-2">
          <p className="text-lg font-semibold">
            অর্ডার করার আগে ভালো ভাবে পড়ে নিন
          </p>
          <p>⦿ শুধুমাত্র BD সার্ভারে VOUCHER দিয়ে টপ আপ হবে</p>
          <p>
            ⦿ কোড রিডিম করুন{" "}
            <span className="font-medium">shop.garena.my </span> থেকে ।
          </p>
          <p>
            ⦿ UPBD দেখালে <span className="font-medium">Unipin Gift Card</span>{" "}
            এ ব্যবহার করতে হবে
          </p>
          <p>
            ⦿ BDMB দেখালে <span className="font-medium">Unipin Voucher</span> এ
            ব্যবহার করতে হবে
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardsOptions;
