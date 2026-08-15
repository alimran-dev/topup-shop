import PropTypes from "prop-types";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const DEFAULT_DELAY = 3000;

// Auto-scrolling image swiper shared by the listing cards and the item detail page.
// The autoplay delay is admin-configurable per item.
const ImageSwiper = ({
  images = [],
  delayMs = DEFAULT_DELAY,
  heightClass = "h-40",
}) => {
  const slides = Array.isArray(images) ? images.filter(Boolean) : [];

  if (slides.length === 0) {
    return (
      <div
        className={`w-full ${heightClass} bg-slate-100 flex items-center justify-center text-slate-400 text-xs`}
      >
        No image
      </div>
    );
  }

  // A single image needs no swiper machinery
  if (slides.length === 1) {
    return (
      <img
        src={slides[0]}
        alt=""
        className={`w-full ${heightClass} object-cover`}
      />
    );
  }

  return (
    <Swiper
      loop={true}
      autoplay={{
        delay: delayMs > 0 ? delayMs : DEFAULT_DELAY,
        disableOnInteraction: false,
      }}
      pagination={{ clickable: true }}
      modules={[Autoplay, Pagination]}
      className="item-swiper w-full"
    >
      {slides.map((image, idx) => (
        <SwiperSlide key={idx}>
          <img
            src={image}
            alt=""
            className={`w-full ${heightClass} object-cover`}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

ImageSwiper.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  delayMs: PropTypes.number,
  heightClass: PropTypes.string,
};

export default ImageSwiper;
