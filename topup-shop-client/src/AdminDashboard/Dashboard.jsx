import { TbCurrencyTaka } from "react-icons/tb";

const Dashboard = () => {
  return (
    <div>
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
                100 <TbCurrencyTaka />
              </p>
            </div>
          </div>
          <div className="w-full h-full bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-center py-5 px-4 rounded-md flex items-center justify-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-semibold text-white">Total Spent</h3>
              <p className="flex items-center justify-center text-center text-2xl font-semibold text-white">
                100 <TbCurrencyTaka />
              </p>
            </div>
          </div>
          <div className="w-full h-full bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-center py-5 px-4 rounded-md flex items-center justify-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-semibold text-white">Available</h3>
              <p className="flex items-center justify-center text-center text-2xl font-semibold text-white">
                100 <TbCurrencyTaka />
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
                100
              </p>
            </div>
          </div>
          <div className="w-full h-full bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-center py-5 px-4 rounded-md flex items-center justify-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-semibold text-white">
                Pending Order
              </h3>
              <p className="flex items-center justify-center text-center text-2xl font-semibold text-white">
                100
              </p>
            </div>
          </div>
          <div className="w-full h-full bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-center py-5 px-4 rounded-md flex items-center justify-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-semibold text-white">
                Completed Order
              </h3>
              <p className="flex items-center justify-center text-center text-2xl font-semibold text-white">
                100
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
