import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { TbCurrencyTaka } from "react-icons/tb";
import { FaExternalLinkAlt, FaMinus, FaPlus } from "react-icons/fa";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Coin from "../../components/reusuable/Coin/Coin";
import { AiFillYoutube } from "react-icons/ai";

const SpecialOfferDetails = () => {
  const { id } = useParams();
  const [offer, setOffer] = useState(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoadingUsername, setIsLoadingUsername] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [autoUid, setAutoUid] = useState("");
  const [quantity, setQuantity] = useState(1);
  const axiosPublic = useAxiosPublic();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  // load offers
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const res = await axiosPublic.get(`/special/get?id=${id}`);
      setOffer(res?.data || null);
      setLoading(false);
    };
    fetchData();
  }, [axiosPublic, id]);

  // purchase fn
  const handlePurchase = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    // check stock
    if (!offer?.stock) {
      toast.error("Stock Out!");
      setBtnLoading(false);
      return;
    }

    // Get input values as an object
    const formData = new FormData(e.target);
    const inputValues = offer?.inputs?.reduce((acc, input) => {
      acc[input] = formData.get(input) || "";
      return acc;
    }, {});

    // Check if any field is empty
    if (
      !offer?.isAuto &&
      Object.values(inputValues).some((value) => value.trim() === "")
    ) {
      toast.error("Please fill the boxes!");
      setBtnLoading(false);
      return;
    }

    // if user is not varified
    if (!user?.isVerified) {
      setBtnLoading(false);
      toast.error("Please Verify Your Email!");
      navigate("/myAccount");
      return;
    }

    const orderData = {
      id,
      email: user?.email,
      info: inputValues,
    };

    if (offer?.isAuto) {
      orderData.info = { uid: autoUid };
    }
    if (offer?.willHaveQuantity) {
      orderData.quantity = quantity;
    }

    // console.log(orderData);

    try {
      const res = await axiosPrivate.post("/order/new/special", orderData);

      // console.log("res-------", res.data);
      if (res.data.success) {
        toast.success("Purchase successful!");
        navigate("/myOrders");
      } else {
        toast.error("Purchase failed. Please try again.");
      }
    } catch (error) {
      // console.log(error);
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong. Try again later."
      );
    } finally {
      setBtnLoading(false);
    }
  };

  //   check username
  const handleCheckUsername = async () => {
    if (isLoadingUsername) return;
    if (!user) {
      setUsername("Please login first!");
      return;
    }
    if (offer?.isAuto && (autoUid?.length < 7 || autoUid?.length > 13)) {
      toast.error("Please enter valid Player UID");
      return;
    }
    setUsername("");
    setIsLoadingUsername(true);
    try {
      const { data } = await axiosPrivate.get("/auto/username", {
        params: { uid: autoUid },
      });
      console.log(data);
      setUsername(data?.username);
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

  // page apear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return <div className="py-10 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="py-10 px-6 bg-white rounded-lg border border-slate-300 text-center relative">
        <p
          className={`absolute top-2 right-2 text-white text-[10px] md:text-xs font-semibold badge ${
            offer?.stock > 0 ? "badge-success" : "badge-error"
          }`}
        >
          {offer?.stock > 0 ? "In Stock" : "Stock Out"}
        </p>
        <img
          src={offer?.image}
          className="w-full h-32 md:h-72 object-fill"
          alt={offer?.title || "Offer image"}
        />
        <h2 className="text-lg md:text-3xl font-bold my-3">{offer?.title}</h2>
        <p className="text-lg font-bold flex justify-center items-center text-primary">
          {offer?.type == "coin" ? <Coin /> : <TbCurrencyTaka />}
          {offer?.price}
        </p>
        <p className="text-gray-600 mb-2">{offer?.shortDescription}</p>
        {/* input boxes*/}
        <h3 className="font-semibold py-2 text-left">Fill the inputs:</h3>
        <form onSubmit={handlePurchase}>
          <div
            className={`grid grid-cols-1 gap-2 ${
              offer?.isAuto ? "md:grid-cols-2" : "md:grid-cols-3"
            }`}
          >
            {offer?.isAuto ? (
              <>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  name="autoInput"
                  className="border px-2 py-1 rounded outline-none"
                  placeholder="Player ID"
                  value={autoUid || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setAutoUid(value);
                  }}
                  required
                />
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
              </>
            ) : (
              <>
                {offer?.inputs?.map((input, idx) => (
                  <input
                    key={idx}
                    type="text"
                    name={input}
                    className="border px-2 py-1 rounded outline-none"
                    placeholder={input}
                    required
                  />
                ))}
              </>
            )}
            {offer?.willHaveQuantity && (
              <div className="flex items-center gap-5 px-5">
                <label htmlFor="">Quantity: </label>
                <div className="flex items-center gap-2 border-[3px] rounded-full">
                  <button
                    type="button"
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="cursor-pointer w-full h-full py-3 pl-3"
                  >
                    <FaMinus className="text-base" />
                  </button>
                  <input
                    className="w-10 text-center"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  ></input>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="cursor-pointer w-full h-full py-3 pr-3"
                  >
                    <FaPlus className="text-base" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-primary text-white rounded-md"
            disabled={btnLoading}
          >
            {btnLoading ? "Loading..." : "Purchase"}
          </button>
        </form>
        <div className="mt-5 md:mt-10 text-blue-700 font-semibold">
          <Link
            to={offer?.tutorialUrl || "/"}
            target="_blank"
            className="flex justify-center items-center gap-1"
          >
            <AiFillYoutube className="text-red-700 text-2xl" />
            {offer?.tutorialTitle}
            <FaExternalLinkAlt />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SpecialOfferDetails;
