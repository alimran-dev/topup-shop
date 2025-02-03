import { TbCurrencyTaka } from "react-icons/tb";
import PropTypes from "prop-types";
import { useLocation, useNavigate } from "react-router-dom";

const Option = ({ option, selected, setSelected }) => {
    const { _id, name, price, description, inStock } = option || {};
    const navigate = useNavigate();
    const location = useLocation();
    
    const handleClick = () => {
        setSelected({ id: _id, price: price });
        navigate(`./${_id}`, {state: {docName: location.state?.docName}})
    }

  return (
    <div
      onClick={handleClick}
      className={`border-2 rounded-t cursor-pointer flex flex-col relative pt-2 mt-2 ${
        selected.id === _id
          ? "bg-gradient-to-b from-[#E61C55] to-[#FA6023] text-white"
          : ""
      }`}
    >
      {!inStock && (
        <p
          className={`absolute -top-0.5 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white px-2 py-0.5 rounded text-xs border whitespace-nowrap bg-[#E61C55]`}
        >
          Stock Out
        </p>
      )}
      <h3 className="text-center text-lg font-semibold px-1">{name}</h3>
      <p className="text-center text-sm flex-1 flex items-center justify-center px-2">
        {description}
      </p>
      <div
        className={`text-center border-t rounded ${
          selected.id === _id
            ? "bg-gradient-to-b from-[#FA6023] to-[#E61C55]"
            : ""
        }`}
      >
        <p className="inline-flex items-center font-medium">
          <TbCurrencyTaka /> {price}
        </p>
      </div>
    </div>
  );
};

export default Option;
Option.propTypes = {
  selected: PropTypes.object.isRequired,
  setSelected: PropTypes.func.isRequired,
  option: PropTypes.object.isRequired,
};
