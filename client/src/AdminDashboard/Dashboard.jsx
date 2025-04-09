import { useEffect, useState } from "react";
import { TbCurrencyTaka } from "react-icons/tb";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import Loader from "../components/Loader";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    axiosPrivate.get("/dashboard/admin").then((res) => {
      setIsLoading(false);
      setData(res.data);
    });
  }, [axiosPrivate]);

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
        {/* unipins stats */}
        <div>
          <h2 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center py-3 mx-auto px-2 md:px-5 capitalize">
            Unipins Statistics
          </h2>
          <table className="w-full my-3">
            <thead>
              <tr className="text-center">
                <th className="border-2 border-[#FA6023] w-1/2 py-1.5 border-collapse">
                  UC
                </th>
                <th className="border-2 border-[#FA6023] w-1/2 py-1.5 border-collapse">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.unipins?.map((item, idx) => {
                if (item.codes) {
                  return (
                    <tr className="text-center" key={idx}>
                      <td className="border-2 border-[#FA6023] w-1/2 font-medium py-1.5 border-collapse">
                        {item.uc} UC
                      </td>
                      <td className="border-2 border-[#FA6023] w-1/2 font-medium py-1.5 border-collapse">
                        {item.codes}
                      </td>
                    </tr>
                  );
                }
              })}
              <tr className="text-center">
                <td className="border-2 border-[#FA6023] w-1/2 font-bold py-1.5 border-collapse">
                  Total
                </td>
                <td className="border-2 border-[#FA6023] w-1/2 font-bold py-1.5 border-collapse">
                  {data?.unipins?.reduce((acc, item) => {
                    return acc + item.codes;
                  }, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* shells stats */}
        <div>
          <h2 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center py-3 mx-auto px-2 md:px-5 capitalize">
            Shell Statistics
          </h2>
          <table className="w-full my-3">
            <thead>
              <tr className="text-center">
                <th className="border-2 border-[#FA6023] w-1/2 py-1.5 border-collapse">
                  Name
                </th>
                <th className="border-2 border-[#FA6023] w-1/2 py-1.5 border-collapse">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.shells?.map((item) => {
                if (item.codes) {
                  return (
                    <>
                      <tr className="text-center">
                        <td className="border-2 border-[#FA6023] w-1/2 font-medium py-1.5 border-collapse">
                          {item.name}
                        </td>
                        <td className="border-2 border-[#FA6023] w-1/2 font-medium py-1.5 border-collapse">
                          {item.codes}
                        </td>
                      </tr>
                    </>
                  );
                }
              })}
              <tr className="text-center">
                <td className="border-2 border-[#FA6023] w-1/2 font-bold py-1.5 border-collapse">
                  Total
                </td>
                <td className="border-2 border-[#FA6023] w-1/2 font-bold py-1.5 border-collapse">
                  {data?.shells?.reduce((acc, item) => {
                    return acc + item.codes;
                  }, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
