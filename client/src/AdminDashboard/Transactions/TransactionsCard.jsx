import PropTypes from "prop-types";
import { MdContentCopy } from "react-icons/md";
import Swal from "sweetalert2";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useState } from "react";

const TransactionsCard = ({
  transaction,
  setTransactions,
  transactions,
  totalTrx,
  setTotalTrx,
}) => {
  const [status, setStatus] = useState(transaction.status);
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const { _id, method, amount, toPay, willAdd, number, trxID, time, email } =
    transaction || {};
  const date = new Date(time);

  const handleUpdate = (e) => {
    if(loading) return;
    e.preventDefault();
    setLoading(true);
    const status = e.target.status.value;
    axiosPrivate
      .patch(`/transaction/admin/status?id=${_id}&status=${status}`)
      .then((res) => {
        if (res.data.completed) {
          setStatus("completed");
          Swal.fire({
            toast: true,
            title: "Status updated",
            showConfirmButton: false,
            position: "top",
            icon: "success",
            timer: 3000,
          });
        } else if (res.data?.deletedCount > 0) {
          const newTransactions = transactions.filter((trx) => trx._id !== _id);
          setTotalTrx(totalTrx - res.data?.deletedCount);
          setTransactions(newTransactions);
          Swal.fire({
            toast: true,
            title: "Transaction cancelled",
            showConfirmButton: false,
            position: "top",
            icon: "success",
            timer: 3000,
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({
          toast: true,
          title: "Failed to update status",
          showConfirmButton: false,
          position: "top",
          icon: "error",
          timer: 3000,
        });
        setLoading(false);
      });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trxID);
      Swal.fire({
        toast: true,
        title: "TrxID copied",
        icon: "success",
        position: "top",
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        toast: true,
        title: "Failed to copy",
        icon: "error",
        position: "top",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };
  return (
    <form
      onSubmit={handleUpdate}
      className="border rounded shadow flex flex-col md:flex-row gap-2 p-4"
    >
      <div className="flex-1 space-y-1">
        <p className="capitalize">
          <span className="font-semibold">Method: </span> {method}
        </p>
        <p>
          <span className="font-semibold">Amount: </span> {amount?.toFixed(2)}{" "}
          BDT
        </p>
        <p>
          <span className="font-semibold">Will Add: </span>{" "}
          {willAdd?.toFixed(2)} BDT
        </p>
        <p>
          <span className="font-semibold">To Pay: </span> {toPay} BDT
        </p>
        <p>
          <span className="font-semibold">Number: </span> {number}
        </p>
        <p>
          <span className="font-semibold">Trx ID: </span> {trxID}{" "}
          <MdContentCopy
            onClick={handleCopy}
            className="inline-block ml-1.5 text-lg text-green-400 font-semibold cursor-pointer"
          />
        </p>
      </div>
      <div className="flex-1 space-y-1">
        <p>
          <span className="font-semibold">Time: </span>
          {date.toLocaleDateString("en-GB")} {date.toLocaleTimeString()}
        </p>
        <p>
          <span className="font-semibold">Email: </span>
          {email}
        </p>
        <div className="py-1">
          <label htmlFor="status" className="font-semibold">
            Status:{" "}
          </label>
          <select
            name="status"
            id=""
            className={`px-2 py-1 rounded font-semibold ${
              status === "completed"
                ? "text-green-700"
                : status === "pending"
                ? "text-yellow-500 bg-black"
                : ""
            }`}
            defaultValue={status}
            disabled={status === "completed"}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancel">Cancel</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white font-semibold px-3 py-1 rounded block mx-auto md:mx-0 disabled:opacity-70"
          disabled={status === "completed"}
        >
          {loading?"Please wait": "Update"}
        </button>
      </div>
    </form>
  );
};

export default TransactionsCard;

TransactionsCard.propTypes = {
  transaction: PropTypes.object.isRequired,
  transactions: PropTypes.array.isRequired,
  setTransactions: PropTypes.func.isRequired,
  totalTrx: PropTypes.number.isRequired,
  setTotalTrx: PropTypes.func.isRequired,
};
