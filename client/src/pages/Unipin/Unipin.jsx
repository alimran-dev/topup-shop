import { useEffect, useRef, useState } from "react";
import unipin from "../../assets/images/unipin.jpg";
import {
  TbCurrencyTaka,
  TbSquareRoundedNumber1Filled,
  TbSquareRoundedNumber2Filled,
} from "react-icons/tb";
import { FaMinus, FaPlus } from "react-icons/fa";
import { IoInformationCircleOutline } from "react-icons/io5";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import CategoryOption from "../../components/CategoryOption";
import Loader from "../../components/Loader";
import useAuth from "../../hooks/useAuth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { MdArrowOutward } from "react-icons/md";
import bkashLogo from '../../assets/images/bkash.png';
import nagadLogo from '../../assets/images/nagad.png';
import Coin from "../../components/reusuable/Coin/Coin";
import { allLinks } from "../../utils/constants";
import { AiFillYoutube } from "react-icons/ai";



const Unipin = () => {
  const [selected, setSelected] = useState({ _id: "", price: 0, coin: 0 });
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [price, setPrice] = useState(0);
  const [error, setError] = useState("");
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const purchaseRef = useRef(null);


  const handlePurchase = () => {

    setError("");
    setIsLoading(true);
    if (!selected._id || !selected.price || !quantity) {
      setError("Please select option and quantity");
      setIsLoading(false);
      return;
    }
    const order = { id: selected._id, email: user?.email, quantity };

    if (user?.balance < selected?.price) {
      const restAmount = Math.ceil(selected?.price - user?.balance);
      navigate('/addBalance/method', { state: restAmount });
    }

    else {
      navigate('/confirmPurchase', { state: { name: "unipin", selected, orderData: order } });
    }
  };

  useEffect(() => {
    axiosPublic.get(`/option/all?category=unipin`).then((res) => {
      // console.log(res.data);
      setOptions(res.data);
      setIsLoading(false);
    });
    setPrice(selected.price * quantity);
  }, [axiosPublic, quantity, selected.price]);


  // page apear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  return (
    <div className="flex flex-col gap-5">
      <Loader isLoading={isLoading} />
      <div className="flex items-center gap-3 border-2 py-4 px-6 rounded">
        <img
          src={unipin}
          alt=""
          className="w-24 h-20 md:w-28 md:h-24 rounded-[30px]"
        />
        <div>
          <p className="text-xl md:text-2xl font-semibold">
            Unipin Voucher (BDT)
          </p>
          <p className="md:text-lg font-medium text-gray-500">Game / Top-Up</p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <div className="border-2 rounded p-3 md:hidden">
          <Link
            to={allLinks.unipinTutorial || "#"}
            target="_blank"
            className="text-blue-700 font-semibold flex items-center justify-center gap-1"
          >
            <AiFillYoutube className="text-red-700 text-2xl" />
            কিভাবে টপ আপ করবেন ভিডিও <MdArrowOutward className="" />{" "}
          </Link>
        </div>
        <div className="md:col-span-2 border-2 rounded">
          <h1 className="text-xl font-semibold py-2 px-5 border-b-2 flex items-center gap-2">
            <TbSquareRoundedNumber1Filled className="text-red-500" /> Select
            Category
          </h1>
          <div className="col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 px-3 md:px-5 py-5">
            {options?.map((option) => (
              <CategoryOption
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
          <div className="border-2 rounded p-3 mb-3 hidden md:block">
            <Link
              to={allLinks.unipinTutorial || "#"}
              target="_blank"
              className="text-blue-700 font-semibold flex items-center justify-center gap-1"
            >
              <AiFillYoutube className="text-red-700 text-2xl" />
              কিভাবে টপ আপ করবেন ভিডিও <MdArrowOutward className="" />{" "}
            </Link>
          </div>
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
          <div ref={purchaseRef} className="border-2 rounded mt-3">
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

export default Unipin;
