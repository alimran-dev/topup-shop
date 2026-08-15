import PropTypes from "prop-types";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const DEFAULT_DELAY = 3000;

// Auto-scrolling image swiper shared by the listing cards and the item detail page.
// The autoplay delay is admin-configurable per item.
//
// Images are never cropped: width fills the container and height follows from
// the image's own aspect ratio. `maxHeightClass` only caps very tall (portrait)
// uploads so one image cannot blow out the layout — `object-contain` keeps the
// ratio intact when that cap is reached.
const ImageSwiper = ({
  images = [],
  delayMs = DEFAULT_DELAY,
  maxHeightClass = "max-h-72",
}) => {
  const slides = Array.isArray(images) ? images.filter(Boolean) : [];
  const imgClass = `w-full h-auto ${maxHeightClass} object-contain mx-auto block`;

  if (slides.length === 0) {
    return (
      <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
        No image
      </div>
    );
  }

  // A single image needs no swiper machinery
  if (slides.length === 1) {
    return (
      <div className="w-full bg-slate-50">
        <img src={slides[0]} alt="" className={imgClass} />
      </div>
    );
  }

  return (
    <Swiper
      loop={true}
      // lets the swiper track each slide's natural height instead of forcing
      // every image into one fixed box
      autoHeight={true}
      autoplay={{
        delay: delayMs > 0 ? delayMs : DEFAULT_DELAY,
        disableOnInteraction: false,
      }}
      pagination={{ clickable: true }}
      modules={[Autoplay, Pagination]}
      className="item-swiper w-full bg-slate-50"
    >
      {slides.map((image, idx) => (
        <SwiperSlide key={idx}>
          <img src={image} alt="" className={imgClass} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

ImageSwiper.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  delayMs: PropTypes.number,
  maxHeightClass: PropTypes.string,
};

export default ImageSwiper;
