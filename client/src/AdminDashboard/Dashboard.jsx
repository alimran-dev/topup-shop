import { useEffect, useState } from "react";
import { TbCurrencyTaka } from "react-icons/tb";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Loader from "../components/Loader";
import DataTable from "./DashboardComponents/DataTable";
import Coin from "../components/reusuable/Coin/Coin";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [autoState,setAutoState] = useState({});
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    axiosPrivate.get("/dashboard/admin").then((res) => {
      setIsLoading(false);
      setData(res.data);
    });
  }, [axiosPrivate]);

  console.log(data);

  useEffect(()=>{
    axiosPrivate.get("/auto/unipins-data")
    .then(res=>{
      setIsLoading(false);
      setAutoState(res?.data);
    })
  },[axiosPrivate])

  // page apear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Loader isLoading={isLoading} />
      {/* Balance Statistics */}
      <div className="-mt-4">
        <h1 className="text-center text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text">
          Balance Statistics
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 items-center my-5">
          <div className="w-full h-full bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-center py-5 px-4 rounded-md flex items-center justify-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-semibold text-white">Total Added</h3>
              <p className="flex items-center justify-center text-center text-2xl font-semibold text-white">
                <TbCurrencyTaka /> {data?.balance?.totalBalance?.toFixed(2) || 0}
              </p>
            </div>
          </div>
          <div className="w-full h-full bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-center py-5 px-4 rounded-md flex items-center justify-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-semibold text-white">Total Spent</h3>
              <p className="flex items-center justify-center text-center text-2xl font-semibold text-white">
                <TbCurrencyTaka /> {data?.balance?.totalSpent || 0}
              </p>
            </div>
          </div>
          <div className="w-full h-full bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-center py-5 px-4 rounded-md flex items-center justify-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-semibold text-white">Available</h3>
              <p className="flex items-center justify-center text-center text-2xl font-semibold text-white">
                <TbCurrencyTaka /> {data?.balance?.available?.toFixed(2) || 0}
              </p>
            </div>
          </div>
          <div className="w-full h-full bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-center py-5 px-4 rounded-md flex items-center justify-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-semibold text-white">Available Coins</h3>
              <p className="flex items-center justify-center text-center text-2xl font-semibold text-white">
                <Coin /> {data?.balance?.availableCoin?.toFixed(2) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Order Statistics  */}
      <div>
        <h1 className="text-center text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text">
          Order Statistics
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 items-center my-5">
          <div className="w-full h-full bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-center py-5 px-4 rounded-md flex items-center justify-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-semibold text-white">Total Order</h3>
              <p className="flex items-center justify-center text-center text-2xl font-semibold text-white">
                {data?.orders?.totalOrders || 0}
              </p>
            </div>
          </div>
          <div className="w-full h-full bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-center py-5 px-4 rounded-md flex items-center justify-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-semibold text-white">
                Pending Order
              </h3>
              <p className="flex items-center justify-center text-center text-2xl font-semibold text-white">
                {data?.orders?.pendingOrders || 0}
              </p>
            </div>
          </div>
          <div className="w-full h-full bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-center py-5 px-4 rounded-md flex items-center justify-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-semibold text-white">
                Completed Order
              </h3>
              <p className="flex items-center justify-center text-center text-2xl font-semibold text-white">
                {data?.orders?.completedOrders || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {/* auto stats */}
        <DataTable title={"Auto Statistics"} thead={{first: "Name", second: "Quantity"}} data={autoState?.result || []} category={"auto"} total={autoState?.total || 0} />
        {/* unipins stats */}
        <DataTable title={"Unipins Statistics"} thead={{first: "UC", second: "Quantity"}} data={data?.unipins || []} category={"unipins"}  />
        {/* shells stats */}
        <DataTable title={"Shells Statistics"} thead={{first: "Name", second: "Quantity"}} data={data?.shells || []} category={"shells"} />
      </div>
    </div>
  );
};

export default Dashboard;
