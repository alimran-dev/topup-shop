import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { TbCurrencyTaka } from "react-icons/tb";
import { Link } from "react-router-dom";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import Coin from "../../../components/reusuable/Coin/Coin";


const SpecialOffers = () => {

    const [offers, setoffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const swiperRef = useRef(null);
    const axiosPublic = useAxiosPublic();

    // load offers
    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            const res = await axiosPublic.get("/special/all");
            setoffers(res?.data || []);
            setLoading(false);
        };
        fetchData();
    }, [axiosPublic]);

    if (loading) {
        return <div className="py-10 text-center">Loading...</div>
    }

    return (
        <>
            {
                offers?.length == 0 ?
                    <></>
                    :
                    <div className={`${offers?.length >= 3 ? "pb-16 md:pb-20" : "md:pb-3"} md:pt-5 relative`}>
                        <h2 className="title">Special Offers</h2>
                        <Swiper
                            onSwiper={(swiper) => (swiperRef.current = swiper)}
                            spaceBetween={20}
                            slidesPerView={2}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                768: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                                1280: { slidesPerView: 4 },
                            }}
                            loop
                            autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                            }}
                            // pagination={{ clickable: true }}
                            modules={[Pagination, Navigation, Autoplay]}
                            className="w-full"
                        >
                            {offers?.map(offer => (
                                <SwiperSlide key={offer?._id}>
                                    <div className="block">
                                        <div className="bg-white rounded-md p-4 text-center border border-gray-300 h-full flex flex-col justify-center relative">
                                            <p className={`absolute top-2 right-2 text-white text-[10px] md:text-xs font-semibold badge ${offer?.stock > 0 ? 'badge-success' : 'badge-error'}`}>
                                                {offer?.stock > 0 ? "In Stock" : "Stock Out"}
                                            </p>
                                            <img src={offer?.image} className="w-full h-20 md:h-36 object-fill" alt={offer?.title || "Offer image"} />
                                            <h3 className="text-xs md:text-lg font-semibold mb-1 pt-3">{offer?.title}</h3>
                                            <p className="text-lg font-bold text-primary flex justify-center items-center">
                                                {
                                                    offer?.type == "coin" ?
                                                        <Coin /> : <TbCurrencyTaka />
                                                }
                                                {offer?.price}
                                            </p>
                                            <Link to={`/special-offer-details/${offer?._id}`} className="button md:w-fit md:mx-auto !text-xs md:!text-base mt-3">
                                                Get Offer
                                            </Link>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        <div className={`${offers?.length < 3 && "hidden"} absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-4`}>
                            <button
                                onClick={() => swiperRef.current?.slidePrev()}
                                className="p-2 bg-primary text-white rounded-full hover:bg-gray-900 transition"
                            >
                                <IoIosArrowBack size={24} />
                            </button>
                            <button
                                onClick={() => swiperRef.current?.slideNext()}
                                className="p-2 bg-primary text-white rounded-full hover:bg-gray-900 transition"
                            >
                                <IoIosArrowForward size={24} />
                            </button>
                        </div>
                    </div>
            }
        </>
    );
};

export default SpecialOffers;
