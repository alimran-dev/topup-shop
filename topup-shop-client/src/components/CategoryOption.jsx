import PropTypes from "prop-types";

const CategoryOption = ({ option, selected, setSelected }) => {
  const { _id, category, name, price, stock } = option || {};
  const handleSelect = () => {
    if (stock === null || stock > 0 || stock === true) {
      setSelected({ _id, price });
    }
  };
  return (
    <div
      onClick={handleSelect}
      className={`flex items-center gap-3 py-2 px-3 rounded relative ${
        selected._id === _id
          ? "border-2 border-[#FA6023]"
          : "border-2 border-gray-400"
      } ${
        stock === 0 || stock === false ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {category === "unipin" || category === "shell" ? (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 text-sm rounded bg-[#FA6023] text-white w-max">
          {stock ? `In Stock: ${stock}` : stock === 0 ? "Stock Out" : ""}
        </span>
      ) : (
        <></>
      )}
      {category === "idcode" ||
      category === "weekly" ||
      category === "airdrop" ||
      category === "lessIsMore" ? (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 text-sm rounded bg-[#FA6023] text-white w-max">
          {stock ? "" : "Stock Out"}
        </span>
      ) : (
        <></>
      )}

      <span
        className={`border-[5px] rounded-full p-0.5 ${
          selected._id === _id ? "border-[#FA6023]" : ""
        }`}
      ></span>
      <span className="font-bold flex-1 text-gray-500">{name}</span>
      <span className="text-[#FA6023] font-bold">{price} TK</span>
    </div>
  );
};

export default CategoryOption;
CategoryOption.propTypes = {
  option: PropTypes.object.isRequired,
  selected: PropTypes.object.isRequired,
  setSelected: PropTypes.func.isRequired,
};
