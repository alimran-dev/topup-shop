import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import { useRef } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { BsCoin } from "react-icons/bs";
import { TbCurrencyTaka } from "react-icons/tb";
import { Link } from "react-router-dom";


const SpecialOffers = () => {

    const swiperRef = useRef(null);

    const offers = [
        { id: 1, name: "Offer 1", description: "Limited-time discount on coins!", price: 100, type: "coin", stock: 10 },
        { id: 2, name: "Offer 2", description: "Exclusive token deal!", price: 200, type: "tk", stock: 0 },
        { id: 3, name: "Offer 3", description: "Special bonus for premium users!", price: 150, type: "coin", stock: 10 },
    ];


    return (
        <div className="pt-5 pb-16 md:py-20 relative">
            <h2 className="title">Special Offers</h2>
            <Swiper
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                spaceBetween={20}
                slidesPerView={2}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
                // pagination={{ clickable: true }}
                modules={[Pagination, Navigation]}
                className="w-full"
            >
                {[...offers, ...offers, ...offers]?.map(offer => (
                    <SwiperSlide key={offer?.id}>
                        <div className="block">
                            <div className="bg-white rounded-md p-4 text-center border border-gray-300 h-full flex flex-col justify-center">
                                <h3 className="text-lg font-semibold mb-1">{offer?.name}</h3>
                                <p className="text-gray-500 mb-2 text-sm h-10 overflow-hidden">
                                    {
                                        offer?.description?.length > 32 ?
                                            `${offer?.description?.slice(0, 32)}...` : offer?.description
                                    }
                                </p>
                                <p className="text-lg font-bold text-blue-600 flex justify-center items-center">
                                    {
                                        offer?.type == "coin" ?
                                            <BsCoin className="mr-1" /> : <TbCurrencyTaka />
                                    }
                                    {offer?.price}
                                </p>
                                <p className={`text-sm font-semibold ${offer?.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {offer.stock > 0 ? "In Stock" : "Out of Stock"}
                                </p>
                                <Link to={`/special-offer-details/${offer?.id}`} className="button md:w-fit md:mx-auto mt-3">
                                    Get Offer
                                </Link>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-4">
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
    );
};

export default SpecialOffers;
