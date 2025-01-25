import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "./Banner.css";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import toast from "react-hot-toast";
import Loader from "../../../components/Loader";

const Banner = () => {

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const axiosPublic = useAxiosPublic();

  // load all data
  useEffect(() => {
    setLoading(true);

    axiosPublic.get("/banners/get").then((res) => {
      setBanners(res.data || []);
      setLoading(false);
    }).catch(err => {
      console.log(err);
      setLoading(false);
      toast.error("Failed to load data!")
    });
  }, [axiosPublic]);


  return (
    <div>
      {
        loading ?
          <Loader />
          :
          <>
            {
              banners?.length > 0 &&
              <div>
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
                  {
                    banners?.map((banner, idx) =>
                      <SwiperSlide key={idx}>
                        <Link to={banner?.url} target="_blank">
                          <img
                            src={banner?.image}
                            alt=""
                            className="w-full h-[150px] md:h-[300px] lg:h-[400px] rounded-md"
                          />
                        </Link>
                      </SwiperSlide>
                    )
                  }
                </Swiper>
              </div>
            }
          </>
      }
    </div>
  );
};

export default Banner;
