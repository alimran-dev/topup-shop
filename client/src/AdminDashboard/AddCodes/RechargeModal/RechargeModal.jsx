import PropTypes from "prop-types";
import { IoCloseSharp } from "react-icons/io5";
import SelectCompanies from "./SelectCompanies";
import { useState } from "react";
import SelectCategory from "./SelectCategory";
import SelectOptions from "./SelectOptions";
import Confirmation from "./Confirmation";

const RechargeModal = ({
  isOpenCards,
  setIsOpenCards,
  cards,
  companies,
  resetTextarea,
  setInputs,
}) => {
  const [selectedCompany, setSelectedCompany] = useState({ _id: "" });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedOption, setSelectedOption] = useState({ _id: "" });
  const [next, setNext] = useState("companies");
  return (
    <div
      className={`fixed inset-0 z-30 w-screen h-screen items-center justify-center bg-black bg-opacity-40 py-5 ${
        isOpenCards ? "flex" : "hidden"
      }`}
    >
      <div className="bg-white border w-[380px] lg:w-[450px] max-h-[80vh] block px-5 pb-5 rounded-md overflow-auto relative">
        <IoCloseSharp
          onClick={() => setIsOpenCards(false)}
          className="absolute right-4 top-4 text-2xl font-semibold cursor-pointer"
        />
        {next === "companies" && (
          <SelectCompanies
            companies={companies}
            setSelectedCompany={setSelectedCompany}
            setNext={setNext}
          />
        )}
        {next === "category" && (
          <SelectCategory
            company={selectedCompany}
            setSelectedCategory={setSelectedCategory}
            setNext={setNext}
          />
        )}
        {next === "options" && (
          <SelectOptions
            selectedCompany={selectedCompany}
            selectedCategory={selectedCategory}
            setSelectedOption={setSelectedOption}
            setNext={setNext}
          />
        )}
        {next === "confirmation" && (
          <Confirmation
            selectedCompany={selectedCompany}
            selectedCategory={selectedCategory}
            selectedOption={selectedOption}
            cards={cards}
          />
        )}
      </div>
    </div>
  );
};

export default RechargeModal;

RechargeModal.propTypes = {
  isOpenCards: PropTypes.bool.isRequired,
  setIsOpenCards: PropTypes.func.isRequired,
  cards: PropTypes.array.isRequired,
  companies: PropTypes.array.isRequired,
  resetTextarea: PropTypes.func.isRequired,
  setInputs: PropTypes.func.isRequired,
};
