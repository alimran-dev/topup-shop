import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import {
  TbCurrencyTaka,
  TbSquareRoundedNumber1Filled,
  TbSquareRoundedNumber2Filled,
} from "react-icons/tb";
import { IoInformationCircleOutline } from "react-icons/io5";
import Loader from "../../components/Loader";
import { MdArrowOutward } from "react-icons/md";
import OptionCard from "./OptionCard";
import toast from "react-hot-toast";
import bkashLogo from "../../assets/images/bkash.png";
import nagadLogo from "../../assets/images/nagad.png";
import Coin from "../../components/reusuable/Coin/Coin";
import { AiFillYoutube } from "react-icons/ai";
import { FaMinus, FaPlus } from "react-icons/fa";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const SubCategory = () => {
  const { id } = useParams();

  const [allData, setAllData] = useState({});
  const [selected, setSelected] = useState({
    _id: "",
    price: 0,
    coin: 0,
    willHaveQuantity: false,
  });
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [isLoadingUsername, setIsLoadingUsername] = useState(false);
  const [price, setPrice] = useState(0);
  const [inputValues, setInputValues] = useState({});
  const [payMethod, setPayMethod] = useState("wallet");
  const [categoryName, setCategoryName] = useState("");
  const axiosPublic = useAxiosPublic();
  const axiosPrivate = useAxiosPrivate();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const purchaseRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

    // console.log(inputValues);

  useEffect(() => {
    axiosPublic.get(`/services/get?id=${id}`).then((res) => {
      setAllData(res?.data);
      setOptions(res.data.options);
      setIsLoading(false);

      // Initialize inputValues
      const initialInputs = {};
      res.data.inputs.forEach((input) => {
        initialInputs[input] = "";
      });
      setInputValues(initialInputs);

      // Fetch category name
      if (res.data?.categoryId) {
        axiosPublic
          .get("/category")
          .then((catRes) => {
            const found = catRes.data.find(
              (c) => c._id === res.data.categoryId
            );
            if (found) setCategoryName(found.title);
          })
          .catch(() => {});
      }
    });
    setPrice(selected.price);
  }, [axiosPublic, id, selected?.price]);

  //   console.log(allData);

  useEffect(() => {
    setPrice(selected?.price * quantity);
  }, [quantity, selected?.price]);

  useEffect(()=>{
    if(price>user?.balance){
      setPayMethod("direct");
    }else {
      setPayMethod("wallet");
    }
  },[price, user?.balance])
  // Handle input change
  const handleInputChange = (e, label) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [label]: e.target.value,
    }));
  };

  // handle purchase
  const handleProceedToConfirmation = () => {
    if (!selected.idx || !selected.name || !selected.price) {
      toast.error("Please select an option");
      return;
    }

    const emptyFields = Object.entries(inputValues).filter(
      ([key, value]) => !value.trim()
    );
    if (!allData?.isAuto && emptyFields.length > 0) {
      toast.error("Please fill all input fields");
      return;
    }
    if (
      allData?.isAuto && allData?.server!=="unipinNormal" &&
      (!inputValues?.uid || inputValues?.uid?.length < 7 || inputValues?.uid?.length > 13)
    ) {
      toast.error("Please enter valid Player UID");
      return;
    }

    if (!user) {
      toast.error("Please Login First!");
      navigate("/login");
      return;
    }

    if (user?.balance < price && payMethod === "wallet") {
      const restAmount = Math.ceil(price - user?.balance);
      navigate("/addBalance/method", { state: {amount: restAmount, from: "subCategory"} });
    } else {
      navigate("/confirmPurchase", {
        state: {
          name: "dynamic",
          selected,
          inputValues: allData?.server === "unipinNormal"?{}:inputValues,
          orderData: allData,
          quantity,
          payMethod,
        },
      });
    }
  };

  const handlePayMethod = (method) =>{
    if(method==="wallet" && user?.balance<price){
      setPayMethod("direct");
    }else{
      setPayMethod(method);
    }
  }

  //   check username
  const handleCheckUsername = async () => {
    if (isLoadingUsername) return;
    if (!user) {
      setUsername("Please login first!");
      return;
    }
    if (
      allData?.isAuto &&
      (inputValues?.uid?.length < 7 || inputValues?.uid?.length > 13)
    ) {
      toast.error("Please enter valid Player UID");
      return;
    }
    setUsername("");
    setIsLoadingUsername(true);
    try {
      const { data } = await axiosPrivate.get("/auto/username", {
        params: { uid: inputValues?.uid },
      });
      console.log(data);
      setUsername(data?.player_info?.nickname);
      setUsernameChecked(true);
      setIsLoadingUsername(false);
    } catch (err) {
      console.log(err?.message);
      if (typeof err?.response.data === "string") {
        setUsername(err?.response.data);
      } else {
        setUsername(err?.response.data?.message || "Something went wrong!");
      }
      setIsLoadingUsername(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Loader isLoading={isLoading} />

      <div className="flex items-center gap-3 border-2 py-4 px-6 rounded">
        <img
          src={allData?.image}
          alt=""
          className="w-24 h-20 md:w-28 md:h-24 rounded-[30px]"
        />
        <div>
          <p className="text-xl md:text-2xl font-semibold capitalize">
            {allData?.title}
          </p>
          <p className="md:text-lg font-medium text-gray-500">
            {categoryName || allData?.category}
          </p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <div className="border-2 rounded p-3 md:hidden">
          <Link
            to={allData?.tutorialURL}
            target="_blank"
            className="text-blue-700 font-semibold flex items-center justify-center gap-1 capitalize"
          >
            <AiFillYoutube className="text-red-700 text-2xl" />
            {allData?.tutorialText} <MdArrowOutward />
          </Link>
        </div>

        <div className="md:col-span-2 border-2 rounded">
          <h1 className="text-xl font-semibold py-2 px-5 border-b-2 flex items-center gap-2">
            <TbSquareRoundedNumber1Filled className="text-red-500" /> Select
            Option
          </h1>
          <div className="col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 px-3 md:px-5 py-5">
            {options?.map((option, idx) => (
              <OptionCard
                key={idx}
                idx={idx + 1}
                option={option}
                selected={selected}
                setSelected={setSelected}
                purchaseRef={purchaseRef}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="border-2 rounded p-3 mb-3 hidden md:block">
            <Link
              to={allData?.tutorialURL}
              target="_blank"
              className="text-blue-700 font-semibold flex items-center justify-center gap-1 capitalize"
            >
              <AiFillYoutube className="text-red-700 text-2xl" />{" "}
              {allData?.tutorialText} <MdArrowOutward className="" />{" "}
            </Link>
          </div>

          {allData?.inputs?.length > 0 && (
            <div className="text-xl font-semibold border-2 rounded w-full">
              <h2 className="flex-1 flex items-center gap-2 border-b-2 px-5 py-3">
                <TbSquareRoundedNumber2Filled className="text-red-500" />
                Additional Information
              </h2>
              <div className={`py-3 space-y-3`}>
                {allData?.isAuto ||
                  allData?.inputs?.map((label, idx) => (
                    <div key={idx} className="px-5 capitalize">
                      <label htmlFor={label} className="block text-base mb-1">
                        {label}
                      </label>
                      <input
                        type="text"
                        name={label}
                        placeholder={label}
                        className="text-base px-3 py-1 border border-gray-400 rounded w-full"
                        value={inputValues[label] || ""}
                        onChange={(e) => handleInputChange(e, label)}
                      />
                    </div>
                  ))}
                {allData?.isAuto && allData?.server!=="unipinNormal" && (
                  <div className="px-5">
                    <label htmlFor="" className="block text-base mb-1">
                      Player UID
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="uid"
                      placeholder="Player UID"
                      className="text-base px-3 py-1 border border-gray-400 rounded w-full"
                      value={inputValues.uid || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setInputValues({ uid: value });
                      }}
                    />
                  </div>
                )}
                {allData?.isAuto && allData?.server!=="unipinNormal" && (
                  <p
                    className={`username-bg ${
                      usernameChecked ? "opacity-100" : "opacity-65"
                    }`}
                    onClick={handleCheckUsername}
                  >
                    {username || isLoadingUsername
                      ? username
                      : "Click to check player name"}
                    {isLoadingUsername && (
                      <span className="loading loading-dots loading-md"></span>
                    )}
                  </p>
                )}
                {(selected?.willHaveQuantity || allData?.server==="unipinNormal") && (
                  <div className="flex items-center gap-5 px-5">
                    <label htmlFor="">Quantity: </label>
                    <div className="flex items-center gap-2 border-[3px] rounded-full">
                      <button
                        onClick={() =>
                          quantity > 1 && setQuantity(quantity - 1)
                        }
                        className="cursor-pointer w-full h-full py-3 pl-3"
                      >
                        <FaMinus className="text-base" />
                      </button>
                      <input
                        className="w-10 text-center"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(parseInt(e.target.value) || 0)
                        }
                      ></input>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="cursor-pointer w-full h-full py-3 pr-3"
                      >
                        <FaPlus className="text-base" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={purchaseRef} className="border-2 rounded my-3">
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
                      {user?.balance?.toFixed(2)}
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
              {user ? (
                <div className="space-y-3">
                  <div className="flex justify-center gap-4 md:gap-10">
                    <div onClick={()=>handlePayMethod("wallet")} className={`border-[3px] px-4 py-2 w-1/2 md:w-1/3 flex flex-col items-center justify-center rounded-md hover:cursor-pointer ${payMethod==="wallet"?"border-primary": ""}`}>
                      <p className="text-center font-semibold">Wallet</p>
                      <p className="flex items-center text-sm"><TbCurrencyTaka /> {user?.balance || 0}</p>
                    </div>
                    <div onClick={()=>handlePayMethod("direct")} className={`border-[3px] px-4 py-2 w-1/2 md:w-1/3 flex flex-col items-center justify-center rounded-md hover:cursor-pointer ${payMethod==="direct"?"border-primary": ""}`}>
                      <p className="text-center font-semibold">Direct</p>
                      <p className="text-xs">Bkash, Nagad..</p>
                    </div>
                  </div>
                  <button
                    onClick={handleProceedToConfirmation}
                    className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-full py-1.5 px-5 rounded-md font-semibold text-white"
                  >
                    Purchase
                  </button>
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

          {/* add balance */}
          {user && (
            <Link to={"/addBalance"} className="block p-3 rounded border-2">
              <button className="border-2 border-[#FA6023] px-4 py-0.5 rounded font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] bg-clip-text text-transparent block mx-auto w-fit mt-2">
                Add Balance
              </button>
              <div className="flex justify-center items-center py-3">
                <div className="w-20 h-fit">
                  <img
                    src={bkashLogo}
                    className="w-full h-full object-contain"
                    alt="Bkash Logo"
                  />
                </div>
                <div className="w-20 h-fit">
                  <img
                    src={nagadLogo}
                    className="w-full h-full object-contain"
                    alt="Nagad Logo"
                  />
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
      <div className="border rounded-md p-3 md:p-6">
        <div
          dangerouslySetInnerHTML={{ __html: allData?.rules }}
          className="rich-text-output"
        />
      </div>
    </div>
  );
};

export default SubCategory;
