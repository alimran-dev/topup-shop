import { useEffect, useState } from "react";
import AllOrders from "./AllOrders";
import PendingOrders from "./PendingOrders";

const Orders = () => {
  const [isAll, setIsAll] = useState(true);
  useEffect(() => {
    window.scrollTo(0, 0);
  },[])
  return (
    <div className="md:-mt-5">
      <div className="flex items-center justify-center">
        <button onClick={()=>setIsAll(true)} className={`px-3 py-1.5 font-semibold rounded-l border-2 border-[#FA6023] ${isAll?"bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white":"text-[#FA6023]"}`}>All Orders</button>
        <button onClick={()=>setIsAll(false)} className={`px-3 py-1.5 font-semibold rounded-r border-2 border-[#FA6023] ${!isAll?"bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white":"text-[#FA6023]"}`}>Pending Orders</button>
      </div>
      <div className="mt-5">
        {
          isAll?<AllOrders />:<PendingOrders />
        }
      </div>
    </div>
  );
};

export default Orders;
