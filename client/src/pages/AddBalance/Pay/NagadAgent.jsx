import { TbCurrencyTaka } from "react-icons/tb";
import logo from "../../../assets/topup-logo-crop.png";
import nagad from "../../../assets/images/nagad.png";
import PropTypes from "prop-types";

const NagadAgent = ({ id, amount, number, fee }) => {
  const handleVerify = (e) => {
    e.preventDefault();
  };
  return (
    <div className="max-w-lg border rounded-md p-4 shadow-md block mx-auto space-y-3">
      <img src={nagad} alt="" className="h-14 md:h-24 mx-auto" />
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-3">
        <div className="flex items-center gap-3 border p-3 md:p-5 rounded-md shadow">
          <div>
            <img
              src={logo}
              alt=""
              className="w-10 md:w-12 h-10 md:h-12 rounded-full border shadow"
            />
          </div>
          <div className="">
            <h2 className="font-semibold opacity-60">Mezba Shop</h2>
            <p className="font-semibold opacity-60 text-xs md:text-sm">
              ইনভয়েস আইডিঃ {id}
            </p>
          </div>
        </div>
        <div className="border p-4 rounded-md shadow flex flex-col items-center justify-center">
          <p className="flex items-center justify-center text-xl text-gray-600 font-semibold t">
            <TbCurrencyTaka className="text-lg font-bold" /> {amount}
          </p>
          {fee > 0 ? (
            <p className="text-center text-xs text-red-500">
              {fee.toFixed(2)}% ফি যুক্ত হয়েছে
            </p>
          ) : (
            <></>
          )}
        </div>
      </div>
      <form onSubmit={handleVerify} className="space-y-3">
        <div className="bg-[#C90008] text-white px-5 rounded-md">
          <h2 className="text-xl font-bold text-center py-2.5">
            ট্রানজেকশন আইডি দিন
          </h2>
          <input
            type="text"
            className="py-2 px-3 rounded w-[85%] mx-auto block text-black text-lg font-semibold focus:outline-1 focus:outline-gray-400 placeholder:text-sm"
            placeholder="ট্রানজেকশন আইডি দিন"
          />
          <div className="flex items-center gap-2 border-b border-gray-400 py-3 text-sm">
            <span className="w-1.5 h-1.5 p-0.5 bg-white rounded-full block"></span>
            <p>
              *167# ডায়াল করে আপনার NAGAD মোবাইল মেনুতে যান অথবা NAGAD অ্যাপে
              যান।
            </p>
          </div>
          <div className="flex items-center gap-2 border-b border-gray-400 py-3 text-sm">
            <span className="w-1.5 h-1.5 p-0.5 bg-white rounded-full block"></span>
            <p>
              <span className="text-[#fddd2b] font-semibold">
                &quot;Cash Out&quot;
              </span>{" "}
              -এ ক্লিক করুন।
            </p>
          </div>
          <div className="flex items-center gap-2 border-b border-gray-400 py-3 text-sm">
            <span className="w-1.5 h-1.5 p-0.5 bg-white rounded-full block"></span>
            <p>
              প্রাপক নম্বর হিসেবে এই নম্বরটি লিখুনঃ{" "}
              <span className="text-[#fddd2b] font-semibold">{number}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 border-b border-gray-400 py-3 text-sm">
            <span className="w-1.5 h-1.5 p-0.5 bg-white rounded-full block"></span>
            <p>
              টাকার পরিমাণঃ{" "}
              <span className="text-[#fddd2b] font-semibold">{amount}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 border-b border-gray-400 py-3 text-sm">
            <span className="w-1.5 h-1.5 p-0.5 bg-white rounded-full block"></span>
            <p>নিশ্চিত করতে এখন আপনার NAGAD মোবাইল মেনু পিন লিখুন।</p>
          </div>
          <div className="flex items-center gap-2 border-b border-gray-400 py-3 text-sm">
            <span className="w-1.5 h-1.5 p-0.5 bg-white rounded-full block"></span>
            <p>
              সবকিছু ঠিক থাকলে, আপনি NAGAD থেকে একটি নিশ্চিতকরণ বার্তা পাবেন।
            </p>
          </div>
          <div className="flex items-center gap-2 py-3 text-sm">
            <span className="w-1.5 h-1.5 p-0.5 bg-white rounded-full block"></span>
            <p>
              এখন উপরের বক্সে আপনার{" "}
              <span className="text-[#fddd2b] font-semibold">
                Transaction ID
              </span>{" "}
              দিন এবং নিচের{" "}
              <span className="text-[#fddd2b] font-semibold">VERIFY</span> বাটনে
              ক্লিক করুন।
            </p>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-[#C90008] py-2 text-lg font-semibold uppercase text-white rounded-lg hover:opacity-80"
        >
          Verify
        </button>
      </form>
    </div>
  );
};

export default NagadAgent;

NagadAgent.propTypes = {
  id: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  number: PropTypes.string.isRequired,
  fee: PropTypes.number.isRequired,
};
