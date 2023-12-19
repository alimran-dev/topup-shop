import { useState } from "react";
import "./MyOrders.css";
import OrderHistory from "./OrderHistory";
import MyCodes from "./MyCodes";

const MyOrders = () => {
  const [isHistory, setIsHistory] = useState(true);
  return (
    <div>
      <div className="w-fit mx-auto">
        <button
          onClick={() => setIsHistory(true)}
          className={`order-tab-border`}
        >
          <span
            className={`${
              isHistory
                ? "order-active-tab"
                : "bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text font-bold text-lg px-3 py-1.5"
            }`}
          >
            Order History
          </span>
        </button>
        <button
          onClick={() => setIsHistory(false)}
          className={`order-tab-border`}
        >
          <span
            className={`${
              isHistory
                ? "bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text font-bold text-lg px-3 py-1.5"
                : "order-active-tab"
            }`}
          >
            My Codes
          </span>
        </button>
          </div>
          <div className="my-8">
              {isHistory?<OrderHistory />:<MyCodes />}
          </div>
    </div>
  );
};

export default MyOrders;
