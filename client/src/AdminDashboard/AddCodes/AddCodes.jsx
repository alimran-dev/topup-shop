import { useRef, useState } from "react";
import AddModal from "./UnipinModal/AddModal";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import ShellModal from "./ShellModal";
import Loader from "../../components/Loader";
import RechargeModal from "./RechargeModal/RechargeModal";
import UnipinConfirmation from "./UnipinModal/UnipinConfirmation";

const AddCodes = () => {
  const [selected, setSelected] = useState("unipin");
  const [inputs, setInputs] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenShell, setIsOpenShell] = useState(false);
  const [isOpenCards, setIsOpenCards] = useState(false);
  const [shellOptions, setShellOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadToAuto, setIsUploadToAuto] = useState(true);
  const [isOpenUnipinConfirmation, setIsOpenUnipinConfirmation] =
    useState(false);
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
    { uc: 1625, codes: [] },
    { uc: 2000, codes: [] },
  ]);
  const [shellCodes, setShellCodes] = useState([]);
  const [cards, setCards] = useState([]);
  const [companies, setCompanies] = useState([]);
  const textareaRef = useRef(null);
  const axiosPublic = useAxiosPublic();

  // console.log(ucCodesArray);
  const handleUnipin = () => {
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
    // console.log(newCodes);
    setIsOpen(true);
  };
  const resetTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.value = "";
    }
  };
  const handleShell = () => {
    const separatedInputs = inputs
      .split("\n")
      .map((line) => line.trim().replace(/^[^\w\d-]+|[^\w\d-]+$/g, ""));
    const filterInputs = separatedInputs.filter((input) => input !== "");
    const uniqueInputs = [...new Set(filterInputs)];
    console.log(uniqueInputs);
    setShellCodes(uniqueInputs);
    setIsLoading(true);
    axiosPublic.get(`/option/all?category=shell`).then((res) => {
      setShellOptions(res.data);
      setIsLoading(false);
      setIsOpenShell(true);
    });
  };
  const handleCards = () => {
    const separatedInputs = inputs
      .split("\n")
      .map((line) => line.trim().replace(/^[^\w\d-]+|[^\w\d-]+$/g, ""));
    const filterInputs = separatedInputs.filter((input) => input !== "");
    const uniqueInputs = [...new Set(filterInputs)];
    setCards(uniqueInputs);
    setIsLoading(true);
    axiosPublic.get("/recharge/companies").then((res) => {
      setCompanies(res.data);
      setIsLoading(false);
      setIsOpenCards(true);
    });
  };
  const handleCheck = () => {
    if (selected === "unipin") {
      handleUnipin();
    } else if (selected === "shell") {
      handleShell();
    } else if (selected === "cards") {
      handleCards();
    }
  };
  return (
    <div className="-mt-5">
      <Loader isLoading={isLoading} />
      <AddModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        codesArray={codesArray}
        selected={selected}
        isUploadToAuto={isUploadToAuto}
        setIsUploadToAuto={setIsUploadToAuto}
        setIsOpenUnipinConfirmation={setIsOpenUnipinConfirmation}
      />
      <UnipinConfirmation
        codesArray={codesArray}
        isOpenUnipinConfirmation={isOpenUnipinConfirmation}
        resetTextarea={resetTextarea}
        setInputs={setInputs}
        setIsOpenUnipinConfirmation={setIsOpenUnipinConfirmation}
        isUploadToAuto={isUploadToAuto}
      />
      <ShellModal
        isOpenShell={isOpenShell}
        setIsOpenShell={setIsOpenShell}
        resetTextarea={resetTextarea}
        setInputs={setInputs}
        shellOptions={shellOptions}
        shellCodes={shellCodes}
      />
      <RechargeModal
        isOpenCards={isOpenCards}
        setIsOpenCards={setIsOpenCards}
        cards={cards}
        companies={companies}
        resetTextarea={resetTextarea}
        setInputs={setInputs}
      />
      <h1 className="bg-gradient-to-r from-primary to-secondary w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5">
        Add Codes
      </h1>
      <div className="space-y-3 py-3">
        <textarea
          onChange={(e) => setInputs(e.target.value)}
          ref={textareaRef}
          className="border-2 focus:outline-primary w-full md:w-2/3 h-40 md:h-60 block mx-auto rounded-md px-3 py-2"
          placeholder={`BDMB-T-S-00000000 0000-0000-0000-0000
UPBD-Q-S-00000000 0000-0000-0000-0000`}
        ></textarea>
        <div className="flex items-center justify-center mx-auto flex-wrap">
          <button
            onClick={() => setSelected("unipin")}
            className={`flex items-center gap-1 px-3 py-1.5 font-semibold rounded-l-md border-[3px] ${
              selected == "unipin" ? "border-primary" : "border-gray-400"
            }`}
          >
            <span
              className={`border-[5px] rounded-full ${
                selected == "unipin" ? "border-primary" : ""
              }`}
            ></span>
            Unipin
          </button>
          <button
            onClick={() => setSelected("shell")}
            className={`flex items-center gap-1 px-3 py-1.5 font-semibold border-[3px] ${
              selected == "shell" ? "border-primary z-10" : "border-gray-400"
            }`}
          >
            <span
              className={`border-[5px] rounded-full ${
                selected == "shell" ? "border-primary" : ""
              }`}
            ></span>
            Garena Shell
          </button>
          <button
            onClick={() => setSelected("cards")}
            className={`flex items-center gap-1 px-3 py-1.5 font-semibold rounded-r-md border-[3px] ${
              selected == "cards" ? "border-primary z-10" : "border-gray-400"
            }`}
          >
            <span
              className={`border-[5px] rounded-full ${
                selected == "cards" ? "border-primary" : ""
              }`}
            ></span>
            Cards
          </button>
        </div>
        <button
          onClick={handleCheck}
          className="bg-gradient-to-r from-primary to-secondary py-1.5 px-5 text-lg text-white font-semibold rounded block mx-auto"
        >
          Check
        </button>
      </div>
    </div>
  );
};

export default AddCodes;
