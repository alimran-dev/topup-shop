import { useEffect, useState } from "react";
import unipin from "../../assets/images/shell.jpg";
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
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const Shell = () => {
  const [selected, setSelected] = useState({ _id: "", price: 0 });
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [price, setPrice] = useState(0);
  const [error, setError] = useState("");
  const axiosPublic = useAxiosPublic();
  const axiosPrivate = useAxiosPrivate();
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handlePurchase = () => {
    setError("");
    setIsLoading(true);
    if (!selected._id || !selected.price || !quantity) {
      setError("Please select option and quantity");
      setIsLoading(false);
      return;
    }
    const order = { id: selected._id, email: user?.email, quantity };
    axiosPrivate
      .post("/purchase/shell", order)
      .then((res) => {
        console.log(res.data);
        setIsLoading(false);
        setUser({
          ...user,
          balance: user?.balance - res.data?.price,
          orders: user?.orders + 1,
          spent: user?.spent + price,
        });
        navigate("/myOrders");
      })
      .catch((err) => {
        setError(err.response.data.error);
        setIsLoading(false);
      });
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  },[])
  useEffect(() => {
    axiosPublic.get(`/options?category=shell`).then((res) => {
      console.log(res.data);
      setOptions(res.data);
      setIsLoading(false);
    });
    setPrice(selected.price * quantity);
  }, [axiosPublic, quantity, selected.price]);
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
            Garena Shell Code (MY)
          </p>
          <p className="md:text-lg font-medium text-gray-500">Game / Top-Up</p>
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
                      {user?.balance - price}
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
  );
};

export default Shell;
