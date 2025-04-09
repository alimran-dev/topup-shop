import PropTypes from "prop-types";
import { TbCurrencyTaka } from "react-icons/tb";

const CategoryOption = ({ option, selected, setSelected, purchaseRef }) => {
  const { _id, category, name, price, stock } = option || {};
  const handleSelect = () => {
    if (stock === null || stock > 0 || stock === true) {
      setSelected({ _id, name, price });

      setTimeout(() => {
        purchaseRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 200); // Delay to ensure the selection is set before scrolling
    }
  };

  return (
    <div
      onClick={handleSelect}
      className={`flex items-center text-gray-600 gap-1 md:gap-3 py-1.5 px-1 md:py-2 md:px-3 capitalize text-[12px] md:text-sm rounded relative ${
        selected._id === _id ? "option-bg" : "border-2 border-gray-400"
      } ${
        stock === 0 || stock === false ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {subCategory === "unipin" ||
      subCategory === "shell" ||
      subCategory === "card" ? (
        <>
          {stock == 0 && (
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 text-[10px] md:text-sm rounded option-bg w-max">
              Stock Out
            </span>
          )}
        </>
      ) : (
        <></>
      )}
      {category === "idcode" ||
      category === "weekly" ||
      category === "airdrop" ||
      category === "lessIsMore" ? (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 text-xs md:text-sm rounded bg-[#FA6023] text-white w-max">
          {stock ? "" : "Stock Out"}
        </span>
      ) : (
        <></>
      )}

      <span className={`border-[5px] rounded-full p-0.5`}></span>
      <span className="font-bold flex-1">{name}</span>
      <span className="font-bold flex justify-end items-center">
        <TbCurrencyTaka className="text-xs translate-x-[2px] mt-[1px]" />
        {price}
      </span>
    </div>
  );
};

export default CategoryOption;
CategoryOption.propTypes = {
  option: PropTypes.object.isRequired,
  selected: PropTypes.object.isRequired,
  setSelected: PropTypes.func.isRequired,
  purchaseRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }).isRequired,
};
