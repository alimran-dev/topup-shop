import PropTypes from 'prop-types';


const OptionCard = ({ idx, option, selected, setSelected }) => {

    const { name, price, stock } = option || {};

    const handleSelect = () => {
        if (!stock === null || !stock == 0) {
            setSelected({ idx, name, price });
        }
    };


    return (
        <div
            onClick={handleSelect}
            className={`text-xs md:text-sm flex items-center gap-3 px-1 py-2 md:px-3 rounded relative ${selected?.idx === idx
                ? "border-2 border-[#FA6023]"
                : "border-2 border-gray-400"
                } ${stock === 0 || stock === false ? "cursor-not-allowed" : "cursor-pointer"
                }`}
        >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 rounded bg-[#FA6023] text-white w-max text-xs md:text-sm">
                {stock === 0 && "Stock Out"}
            </span>

            <span
                className={`border-[5px] rounded-full p-0.5 ${selected?.idx === idx ? "border-[#FA6023]" : ""
                    }`}
            ></span>
            <span className="font-bold flex-1 text-gray-500">{name}</span>
            <span className="text-[#FA6023] font-bold">{price} TK</span>
        </div>
    );
};


OptionCard.propTypes = {
    idx: PropTypes.number,
    option: PropTypes.shape({
        name: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        stock: PropTypes.oneOfType([PropTypes.number, PropTypes.bool])
    }),
    selected: PropTypes.shape({
        idx: PropTypes.number,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
    setSelected: PropTypes.func
};

export default OptionCard;