import { useRef, useState } from "react";
import AddModal from "./AddModal";

const AddCodes = () => {
  const [selected, setSelected] = useState("unipin");
  const [inputs, setInputs] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [codesArray, setCodesArray] = useState([
    { uc: 20, codes: [] },
    { uc: 36, codes: [] },
    { uc: 80, codes: [] },
    { uc: 160, codes: [] },
    { uc: 161, codes: [] },
    { uc: 162, codes: [] },
    { uc: 405, codes: [] },
    { uc: 800, codes: [] },
    { uc: 810, codes: [] },
    { uc: 1626, codes: [] },
    { uc: 2000, codes: [] },
  ]);
  const textareaRef = useRef(null);

  // console.log(ucCodesArray);
  const handleCheck = () => {
    const separatedInputs = inputs
      .split("\n")
      .map((code) =>
        code
          .replace(/[^\w\s-]|_/g, "")
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter((message) => /^(BDMB|UPBD)/.test(message));

    const uniqueInputs = [...new Set(separatedInputs)];
    const newCodes = codesArray.map((item) => ({ uc: item.uc, codes: [] }));
    uniqueInputs.forEach((input) => {
      if (input.startsWith("BDMB-T-S") || input.startsWith("UPBD-Q-S")) {
        newCodes[0].codes.push(input);
      } else if (input.startsWith("BDMB-U-S") || input.startsWith("UPBD-R-S")) {
        newCodes[1].codes.push(input);
      } else if (input.startsWith("BDMB-J-S") || input.startsWith("UPBD-G-S")) {
        newCodes[2].codes.push(input);
      } else if (input.startsWith("BDMB-I-S") || input.startsWith("UPBD-F-S")) {
        newCodes[3].codes.push(input);
      } else if (input.startsWith("BDMB-Q-S") || input.startsWith("UPBD-N-S")) {
        newCodes[4].codes.push(input);
      } else if (input.startsWith("BDMB-R-S") || input.startsWith("UPBD-O-S")) {
        newCodes[5].codes.push(input);
      } else if (input.startsWith("BDMB-K-S") || input.startsWith("UPBD-H-S")) {
        newCodes[6].codes.push(input);
      } else if (input.startsWith("BDMB-S-S") || input.startsWith("UPBD-P-S")) {
        newCodes[7].codes.push(input);
      } else if (input.startsWith("BDMB-L-S") || input.startsWith("UPBD-I-S")) {
        newCodes[8].codes.push(input);
      } else if (input.startsWith("BDMB-M-S") || input.startsWith("UPBD-J-S")) {
        newCodes[9].codes.push(input);
      } else if (input.startsWith("UPBD-7-S")) {
        newCodes[10].codes.push(input);
      }
    });
    setCodesArray(newCodes);
    console.log(newCodes);
    setIsOpen(true);
  };
  const resetTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
  };
  return (
    <div className="-mt-5">
      <AddModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        codesArray={codesArray}
        selected={selected}
        resetTextarea={resetTextarea}
        setInputs={setInputs}
      />
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5">
        Add Codes
      </h1>
      <div className="space-y-3 py-3">
        <textarea
          onChange={(e) => setInputs(e.target.value)}
          ref={textareaRef}
          className="border-2 focus:outline-[#FA6023] w-full md:w-2/3 h-40 md:h-60 block mx-auto rounded-md px-3 py-2"
          placeholder={`BDMB-T-S-00000000 0000-0000-0000-0000
UPBD-Q-S-00000000 0000-0000-0000-0000`}
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
        <button
          onClick={handleCheck}
          className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded block mx-auto"
        >
          Check
        </button>
      </div>
    </div>
  );
};

export default AddCodes;
