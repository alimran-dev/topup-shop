import { useEffect, useState } from "react";
import AllOrders from "./AllOrders";
import PendingOrders from "./PendingOrders";

const Orders = () => {
  const [isAll, setIsAll] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  },[])
  return (
    <div className="md:-mt-5">
      <div className="flex items-center justify-center">
        <button onClick={()=>setIsAll(true)} className={`px-3 py-1.5 font-semibold rounded-l border-2 border-primary ${isAll?"bg-gradient-to-r from-primary to-secondary text-white":"text-primary"}`}>All Orders</button>
        <button onClick={()=>setIsAll(false)} className={`px-3 py-1.5 font-semibold rounded-r border-2 border-primary ${!isAll?"bg-gradient-to-r from-primary to-secondary text-white":"text-primary"}`}>Pending Orders</button>
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
