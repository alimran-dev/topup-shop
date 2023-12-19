import { useState } from "react";
import unipin from "../../assets/images/unipin.jpg";
import {
  TbSquareRoundedNumber1Filled,
  TbSquareRoundedNumber2Filled,
} from "react-icons/tb";
import { FaMinus, FaPlus } from "react-icons/fa";

const Unipin = () => {
  const [selected, setSelected] = useState(true);
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 border-2 py-4 px-6 rounded">
        <img
          src={unipin}
          alt=""
          className="w-24 h-20 md:w-28 md:h-24 rounded-[30px]"
        />
        <div>
          <p className="text-xl md:text-2xl font-semibold">
            Unipin Voucher (BDT)
          </p>
          <p className="md:text-lg font-medium text-gray-500">Game / Top-Up</p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        <div className="md:col-span-2 border-2 rounded">
          <h1 className="text-xl font-semibold py-2 px-5 border-b-2 flex items-center gap-2">
            <TbSquareRoundedNumber1Filled className="text-red-500" /> Select
            Category
          </h1>
          <div className="col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-4 px-3 md:px-5 py-5">
            <div
              className={`flex items-center gap-3 py-2 px-3 rounded ${
                selected
                  ? "border-2 border-[#FA6023]"
                  : "border-2 border-gray-400"
              }`}
            >
              <span
                className={`border-[5px] rounded-full p-0.5 ${
                  selected ? "border-[#FA6023]" : ""
                }`}
              ></span>
              <span className="font-bold flex-1 text-gray-500">20 UC</span>
              <span className="text-[#FA6023] font-bold">17 TK</span>
            </div>
            <div className="flex items-center gap-3 border border-gray-400 py-2 px-5 rounded">
              <span className="font-bold flex-1 text-gray-500">20 UC</span>
              <span className="text-[#FA6023] font-bold">17 TK</span>
            </div>
            <div className="flex items-center gap-3 border border-gray-400 py-2 px-5 rounded">
              <span className="font-bold flex-1 text-gray-500">20 UC</span>
              <span className="text-[#FA6023] font-bold">17 TK</span>
            </div>
            <div className="flex items-center gap-3 border border-gray-400 py-2 px-5 rounded">
              <span className="font-bold flex-1 text-gray-500">20 UC</span>
              <span className="text-[#FA6023] font-bold">17 TK</span>
            </div>
            <div className="flex items-center gap-3 border border-gray-400 py-2 px-5 rounded">
              <span className="font-bold flex-1 text-gray-500">20 UC</span>
              <span className="text-[#FA6023] font-bold">17 TK</span>
            </div>
            <div className="flex items-center gap-3 border border-gray-400 py-2 px-5 rounded">
              <span className="font-bold flex-1 text-gray-500">20 UC</span>
              <span className="text-[#FA6023] font-bold">17 TK</span>
            </div>
            <div className="flex items-center gap-3 border border-gray-400 py-2 px-5 rounded">
              <span className="font-bold flex-1 text-gray-500">20 UC</span>
              <span className="text-[#FA6023] font-bold">17 TK</span>
            </div>
            <div className="flex items-center gap-3 border border-gray-400 py-2 px-5 rounded">
              <span className="font-bold flex-1 text-gray-500">20 UC</span>
              <span className="text-[#FA6023] font-bold">17 TK</span>
            </div>
          </div>
        </div>
        <div>
          <div className="text-xl font-semibold py-2 px-5 border-2 rounded flex md:flex-col lg:flex-row items-center gap-2 w-full">
            <h2 className="flex-1 flex items-center gap-2">
              <TbSquareRoundedNumber2Filled className="text-red-500" /> Quantity
            </h2>
            <div className="flex items-center gap-2 border-[3px] rounded-full">
              <span
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="cursor-pointer w-full h-full py-3 pl-3"
              >
                <FaMinus className="text-base" />
              </span>
              <input
                className="w-10 text-center"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              ></input>
              <span
                onClick={() => setQuantity(quantity + 1)}
                className="cursor-pointer w-full h-full py-3 pr-3"
              >
                <FaPlus className="text-base" />
              </span>
            </div>
          </div>
          <div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unipin;
