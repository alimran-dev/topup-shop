import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { MdContentCopy } from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";
import Swal from "sweetalert2";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { FaHashtag } from "react-icons/fa";
import toast from "react-hot-toast";
import CopyToClipboard from "react-copy-to-clipboard";
import { TiTick } from "react-icons/ti";
import Coin from "../../components/reusuable/Coin/Coin";

const OrderCard = ({ order }) => {
  const [newStatus, setNewStatus] = useState(order?.status);
  const [newFeedback, setNewFeedback] = useState(order?.feedback);
  const [loading, setLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(order?.status === "cancelled");
  const codesRef = useRef(null);
  const axiosPrivate = useAxiosPrivate();
  const {
    _id,
    orderID,
    subCategory,
    category,
    name,
    email,
    price,
    status,
    type,
    orderTime,
    updateTime,
    codes,
    info,
    feedback,
    processedExternally,
    order: externalOrder,
    screenshots
  } = order || {};
  const orderTimeDate = new Date(orderTime);
  const updateTimeDate = new Date(updateTime);
  const [copied, setCopied] = useState({});

  const handleCopyUid = async () => {
    const uidRegex = /\(UID: (.+?)\)/;
    const match = name?.match(uidRegex);
    if (match && match[1]) {
      const uid = match[1];
      try {
        await navigator.clipboard.writeText(uid);
        Swal.fire({
          title: `Player ID Copied "${uid}"`,
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

  // order update status
  const handleUpdate = () => {
    setIsDisable(true);
    setLoading(true);

    const updatedOrder = { id: _id, status: newStatus, feedback: newFeedback };

    axiosPrivate
      .patch("/order/admin/processing", updatedOrder)
      .then((res) => {
        // console.log(res.data);
        setIsDisable(newStatus === "cancelled");
        if (res.data?.modifiedCount) {
          toast.success("Order Updated Successfully!");
          setLoading(false);
          window.location.reload();
        } else {
          toast.error("Something Went Wrong!");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something Went Wrong!");
        setLoading(false);
      });
  };

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

  // handleCopyInfo
  const handleCopyInfo = (key) => {
    setCopied((prevCopied) => ({ ...prevCopied, [key]: true }));
    setTimeout(() => {
      setCopied((prevCopied) => ({ ...prevCopied, [key]: false }));
    }, 2000);
  };

  return (
    <div>
      <div className="px-4 py-5 border-2 rounded shadow-xl">
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

        {/* change status  */}
        <div className="flex items-center gap-2 pb-3 mb-2 border-b border-b-slate-300">
          <h4 className="font-bold">Change Status:</h4>
          <select
            onChange={(e) => setNewStatus(e.target.value)}
            name=""
            id=""
            defaultValue={processedExternally? externalOrder?.status:status}
            className="capitalize border border-slate-400 px-4 py-1 rounded-md"
          >
            {/* <option value={status} disabled selected hidden>
                  {status}
                </option> */}
            <option value="pending" className="font-semibold" hidden>
              Pending
            </option>
            <option value="cancelled" className="font-semibold">
              Cancel
            </option>
            <option value="complete" className="font-semibold">
              Complete
            </option>
          </select>
        </div>

        {/* order summary */}
        <div className="w-full capitalize">
          <p className="capitalize">
            <span className="font-bold">Category: </span>
            {subCategory || category}
          </p>
          <p className="">
            <span className="font-bold">Package: </span>
            {name}
            {category === "idcode" ||
            category === "weekly & monthly" ||
            category === "airdrop" ||
            category === "lessIsMore" ? (
              <MdContentCopy
                onClick={handleCopyUid}
                className="inline-block text-green-500 text-lg cursor-pointer ml-2"
              />
            ) : (
              <></>
            )}
          </p>
          <p className="flex items-center">
            <span className="font-bold pr-1">Price:</span>
            {type === "balance"?<TbCurrencyTaka />: <Coin />} {price}
          </p>
          {info &&
            Object.entries(info).map(([key, value], idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="font-bold">{key}: </span>
                <p className="flex items-center gap-1">
                  <span>{value}</span>
                  <CopyToClipboard text={value}>
                    <button
                      onClick={() => handleCopyInfo(key)}
                      className={`${copied[key] ? "text-green-700" : ""}`}
                      disabled={copied[key]}
                    >
                      {copied[key] ? <TiTick /> : <MdContentCopy />}
                    </button>
                  </CopyToClipboard>
                </p>
              </div>
            ))}
        </div>

        {/* times */}
        <div className="border-y py-2 my-2">
          <p>
            <span className="font-bold">Order Time: </span>
            {orderTimeDate?.toLocaleDateString()} (
            {orderTimeDate?.toLocaleTimeString()})
          </p>
          <p>
            <span className="font-bold">Update Time: </span>
            {updateTimeDate?.toLocaleDateString()} (
            {updateTimeDate?.toLocaleTimeString()})
          </p>
        </div>

        {/* feedback */}
        <div className="w-full md:col-span-2 lg:col-span-1 mt-3 lg:mt-0">
          {subCategory === "unipin" ||
          subCategory === "shell" ||
          subCategory === "card" || (processedExternally && status==="complete") ? (
            <div>
              <textarea
                disabled
                value={processedExternally? externalOrder?.unipins?.join("\n")?.concat("\n",screenshots?.join("\n")):codes.join("\n")}
                name=""
                ref={codesRef}
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
            <div>
              <textarea
                onChange={(e) => setNewFeedback(e.target.value)}
                defaultValue={feedback}
                placeholder="Write your feedback here...."
                className="border w-full h-24 px-3 py-1"
              ></textarea>
              <button
                onClick={handleUpdate}
                disabled={loading || isDisable || status === "cancelled" || status === "complete"}
                className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-white font-semibold rounded block mx-auto disabled:opacity-60 disabled:cursor-not-allowed mt-5"
              >
                {loading ? "Please Wait" : "Update"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
OrderCard.propTypes = {
  order: PropTypes.object.isRequired,
  orders: PropTypes.array.isRequired,
  setOrders: PropTypes.func.isRequired,
  fromPending: PropTypes.bool.isRequired,
  totalOrders: PropTypes.number.isRequired,
  setTotalOrders: PropTypes.func,
};
