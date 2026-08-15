import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { TbCurrencyTaka } from "react-icons/tb";
import ImageSwiper from "../../components/reusuable/ImageSwiper/ImageSwiper";

const ItemCard = ({ item, statLabels, isSold }) => {
  const navigate = useNavigate();
  const hasDiscount =
    item?.offerPrice != null &&
    item?.originalPrice != null &&
    item.offerPrice < item.originalPrice;

  return (
    <div className="border-2 border-slate-200 border-b-4 border-b-[#FA6023] rounded-xl overflow-hidden flex flex-col h-full">
      {/* images — `isolate` keeps the overlay's z-index inside this card so it
          can never stack above the sticky navbar / bottom nav (both z-20) */}
      <div className="relative isolate">
        <ImageSwiper
          images={item?.images}
          delayMs={item?.swiperDelay}
          maxHeightClass="max-h-80 md:max-h-56"
        />

        {/* diagonal "Sold" stamp, bottom-left to top-right */}
        {isSold && (
          <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
            {/* darken + desaturate the artwork so the stamp pops */}
            <span className="absolute inset-0 bg-black/50 backdrop-grayscale"></span>
            {/* coloured glow behind the ribbon */}
            <span className="sold-glow absolute inset-0"></span>

            {/* the ribbon itself */}
            <div className="absolute top-1/2 left-1/2 w-[200%] -translate-x-1/2 -translate-y-1/2 -rotate-[35deg] sold-ribbon border-y-[3px] border-white/80 py-1.5 md:py-2 text-center">
              <span className="sold-ribbon-text block text-2xl md:text-3xl font-black uppercase tracking-[0.45em] pl-[0.45em] leading-none">
                Sold
              </span>
            </div>
          </div>
        )}

        {/* unique item number, bottom-right of the image */}
        {item?.itemNumber && (
          <span className="absolute bottom-1.5 right-1.5 z-30 bg-black/70 text-white text-[11px] md:text-xs font-bold px-2 py-0.5 rounded-md tracking-wide">
            #{item.itemNumber}
          </span>
        )}
      </div>

      {/* title sits flush under the image */}
      <div className="px-2 pt-0 pb-2 md:px-3 md:pb-3 flex flex-col flex-1 gap-2">
        {/* title */}
        <h3 className="text-base font-bold leading-tight line-clamp-2">
          {item?.title}
        </h3>

        {/* 4 stats in one line */}
        <div className="grid grid-cols-4 gap-1 border-y py-1.5">
          {statLabels?.map((label, idx) => (
            <div key={idx} className="text-center">
              <p className="text-[11px] text-gray-500 leading-tight truncate">
                {label}
              </p>
              <p className="text-sm font-bold leading-tight">
                {item?.stats?.[idx] ?? 0}
              </p>
            </div>
          ))}
        </div>

        {/* short description */}
        {item?.shortDescription && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {item.shortDescription}
          </p>
        )}

        {/* prices */}
        <div className="flex items-center gap-2 flex-wrap mt-auto">
          {hasDiscount && (
            <span className="flex items-center text-xs md:text-sm text-gray-400 line-through">
              <TbCurrencyTaka />
              {item?.originalPrice}
            </span>
          )}
          <span className="flex items-center text-base md:text-lg font-bold text-[#E61C55]">
            <TbCurrencyTaka />
            {item?.offerPrice ?? item?.originalPrice}
          </span>
        </div>

        {/* details button */}
        <button
          onClick={() => navigate(`/item/${item?._id}`)}
          className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-full py-1.5 rounded-md text-sm font-semibold text-white"
        >
          Details
        </button>
      </div>
    </div>
  );
};

ItemCard.propTypes = {
  item: PropTypes.object.isRequired,
  statLabels: PropTypes.arrayOf(PropTypes.string),
  isSold: PropTypes.bool,
};

export default ItemCard;
