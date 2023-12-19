import { useState } from "react";

const AddCodes = () => {
  const [selected, setSelected] = useState("unipin");
  return (
    <div className="-mt-5">
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5">
        Add Codes
      </h1>
      <div className="space-y-3 py-3">
        <textarea
          name=""
          id=""
          className="border-2 focus:outline-[#FA6023] w-full md:w-2/3 h-40 md:h-60 block mx-auto rounded-md px-3 py-2"
        ></textarea>
        <div className="flex items-center justify-center mx-auto">
          <button
            onClick={() => setSelected("unipin")}
            className={`flex items-center gap-1 px-3 py-1.5 font-semibold rounded-l-md border-[3px] ${
              selected == "unipin" ? "border-[#FA6023]" : "border-gray-400"
            }`}
          >
            <span
              className={`border-[5px] rounded-full ${
                selected == "unipin" ? "border-[#FA6023]" : ""
              }`}
            ></span>
            Unipin
          </button>
          <button
            onClick={() => setSelected("shell")}
            className={`flex items-center gap-1 px-3 py-1.5 font-semibold rounded-r-md border-[3px] ${
              selected == "shell" ? "border-[#FA6023] z-10" : "border-gray-400"
            }`}
          >
            <span
              className={`border-[5px] rounded-full ${
                selected == "shell" ? "border-[#FA6023]" : ""
              }`}
            ></span>
            Garena Shell
          </button>
        </div>
        <button className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded block mx-auto">
          Check
        </button>
      </div>
    </div>
  );
};

export default AddCodes;
