import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import Option from "./Option";

const SelectOptions = ({
  selectedCompany,
  selectedCategory,
  setSelectedOption,
  setNext,
}) => {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState({ _id: "" });
  const axiosPublic = useAxiosPublic();
  useEffect(() => {
    axiosPublic(
      `/option/all?category=recharge&id=${selectedCompany._id}&docName=${selectedCategory}`
    ).then((res) => {
      setOptions(res.data);
    });
  }, [axiosPublic, selectedCategory, selectedCompany._id]);
    const handleContinue = () => {
        setSelectedOption(selected);
        setNext("confirmation");
  };
  return (
    <div>
      <h2 className="bg-gradient-to-r from-primary to-secondary w-fit text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent text-center py-3 mx-auto px-2 md:px-5 capitalize">
        {`${selectedCompany?.name} ${
          selectedCategory === "mbCard"
            ? "MB Card"
            : selectedCategory === "minCard"
            ? "Minute Card"
            : selectedCategory === "balanceCard"
            ? "Balance Card"
            : ""
        }`}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {options.map((option) => (
          <Option
            option={option}
            selected={selected}
            setSelected={setSelected}
            key={option._id}
          />
        ))}
      </div>
      <button
        onClick={handleContinue}
        className="bg-gradient-to-r from-primary to-secondary px-4 py-1 text-white font-semibold rounded-md block mx-auto mt-4"
      >
        Continue
      </button>
    </div>
  );
};

export default SelectOptions;

SelectOptions.propTypes = {
  selectedCompany: PropTypes.object.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  setSelectedOption: PropTypes.func.isRequired,
  setNext: PropTypes.func.isRequired,
};
