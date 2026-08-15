import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { TbCurrencyTaka } from "react-icons/tb";
import { IoInformationCircleOutline } from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import Loader from "../../components/Loader";
import Coin from "../../components/reusuable/Coin/Coin";
import ImageSwiper from "../../components/reusuable/ImageSwiper/ImageSwiper";

// Convert any common YouTube URL form into an embeddable one
const getYoutubeEmbedUrl = (url) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.includes("/embed/")) return trimmed;
  let id = "";
  if (trimmed.includes("youtu.be/")) {
    id = trimmed.split("youtu.be/")[1]?.split(/[?&#]/)[0];
  } else if (trimmed.includes("watch?v=")) {
    id = trimmed.split("watch?v=")[1]?.split(/[&#]/)[0];
  } else if (trimmed.includes("/shorts/")) {
    id = trimmed.split("/shorts/")[1]?.split(/[?&#]/)[0];
  }
  return id ? `https://www.youtube.com/embed/${id}` : "";
};

const ItemDetails = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [payMethod, setPayMethod] = useState("wallet");
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const price = item?.offerPrice ?? item?.originalPrice ?? 0;
  const hasDiscount =
    item?.offerPrice != null &&
    item?.originalPrice != null &&
    item.offerPrice < item.originalPrice;
  const embedUrl = getYoutubeEmbedUrl(item?.videoUrl);
  // wa.me opens the WhatsApp app on mobile and WhatsApp Web on desktop
  const whatsappDigits = (item?.whatsappNumber || "").replace(/\D/g, "");
  const whatsappLink = whatsappDigits
    ? `https://wa.me/${whatsappDigits}${
        item?.whatsappText
          ? `?text=${encodeURIComponent(item.whatsappText)}`
          : ""
      }`
    : "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const { data } = await axiosPublic.get(`/serviceItems/get?id=${itemId}`);
        setItem(data);

        if (data?.serviceId) {
          try {
            const serviceRes = await axiosPublic.get(
              `/services/get?id=${data.serviceId}`
            );
            setService(serviceRes.data);
          } catch {
            // service details are only needed for labels/breadcrumb
          }
        }
      } catch (err) {
        console.error("Failed to load item:", err);
        setError("Item not found or no longer available.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [axiosPublic, itemId]);

  // Fall back to direct payment when the wallet cannot cover the price
  useEffect(() => {
    if (price > user?.balance) {
      setPayMethod("direct");
    } else {
      setPayMethod("wallet");
    }
  }, [price, user?.balance]);

  const handlePayMethod = (method) => {
    if (method === "wallet" && user?.balance < price) {
      setPayMethod("direct");
    } else {
      setPayMethod(method);
    }
  };

  const handlePurchase = () => {
    if (!user) {
      toast.error("Please Login First!");
      navigate("/login", { state: location.pathname });
      return;
    }
    if (item?.isSold) {
      toast.error("This item is already sold!");
      return;
    }
    if (payMethod === "wallet" && user?.balance < price) {
      const restAmount = Math.ceil(price - user?.balance);
      navigate("/addBalance/method", {
        state: { amount: restAmount, from: "confirmPurchase" },
      });
      return;
    }
    navigate("/confirmPurchase", {
      state: {
        name: "itemListing",
        item,
        service,
        payMethod,
      },
    });
  };

  if (isLoading) {
    return <Loader isLoading={true} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 text-xl font-semibold">{error}</p>
        <Link to="/" className="mt-4 text-blue-600 hover:underline">
          ← Go back to Home
        </Link>
      </div>
    );
  }

  const statLabels = service?.statLabels || [];

  return (
    <div className="md:py-5 max-w-4xl mx-auto space-y-4">
      {/* Images */}
      <div className="border-2 rounded-md overflow-hidden">
        <ImageSwiper
          images={item?.images}
          delayMs={item?.swiperDelay}
          maxHeightClass="max-h-[75vh]"
        />
      </div>

      {/* Title + admin WhatsApp contact */}
      <div className="flex items-start justify-between gap-3">
        <div>
          {item?.itemNumber ? (
            <span className="inline-block bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white text-xs md:text-sm font-bold px-3 py-1 rounded-full mb-1.5 tracking-wide">
              Item No: #{item.itemNumber}
            </span>
          ) : null}
          <h1 className="text-xl md:text-3xl font-bold capitalize">
            {item?.title}
          </h1>
        </div>
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 bg-[#25D366] text-white font-semibold rounded-md px-3 py-2 text-xs md:text-sm hover:opacity-90 transition-opacity"
          >
            <FaWhatsapp className="text-lg md:text-xl" />
            Admin Whatsapp
          </a>
        )}
      </div>

      {/* 4 stats */}
      <div className="grid grid-cols-4 gap-2 border-2 rounded-md py-3">
        {statLabels.map((label, idx) => (
          <div key={idx} className="text-center">
            <p className="text-[10px] md:text-sm text-gray-500 capitalize">
              {label}
            </p>
            <p className="text-sm md:text-xl font-bold">
              {item?.stats?.[idx] ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* YouTube video */}
      {embedUrl && (
        <div className="border-2 rounded-md overflow-hidden">
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            <iframe
              src={embedUrl}
              title="Item video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </div>
      )}

      {/* Description */}
      {item?.description && (
        <div className="border rounded-md p-3 md:p-6">
          <div
            dangerouslySetInnerHTML={{ __html: item.description }}
            className="rich-text-output"
          />
        </div>
      )}

      {/* Price + purchase */}
      <div className="border-2 rounded-md">
        <h2 className="text-xl text-center font-semibold border-b-2 py-2">
          Summary
        </h2>
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-semibold">Price:</span>
            {hasDiscount && (
              <span className="flex items-center text-gray-400 line-through">
                <TbCurrencyTaka />
                {item?.originalPrice}
              </span>
            )}
            <span className="flex items-center text-xl font-bold text-[#E61C55]">
              <TbCurrencyTaka />
              {price}
            </span>
          </div>

          {item?.coin > 0 && (
            <p className="text-sm flex gap-1">
              <IoInformationCircleOutline className="text-lg" />
              বোনাস কয়েনঃ
              <span className="flex items-center font-semibold text-red-600">
                <Coin />
                {item?.coin}
              </span>
            </p>
          )}

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

          {item?.isSold ? (
            <button
              disabled
              className="bg-gray-400 w-full py-1.5 px-5 rounded-md font-semibold text-white cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : user ? (
            <div className="space-y-3">
              <div className="flex justify-center gap-4 md:gap-10">
                <div
                  onClick={() => handlePayMethod("wallet")}
                  className={`border-[3px] px-4 py-2 w-1/2 md:w-1/3 flex flex-col items-center justify-center rounded-md hover:cursor-pointer ${
                    payMethod === "wallet" ? "border-primary" : ""
                  }`}
                >
                  <p className="text-center font-semibold">Wallet</p>
                  <p className="flex items-center text-sm">
                    <TbCurrencyTaka /> {user?.balance || 0}
                  </p>
                </div>
                <div
                  onClick={() => handlePayMethod("direct")}
                  className={`border-[3px] px-4 py-2 w-1/2 md:w-1/3 flex flex-col items-center justify-center rounded-md hover:cursor-pointer ${
                    payMethod === "direct" ? "border-primary" : ""
                  }`}
                >
                  <p className="text-center font-semibold">Direct</p>
                  <p className="text-xs">Bkash, Nagad..</p>
                </div>
              </div>
              <button
                onClick={handlePurchase}
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
    </div>
  );
};

export default ItemDetails;
