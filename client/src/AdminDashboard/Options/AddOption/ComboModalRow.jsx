import PropTypes from "prop-types";
import { FaMinus, FaPlus } from "react-icons/fa";

const ComboModalRow = ({ item, idx, combo, setCombo, selectedServer }) => {
  const handleQuantity = (increament, input) => {
    const prevCombo = [...combo];
    // console.log(prevCombo, increament);

    if (selectedServer === "unipinNormal") {
      // For SG server: only one item can be selected with max quantity 1
      if (increament > 0) {
        // Reset all other items to 0 and set this item to 1
        prevCombo.forEach((comboItem, index) => {
          if (index === idx) {
            comboItem.quantity = 1;
          } else {
            comboItem.quantity = 0;
          }
        });
      } else if (increament < 0) {
        // Decrease quantity (can only go to 0)
        prevCombo[idx].quantity = 0;
      } else if (input !== null) {
        // Direct input: max 1 for SG, and reset others to 0
        if (input > 0) {
          prevCombo.forEach((comboItem, index) => {
            if (index === idx) {
              comboItem.quantity = 1;
            } else {
              comboItem.quantity = 0;
            }
          });
        } else {
          prevCombo[idx].quantity = 0;
        }
      }
    } else if(selectedServer === "like"){
      if(idx === 0){
        prevCombo[1].day = 0;
      }else if(idx===1){
        prevCombo[0].day = 0;
      }
      if( increament){
        prevCombo[idx].day += increament;
      }
      if( input !== null){
        prevCombo[idx].day = input;
      }
    } else {
      // For other servers: normal behavior
      if (increament) {
        prevCombo[idx].quantity += increament;
      }
      if (input !== null) {
        prevCombo[idx].quantity = input;
      }
    }

    setCombo(prevCombo);
  };

  const handleMinus = () =>{
    selectedServer !== "like"?item?.quantity:item?.day > 0 && handleQuantity(-1, null);
    if(selectedServer === "like" && item?.day>0){
      handleQuantity(-1,null);
    }else if(selectedServer!=="like" && item?.quantity>0){
      handleQuantity(-1,null);
    }
  }
  return (
    <tr>
      <td className="border-2 border-primary text-center">{item?.name}</td>
      <td className="border-2 border-primary text-center">
        <div className="flex items-center">
          <span
            onClick={handleMinus}
            className="cursor-pointer h-full px-4 py-2"
          >
            <FaMinus className="text-base" />
          </span>
          <input
            className="w-10 text-center flex-1"
            value={selectedServer === "like" ? item?.day:item?.quantity}
            onChange={(e) =>
              handleQuantity(null, parseInt(e.target.value) || 0)
            }
          ></input>
          <span
            onClick={() => handleQuantity(1, null)}
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
  setCombo: PropTypes.func.isRequired,
  selectedServer: PropTypes.string.isRequired,
};
