import { TbCurrencyTaka } from "react-icons/tb";
import PropTypes from "prop-types";
import toast from "react-hot-toast";


const OptionCard = ({ option, selected, setSelected, purchaseRef }) => {

  const { _id, name, price, description, stock: inStock, coin, subCategory, regularPrice, subscriberTier } = option || {};
  console.log(subCategory);
  const handleSelect = () => {
    if (inStock===null || inStock) {
      setSelected({ id: _id, name, price, coin });
      setTimeout(() => {
        purchaseRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
    else {
      toast.error("Stock Out");
    }

  };

  return (
    <div
      onClick={handleSelect}
      className={`border-2 rounded-t cursor-pointer flex flex-col relative pt-2 mt-2 ${selected.id === _id
        ? "bg-gradient-to-b from-secondary to-primary text-white"
        : ""
        }`}
    >
      {inStock!==null && !inStock && (
        <p
          className={`absolute -top-0.5 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white px-2 py-0.5 rounded text-xs border whitespace-nowrap bg-secondary`}
        >
          Stock Out
        </p>
      )}
      <h3 className="text-center text-lg font-semibold px-1">{name}</h3>
      <p className="text-center text-sm flex-1 flex items-center justify-center px-2">
        {description}
      </p>
      <div
        className={`text-center border-t rounded ${selected.id === _id
          ? "bg-gradient-to-b from-primary to-secondary"
          : ""
          }`}
      >
        <p className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 font-medium px-2 py-0.5">
          {subCategory==="offer" && <span className="text-xs opacity-80">অফার মূল্য</span>}
          {subscriberTier && regularPrice != null && (
            <>
              <span className="line-through text-xs opacity-60 inline-flex items-center">
                <TbCurrencyTaka className="text-[10px]" /> {regularPrice}
              </span>
              <span className="text-[9px] font-semibold bg-white text-primary border border-primary/30 rounded-full px-1.5 py-[2px] shadow-sm whitespace-nowrap">
                {subscriberTier}
              </span>
            </>
          )}
          <span className="inline-flex items-center font-bold">
            <TbCurrencyTaka /> {price}
          </span>
        </p>
      </div>
    </div>
  );
};

export default OptionCard;
OptionCard.propTypes = {
  selected: PropTypes.object.isRequired,
  setSelected: PropTypes.func.isRequired,
  option: PropTypes.object.isRequired,
  purchaseRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element)
  }).isRequired,
};