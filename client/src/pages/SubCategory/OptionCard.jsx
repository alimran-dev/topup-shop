import PropTypes from 'prop-types';
import { TbCurrencyTaka } from 'react-icons/tb';


const OptionCard = ({ idx, option, selected, setSelected, purchaseRef }) => {

    const { name, price, stock, coin, willHaveQuantity, regularPrice, subscriberTier } = option || {};

    const handleSelect = () => {
        if (!stock === null || !stock == 0) {
            setSelected({ idx, name, price, coin, willHaveQuantity });

            setTimeout(() => {
                purchaseRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }, 200); // Delay to ensure the selection is set before scrolling
        }

    };


    return (
        <div
            onClick={handleSelect}
            className={`text-[12px] md:text-sm text-gray-600 flex items-center gap-1 md:gap-3 px-1 py-2 md:px-3 rounded relative ${selected?.idx === idx
                ? "option-bg"
                : "border-2 border-gray-400"
                } ${stock === 0 || stock === false ? "cursor-not-allowed" : "cursor-pointer"
                }`}
        >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 rounded option-bg w-max text-[10px] md:text-sm">
                {stock === 0 && "Stock Out"}
            </span>

            <span
                className={`border-[5px] rounded-full p-0.5 ${selected?.idx === idx ? "option-bg" : ""
                    }`}
            ></span>
            <span className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center md:gap-3">
                <span className="font-bold line-clamp-2 md:line-clamp-none md:flex-1 md:min-w-0">
                    {name}
                </span>
                {/* Mobile: prices + subscription tag move to their own line
                    under the name (still all inline together, so tagged and
                    untagged tiles stay the same height); desktop keeps the
                    single-row layout. */}
                <span className="flex items-center justify-end gap-1.5 md:shrink-0">
                    {subscriberTier && regularPrice != null && (
                        <span className="line-through text-[10px] font-normal opacity-60 flex items-center">
                            <TbCurrencyTaka className="text-[9px] mt-[1px]" />
                            {regularPrice}
                        </span>
                    )}
                    <span className="flex items-center">
                        <TbCurrencyTaka className="text-xs translate-x-[2px] mt-[1px]" />
                        {price}
                    </span>
                    {subscriberTier && regularPrice != null && (
                        <span className="text-[9px] font-semibold bg-white text-primary border border-primary/30 rounded-full px-1.5 py-[2px] shadow-sm whitespace-nowrap">
                            {subscriberTier}
                        </span>
                    )}
                </span>
            </span>
        </div>
    );
};


OptionCard.propTypes = {
    idx: PropTypes.number.isRequired,
    option: PropTypes.shape({
        name: PropTypes.string.isRequired,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        stock: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]).isRequired,
    }).isRequired,
    selected: PropTypes.shape({
        idx: PropTypes.number.isRequired,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
    }).isRequired,
    setSelected: PropTypes.func.isRequired,
    purchaseRef: PropTypes.shape({
        current: PropTypes.instanceOf(Element)
    }).isRequired, // Add purchaseRef validation
};

export default OptionCard;