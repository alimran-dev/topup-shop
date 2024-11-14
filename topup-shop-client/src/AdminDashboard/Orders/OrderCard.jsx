import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { MdContentCopy } from "react-icons/md";
import { TbCurrencyTaka } from "react-icons/tb";
import Swal from "sweetalert2";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const OrderCard = ({
  order,
  orders,
  setOrders,
  fromPending,
  totalOrders,
  setTotalOrders,
}) => {
  const [newStatus, setNewStatus] = useState(order?.status);
  const [newFeedback, setNewFeedback] = useState(order?.feedback);
  const [isDisable, setIsDisable] = useState(order?.status === "cancelled");
  const codesRef = useRef(null);
  const axiosPrivate = useAxiosPrivate();
  const {
    _id,
    orderID,
    category,
    name,
    email,
    price,
    status,
    orderTime,
    updateTime,
    codes,
    feedback,
  } = order || {};
  const orderTimeDate = new Date(orderTime);
  const updateTimeDate = new Date(updateTime);

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
  // console.log(newStatus, newFeedback);
  const handleUpdate = () => {
    setIsDisable(true);
    const updatedOrder = { id: _id, status: newStatus, feedback: newFeedback };
    axiosPrivate
      .patch("/admin/orders/processing", updatedOrder)
      .then((res) => {
        setIsDisable(newStatus === "cancelled");
        if (res.data?.modifiedCount) {
          Swal.fire({
            title: "Order Updated Successfully",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: "top",
          });
          if (fromPending) {
            const newOrders = orders.filter((order) => order.id !== orders._id);
            setOrders(newOrders);
            setTotalOrders(--totalOrders);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
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
              <select
                onChange={(e) => setNewStatus(e.target.value)}
                name=""
                id=""
                defaultValue={status}
                className="capitalize border"
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
            </span>
          </p>
          <p>
            <span className="font-bold">Email: </span>
            {email}
          </p>
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
        <div className="w-full md:col-span-2 lg:col-span-1 mt-3 lg:mt-0">
          {category === "unipin" || category === "shell" ? (
            <div>
              <textarea
                disabled
                value={codes.join("\n")}
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
            <></>
          )}
          {category === "idcode" ||
          category === "weekly & monthly" ||
          category === "airdrop" ||
          category === "lessIsMore" ? (
            <div className="w-full h-full">
              {" "}
              <textarea
                onChange={(e) => setNewFeedback(e.target.value)}
                defaultValue={feedback}
                placeholder="Write your feedback here...."
                className="border w-full h-24 px-3 py-1"
              ></textarea>
              <button
                onClick={handleUpdate}
                disabled={isDisable}
                className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-white font-semibold rounded block mx-auto disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Update
              </button>
            </div>
          ) : (
            <></>
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
