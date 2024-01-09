import { useEffect, useRef, useState } from "react";
import Loader from "../../components/Loader";
import idcode from "../../assets/images/idcode.png";
import {
  TbCurrencyTaka,
  TbSquareRoundedNumber1Filled,
  TbSquareRoundedNumber2Filled,
} from "react-icons/tb";
import CategoryOption from "../../components/CategoryOption";
import useAuth from "../../hooks/useAuth";
import { IoInformationCircleOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const Idcode = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState({ _id: "", price: 0 });
  const [error, setError] = useState("");
  const [options, setOptions] = useState([]);
  const { user, setUser } = useAuth();
  const axiosPublic = useAxiosPublic();
  const axiosPrivate = useAxiosPrivate();
  const uidRef = useRef(null);
  const navigate = useNavigate();

  const handlePurchase = () => {
    setIsLoading(true);
    setError("");
    if (user.balance < selected.price) {
      setIsLoading(false);
      setError("Not enough balance.");
      return;
    }
    if (uidRef.current?.value && selected._id) {
      const uid = uidRef.current.value;
      const order = { id: selected._id, email: user?.email, uid: uid };
      axiosPrivate
        .post("/purchase/idcode", order)
        .then((res) => {
          // console.log(res.data);
          setIsLoading(false);
          setUser({
            ...user,
            balance: user?.balance - selected.price,
            spent: user?.spent + selected.price,
            orders: user?.orders + 1,
          });
          navigate("/myOrders");
        })
        .catch((err) => {
          setIsLoading(false);
          setError(err);
        });
    } else {
      setError("Please Provide Player Id and Select Option");
      setIsLoading(false);
    }
  };
  useEffect(() => {
    window.scrollTo(0, 0);
    axiosPublic.get(`/options?category=idcode`).then((res) => {
      // console.log(res.data);
      setOptions(res.data);
      setIsLoading(false);
    });
    // setPrice(selected.price * quantity);
  }, [axiosPublic]);
  return (
    <div>
      <div className="flex flex-col gap-5">
        <Loader isLoading={isLoading} />
        <div className="flex items-center gap-3 border-2 py-4 px-6 rounded">
          <img
            src={idcode}
            alt=""
            className="w-24 h-20 md:w-28 md:h-24 rounded-[30px]"
          />
          <div>
            <p className="text-xl md:text-2xl font-semibold">
              IDCODE Topup [BD SERVER]
            </p>
            <p className="md:text-lg font-medium text-gray-500">
              Game / Top-Up
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 border-2 rounded">
            <h1 className="text-xl font-semibold py-2 px-5 border-b-2 flex items-center gap-2">
              <TbSquareRoundedNumber1Filled className="text-red-500" /> Select
              Category
            </h1>
            <div className="col-span-2 grid md:grid-cols-2 lg:grid-cols-3 gap-4 px-3 md:px-5 py-5">
              {options?.map((option) => (
                <CategoryOption
                  option={option}
                  selected={selected}
                  setSelected={setSelected}
                  key={option._id}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xl font-semibold border-2 rounded w-full">
              <h2 className="flex-1 flex items-center gap-2 border-b-2 px-5 py-3">
                <TbSquareRoundedNumber2Filled className="text-red-500" /> Player
                Information
              </h2>
              <div className="px-5 py-3">
                <label htmlFor="uid" className="block text-base mb-1">
                  Player ID
                </label>
                <input
                  ref={uidRef}
                  type="text"
                  name="uid"
                  placeholder="Player ID (UID)"
                  className="text-base px-3 py-1 border border-gray-400 rounded w-full"
                />
              </div>
            </div>
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
                        {user?.balance}
                      </span>
                    </p>
                  </>
                )}
                <p className="text-sm flex gap-1">
                  <IoInformationCircleOutline className="text-lg" />
                  প্রোডাক্টের মোট মূল্যঃ
                  <span className="flex items-center font-semibold text-red-600">
                    <TbCurrencyTaka />
                    {selected.price}
                  </span>
                </p>
                {user && (
                  <>
                    <p className="text-sm flex gap-1">
                      <IoInformationCircleOutline className="text-lg" />
                      আপনার অবশিষ্ট ব্যালেন্সঃ{" "}
                      <span className="flex items-center font-semibold text-red-600">
                        <TbCurrencyTaka />
                        {user?.balance - selected.price}
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
                  <button
                    onClick={handlePurchase}
                    className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-full py-1.5 px-5 rounded-md font-semibold text-white"
                  >
                    Purchase
                  </button>
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
      </div>
    </div>
  );
};

export default Idcode;
