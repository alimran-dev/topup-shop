import { useRef } from "react";
import { TbCurrencyTaka } from "react-icons/tb";
import Swal from "sweetalert2";
import { MdContentCopy } from "react-icons/md";
import PropTypes from "prop-types";
import { FaHashtag } from "react-icons/fa";
import Coin from "../../components/reusuable/Coin/Coin";

const OrderHistory = ({ order }) => {
  const codesRef = useRef(null);
  const {
    orderID,
    email,
    category,
    name,
    price,
    status,
    orderTime,
    updateTime,
    codes,
    feedback,
    subCategory,
    info,
    type,
  } = order || {};
  const handleCopy = async () => {
    if (codesRef.current) {
      try {
        const allCodes = codesRef.current.value.split("\n");
        // const firstCode = allCodes[0].substring(5);
        // if (category !== "card") {
        //   allCodes[0] = firstCode;
        // }
        const allCodesMod = allCodes.join("\n");
        await navigator.clipboard.writeText(allCodesMod);
        Swal.fire({
          title: "Text Copied",
          icon: "success",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
          position: "top",
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Failed to Copy",
          icon: "error",
          toast: true,
          showConfirmButton: false,
          timer: 1500,
          position: "top",
        });
      }
    }
  };
  const orderTimeDate = new Date(orderTime);
  const updateTimeDate = new Date(updateTime);

  return (
    <div>
      {/* order card */}
      <div className="px-4 py-6 border-2 border-slate-200 rounded">
        <div>
          <div className="flex justify-between">
            <div>
              <h3 className="flex gap-1 text-xl">
                <p className="font-bold flex items-center">
                  <FaHashtag /> Order ID:{" "}
                </p>
                {orderID}
              </h3>
              <p className="opacity-90 normal-case">Package: {name}</p>
              <p className="opacity-90 normal-case flex items-center">
                Price: 
                {type == "coin" ? <Coin /> : <TbCurrencyTaka />}
                {price}
              </p>
            </div>
            <div className="flex flex-col justify-between">
              <span
                className={`font-bold border px-3 py-1 capitalize text-xs ${
                  status === "complete"
                    ? "text-green-800 border-green-800"
                    : status === "pending"
                    ? "text-yellow-500 border-yellow-500"
                    : status === "cancelled"
                    ? "text-red-500 border-red-500"
                    : ""
                } rounded-full`}
              >
                • {status}
              </span>
              <button
                className="button"
                onClick={() =>
                  document.getElementById(`order_detail_${orderID}`).showModal()
                }
              >
                Detail
              </button>
            </div>
          </div>
          {subCategory === "unipin" ||
          subCategory === "shell" ||
          subCategory === "card" ? (
            <>
              {codes && (
                <div className="pt-3">
                  <textarea
                    ref={codesRef}
                    disabled
                    value={codes.join("\n")}
                    name=""
                    className="border-2 h-24 w-full rounded px-2 py-0.5"
                  ></textarea>
                  <button
                    onClick={handleCopy}
                    className="border-2 border-gray-400 bg-gray-200 px-3 py-1 font-semibold rounded block mx-auto"
                  >
                    <MdContentCopy className="inline-block" /> Copy All
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="pt-2 mt-3">
              <h4 className="font-bold pb-2">Feedback</h4>
              {feedback ? (
                <p>{feedback}</p>
              ) : (
                <p className="text-xs normal-case">Not added yet!</p>
              )}
            </div>
          )}
          {/* feedback */}
        </div>
      </div>

      {/* order detail modal */}
      <dialog id={`order_detail_${orderID}`} className="modal">
        <div className="modal-box bg-white">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          {/* order data */}
          <div className="px-4 py-5 capitalize">
            <div className="w-full">
              {/* order id - category - package - status */}
              <div className="flex justify-between border-b border-b-slate-300 pb-4 mb-3">
                <div>
                  <h3 className="flex gap-1 text-xl">
                    <p className="font-bold flex items-center">
                      <FaHashtag /> Order ID:{" "}
                    </p>
                    {orderID}
                  </h3>
                  <p className="opacity-90 normal-case">E-mail: {email}</p>
                </div>
                <div>
                  <span
                    className={`font-bold border px-3 py-1 capitalize text-xs ${
                      status === "complete"
                        ? "text-green-800 border-green-800"
                        : status === "pending"
                        ? "text-yellow-500 border-yellow-500"
                        : status === "cancelled"
                        ? "text-red-500 border-red-500"
                        : ""
                    } rounded-full`}
                  >
                    • {status}
                  </span>
                </div>
              </div>

              {/* times */}
              <div className="border-b border-b-slate-300 pb-3 mb-3">
                <p>
                  <span className="font-semibold">Order Time: </span>
                  {orderTimeDate?.toLocaleDateString("en-GB")} (
                  {orderTimeDate?.toLocaleTimeString()})
                </p>
                <p>
                  <span className="font-semibold">Update Time: </span>
                  {updateTimeDate?.toLocaleDateString("en-GB")} (
                  {updateTimeDate?.toLocaleTimeString()})
                </p>
              </div>

              {/* order summary */}
              <div>
                <h4 className="font-bold pb-2">Order Summary</h4>

                <p className="flex items-center gap-3 pb-1">
                  <span className="w-24 font-semibold">Category</span>
                  <span>:</span>
                  <span>{subCategory || category}</span>
                </p>

                <p className="flex items-center gap-3 pb-1">
                  <span className="w-24 font-semibold">Package</span>
                  <span>:</span>
                  <span>{name}</span>
                </p>
                <p className="flex items-center gap-3 pb-1">
                  <span className="w-24 font-semibold">Price</span>
                  <span>:</span>
                  <span className="flex items-center">
                    {type == "coin" ? <Coin /> : <TbCurrencyTaka />}
                    {price}</span>
                </p>
                {info &&
                  Object.entries(info).map(([key, value], idx) => (
                    <p key={idx} className="flex items-center gap-3 pb-1">
                      <span className="w-24 font-semibold">{key}</span>
                      <span>:</span>
                      <span>{value}</span>
                    </p>
                  ))}
              </div>
            </div>

            <div className="w-full md:col-span-2 lg:col-span-1 mt-3 lg:mt-0">
              {subCategory === "unipin" ||
              subCategory === "shell" ||
              subCategory === "card" ? (
                <div>
                  <textarea
                    ref={codesRef}
                    disabled
                    value={codes.join("\n")}
                    name=""
                    className="border-2 h-24 w-full rounded px-2 py-0.5"
                  ></textarea>
                  <button
                    onClick={handleCopy}
                    className="border-2 border-gray-400 bg-gray-200 px-3 py-1 font-semibold rounded block mx-auto"
                  >
                    <MdContentCopy className="inline-block" /> Copy All
                  </button>
                </div>
              ) : (
                <></>
              )}
              {category === "idcode" ||
              category === "weekly & monthly" ||
              category === "airdrop" ||
              category === "lessIsMore" ? (
                status === "pending" ? (
                  <div className="flex items-center justify-center h-full w-full">
                    <p className="text-xl font-semibold text-center">
                      অনুগ্রহপূর্বক অপেক্ষা করুন
                    </p>
                  </div>
                ) : status === "cancelled" ? (
                  <div className="h-full w-full">
                    <p className="text-center font-semibold">
                      অর্ডার বাতিল হওয়ার কারনঃ
                    </p>
                    <p className="text-center">{feedback}</p>
                  </div>
                ) : (
                  ""
                )
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default OrderHistory;
OrderHistory.propTypes = {
  order: PropTypes.object.isRequired,
};
