import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const TransactionCard = ({ transaction }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { _id, method, toPay, willAdd, fee, number, trxID, time, status } =
    transaction || {};
  const date = new Date(time);
  const handleContinue = () => {
    const doc = {
      id: _id,
      provider: method?.split(" ")[0],
      category: method?.split(" ")[1],
      amount: toPay,
      number,
      fee,
    };
    navigate("/addBalance/pay", { state: doc });
  };
  return (
    <>
      <div className="hidden md:flex justify-center items-center">
        <p className="h-14 flex items-center justify-center w-full border text-sm text-center capitalize">
          {method}
        </p>
        <p className="h-14 flex items-center justify-center w-full border text-sm text-center">
          <span>
            {date.toLocaleDateString("en-GB")}
            <br />
            {date.toLocaleTimeString()}
          </span>
        </p>
        <p className="h-14 flex items-center justify-center w-full border text-sm text-center">
          {trxID}
        </p>
        <p className="h-14 flex items-center justify-center w-full border text-sm text-center">
          {status == "completed" ? user?.balance - willAdd : user?.balance}
        </p>
        <p className="h-14 flex items-center justify-center w-full border text-sm text-center">
          {willAdd}
        </p>
        <p
          className={`h-14 flex items-center justify-center w-full border text-sm text-center font-semibold capitalize ${
            status === "pending"
              ? "text-yellow-500"
              : status === "completed"
              ? "text-green-800"
              : ""
          }`}
        >
          {status}
        </p>
        <div className="h-14 flex items-center justify-center w-full border">
          <button
            onClick={handleContinue}
            className={`text-sm text-center bg-gradient-to-r from-[#FA6023] to-[#E61C55] px-2.5 py-1 rounded text-white font-medium mx-auto block ${
              status !== "pending" ? "hidden" : ""
            }`}
          >
            Continue
          </button>
        </div>
      </div>
      <div className="md:hidden border border-gray-400 rounded-md p-3 my-4">
        <p className="capitalize">
          <span className="font-semibold">Method: </span> {method}
        </p>
        <p>
          <span className="font-semibold">Time: </span>
          {date.toLocaleDateString("en-GB")} {date.toLocaleTimeString()}
        </p>
        <p>
          <span className="font-semibold">Trx ID: </span>
          {trxID}
        </p>
        <p>
          <span className="font-semibold">Amount: </span>
          {willAdd}
        </p>
        <p>
          <span className="font-semibold">Status: </span>{" "}
          <span
            className={`font-bold capitalize ${
              status === "pending"
                ? "text-yellow-500"
                : status === "completed"
                ? "text-green-800"
                : ""
            }`}
          >
            {status}
          </span>
        </p>
        <button
          onClick={handleContinue}
          className={`bg-gradient-to-r from-[#FA6023] to-[#E61C55] px-2.5 py-1 rounded text-white font-medium mx-auto block mt-1.5 ${
            status !== "pending" ? "hidden" : ""
          }`}
        >
          Continue
        </button>
      </div>
    </>
  );
};

export default TransactionCard;

TransactionCard.propTypes = {
  transaction: PropTypes.object.isRequired,
};
