import { useRef } from "react";
import { TbCurrencyTaka } from "react-icons/tb";
import Swal from "sweetalert2";
import { MdContentCopy } from "react-icons/md";
import PropTypes from "prop-types";

const OrderHistory = ({ order }) => {
  const codesRef = useRef(null);
  const {
    orderID,
    category,
    name,
    price,
    status,
    orderTime,
    updateTime,
    codes,
    feedback,
  } = order || {};
  const handleCopy = async () => {
    if (codesRef.current) {
      try {
        const allCodes = codesRef.current.value.split("\n");
        const firstCode = allCodes[0].substring(5);
        allCodes[0] = firstCode;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-between px-4 py-5 border-2 rounded">
        <div className="w-full">
          <p className="">
            <span className="font-bold">Order ID: </span>
            {orderID}
          </p>
          <p className="capitalize">
            <span className="font-bold">Category: </span>
            {category}
          </p>
          <p className="">
            <span className="font-bold">Package: </span>
            {name}
          </p>
          <p className="flex items-center">
            <span className="font-bold pr-1">Price:</span> {price}{" "}
            <TbCurrencyTaka />
          </p>
        </div>
        <div className="w-full">
          <p className="capitalize">
            <span className="font-bold">Status:</span>{" "}
            <span
              className={`font-bold ${
                status === "complete"
                  ? "text-green-800"
                  : status === "pending"
                  ? "text-yellow-500"
                  : status === "cancelled"
                  ? "text-red-500"
                  : ""
              }`}
            >
              {status}
            </span>
          </p>
          <p>
            <span className="font-bold">Order Time: </span>
            {orderTimeDate?.toLocaleDateString("en-GB")} (
            {orderTimeDate?.toLocaleTimeString()})
          </p>
          <p>
            <span className="font-bold">Update Time: </span>
            {updateTimeDate?.toLocaleDateString("en-GB")} (
            {updateTimeDate?.toLocaleTimeString()})
          </p>
        </div>
        <div className="w-full md:col-span-2 lg:col-span-1 mt-3 lg:mt-0">
          {category === "unipin" || category === "shell" ? (
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
  );
};

export default OrderHistory;
OrderHistory.propTypes = {
  order: PropTypes.object.isRequired,
};
