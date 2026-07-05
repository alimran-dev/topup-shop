import Swal from "sweetalert2";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import PaymentsCard from "./PaymentsCard";
import toast from "react-hot-toast";

const Payments = () => {
  const [methods, setMethods] = useState([]);
  const [provider, setProvider] = useState("bkash");
  const [balanceData, setBalanceData] = useState({ bkashPersonal: 0, bkashAgent: 0, bkashMerchant: 0, nagadPersonal: 0, nagadAgent: 0 });
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    axiosPrivate.get("/payment/methods").then((res) => {
      setMethods(res.data);
    });
  }, [axiosPrivate]);


  // add manual payment method
  const handleAddManualMethod = (e) => {
    e.preventDefault();
    const form = e.target;
    const provider = form.provider.value;
    const category = form.category.value;
    const bonus = parseFloat(form.bonus.value);
    const specialBonus = parseFloat(form.specialBonus.value);
    const fee = parseFloat(form.fee.value);
    const number = form.number.value;
    const status = form.status.value;
    const balanceVerify = form.balanceVerify.value;
    const minLimit = parseInt(form.minLimit.value);
    const maxLimit = parseInt(form.maxLimit.value);
    const isDirect = form.isDirect.checked;
    const method = { provider, category, bonus, specialBonus, fee, number, status, balanceVerify, minLimit, maxLimit, isDirect };
    axiosPrivate.post("/payment/method/admin/add", method).then((res) => {
      if (res.data.insertedId) {
        toast.success("Payment method added");
        form.reset();
      }
    });
  };

  // page apear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    const form = e.target;
    const bkashPersonal= parseFloat(form.bkashPersonal.value);
    const bkashAgent = parseFloat(form.bkashAgent.value);
    const bkashMerchant = parseFloat(form.bkashMerchant.value);
    const nagadPersonal = parseFloat(form.nagadPersonal.value);
    const nagadAgent = parseFloat(form.nagadAgent.value);

    if (isNaN(bkashPersonal) || isNaN(bkashAgent) || isNaN(bkashMerchant) || isNaN(nagadPersonal) || isNaN(nagadAgent)) {
      toast.error("Please enter valid numbers for balances.");
      return;
    }
    const {data} = await axiosPrivate.patch(`/payment/method/admin/balance/adjust`, {bkashPersonal, bkashAgent, bkashMerchant, nagadPersonal, nagadAgent});
    if(data?.modifiedCount){
      toast.success("Balances updated successfully.");
    }
  };

   useEffect(() => {
    axiosPrivate.get("/payment/method/admin/balance/summary").then((res) => {
      setBalanceData({
        bkashPersonal: res.data[0]?.bkashPersonalBalance || 0,
        bkashAgent: res.data[0]?.bkashAgentBalance || 0,
        bkashMerchant: res.data[0]?.bkashMerchantBalance || 0,
        nagadPersonal: res.data[0]?.nagadPersonalBalance || 0,
        nagadAgent: res.data[0]?.nagadAgentBalance || 0,
      });
    });
  }, [axiosPrivate]);

  return (
    <div>
      <h2 className="title">
        Payment Management
      </h2>
      <div className="flex-1 border-2 border-[#FA6023] p-3 rounded-md flex flex-col items-center">
          <form className="space-y-2 grid md:grid-cols-2 gap-5 items-center justify-center md:justify-between" onSubmit={handleUpdateBalance}>
            <div>
              <label htmlFor="input-label">Bkash Personal Balance: </label>
              <input
                value={balanceData?.bkashPersonal || 0}
                onChange={(e) =>
                  setBalanceData({ ...balanceData, bkashPersonal: e.target.value })
                }
                type="number"
                name="bkashPersonal"
                step={0.01}
                placeholder="100.01"
                className="border-2 px-3 py-1 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="input-label">Bkash Agent Balance: </label>
              <input
                value={balanceData?.bkashAgent || 0}
                onChange={(e) =>
                  setBalanceData({ ...balanceData, bkashAgent: e.target.value })
                }
                type="number"
                name="bkashAgent"
                step={0.01}
                placeholder="100.01"
                className="border-2 px-3 py-1 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="input-label">Bkash Merchant Balance: </label>
              <input
                value={balanceData?.bkashMerchant || 0}
                onChange={(e) =>
                  setBalanceData({ ...balanceData, bkashMerchant: e.target.value })
                }
                type="number"
                name="bkashMerchant"
                step={0.01}
                placeholder="100.01"
                className="border-2 px-3 py-1 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="input-label">Nagad Personal Balance: </label>
              <input
                value={balanceData?.nagadPersonal || 0}
                onChange={(e) =>
                  setBalanceData({ ...balanceData, nagadPersonal: e.target.value })
                }
                type="number"
                name="nagadPersonal"
                step={0.01}
                placeholder="100.01"
                className="border-2 px-3 py-1 rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="input-label">Nagad Agent Balance: </label>
              <input
                value={balanceData?.nagadAgent || 0}
                onChange={(e) =>
                  setBalanceData({ ...balanceData, nagadAgent: e.target.value })
                }
                type="number"
                name="nagadAgent"
                step={0.01}
                placeholder="100.01"
                className="border-2 px-3 py-1 rounded-md"
                required
              />
            </div>
            <button type="submit" className="button block mx-auto">
              Update
            </button>
          </form>
        </div>
      <div className="border rounded-md">
        <h2 className="title !text-sm md:!text-3xl">
          Add Payment method (Manual)
        </h2>
        <form onSubmit={handleAddManualMethod} className="px-3 py-5">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 space-y-2">
              <div>
                <label htmlFor="provider" className="font-semibold mr-2">
                  Provider:{" "}
                </label>
                <select onChange={(e)=>setProvider(e.target.value)} name="provider" id="" className="px-3 py-1 rounded">
                  <option value="bkash">Bkash</option>
                  <option value="nagad">Nagad</option>
                </select>
              </div>
              <div>
                <label htmlFor="type" className="font-semibold mr-2">
                  Type:{" "}
                </label>
                <select name="category" id="" className="px-3 py-1 rounded">
                  <option value="personal">Personal</option>
                  <option value="agent">Agent</option>
                  {provider==="bkash" && <option value="merchant">Merchant</option>}
                </select>
              </div>
              <div>
                <label htmlFor="bonus" className="font-semibold mr-2">
                  Bonus:{" "}
                </label>
                <input
                  name="bonus"
                  type="number"
                  step={0.01}
                  className="border px-3 py-1 rounded w-full md:w-fit"
                  placeholder="percent"
                  required
                />
              </div>
              <div>
                <label htmlFor="bonus" className="font-semibold mr-2">
                  Special Bonus:{" "}
                </label>
                <input
                  name="specialBonus"
                  type="number"
                  step={0.5}
                  className="border px-3 py-1 rounded w-full md:w-fit"
                  placeholder="percent"
                  required
                />
              </div>
              <div>
                <label htmlFor="minLimit" className="font-semibold mr-2">
                  Min Limit:{" "}
                </label>
                <input
                  name="minLimit"
                  type="number"
                  step={1}
                  className="border px-3 py-1 rounded w-full md:w-fit"
                  placeholder="100"
                  required
                />
              </div>
              <div className="flex items-center">
                <label htmlFor="isDirect" className="font-semibold mr-2">
                  Direct Pay:{" "}
                </label>
                <input
                  name="isDirect"
                  type="checkbox"
                  className="toggle"
                />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <label htmlFor="fee" className="font-semibold mr-2">
                  Fee:{" "}
                </label>
                <input
                  name="fee"
                  type="number"
                  step={0.01}
                  className="border px-3 py-1 rounded w-full md:w-fit"
                  placeholder="percent"
                  required
                />
              </div>
              <div>
                <label htmlFor="number" className="font-semibold mr-2">
                  Number:{" "}
                </label>
                <input
                  name="number"
                  type="text"
                  className="border px-3 py-1 rounded w-full md:w-fit"
                  placeholder="Phone Number"
                  required
                />
              </div>
              <div>
                <label htmlFor="status" className="font-semibold mr-2">
                  Status:{" "}
                </label>
                <select name="status" id="" className="px-3 py-1 rounded">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label htmlFor="balanceVerify" className="font-semibold mr-2">
                  Balance Verify:{" "}
                </label>
                <select name="balanceVerify" id="" className="px-3 py-1 rounded">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
               <div>
                <label htmlFor="maxLimit" className="font-semibold mr-2">
                  Max Limit:{" "}
                </label>
                <input
                  name="maxLimit"
                  type="number"
                  step={1}
                  className="border px-3 py-1 rounded w-full md:w-fit"
                  placeholder="1000"
                  required
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="block mx-auto bg-gradient-to-r from-[#FA6023] to-[#E61C55] px-5 py-1 mt-1.5 text-lg font-semibold text-white rounded"
          >
            Add
          </button>
        </form>
      </div>
      <h2 className="title !text-sm md:!text-3xl">
        Update Payment Method
      </h2>
      <div className="space-y-2">
        {methods.map((method) => (
          <PaymentsCard
            method={method}
            methods={methods}
            setMethods={setMethods}
            key={method._id}
          />
        ))}
      </div>
    </div>
  );
};

export default Payments;
