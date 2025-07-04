import PropTypes from "prop-types";
import { FaMinus, FaPlus } from "react-icons/fa";

const ComboModalRow = ({ item , idx, combo, setCombo}) => {

  const handleQuantity=(increament, input)=>{
    const prevCombo= [...combo];
    if(increament){
      prevCombo[idx].quantity+=increament;
    }
    if(input!==null){
      prevCombo[idx].quantity = input;
    }
    setCombo(prevCombo);
  }
  return (
    <tr>
      <td className="border-2 border-primary text-center">{item?.name}</td>
      <td className="border-2 border-primary text-center">
        <div className="flex items-center">
          <span
            onClick={() => item?.quantity > 0 && handleQuantity(-1,null)}
            className="cursor-pointer h-full px-4 py-2"
          >
            <FaMinus className="text-base" />
          </span>
          <input
            className="w-10 text-center flex-1"
            value={item?.quantity}
            onChange={(e) => handleQuantity(null,parseInt(e.target.value) || 0)}
          ></input>
          <span
            onClick={() => handleQuantity(1,null)}
            className="cursor-pointer h-full px-4 py-2"
          >
            <FaPlus className="text-base" />
          </span>
        </div>
      </td>
    </tr>
  );
};

export default ComboModalRow;

ComboModalRow.propTypes = {
  item: PropTypes.object.isRequired,
  idx: PropTypes.number.isRequired,
  combo: PropTypes.array.isRequired,
  setCombo: PropTypes.func.isRequired
};
