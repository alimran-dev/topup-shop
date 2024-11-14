import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./Banner.css";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import banner1 from "../../../assets/images/banner1.png";
import banner2 from "../../../assets/images/banner2.jpg";
import banner3 from "../../../assets/images/banner3.jpg";
import banner4 from "../../../assets/images/recharge-card.jpeg";
import banner5 from "../../../assets/images/recharge-offer.jpeg";
import { Link } from "react-router-dom";

const Banner = () => {
  return (
    <Link to={"https://whatsapp.com/channel/0029VaYwdz43LdQch0TvMR1F"} target="_blank" className="block">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
      >
        <SwiperSlide>
          <img
            src={banner1}
            alt=""
            className="w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-md"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src={banner4}
            alt=""
            className="w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-md"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src={banner2}
            alt=""
            className="w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-md"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src={banner5}
            alt=""
            className="w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-md"
          />
        </SwiperSlide>
        <SwiperSlide>
          <img
            src={banner3}
            alt=""
            className="w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-md"
          />
        </SwiperSlide>
      </Swiper>
    </Link>
  );
};

export default Banner;
