import { useState, useEffect, useRef } from "react";
import Banner from "./Banner/Banner";
import FollowUs from "./FollowUs/FollowUs";
import Notice from "./Notice/Notice";
import Services from "./Services/Services";
import AdModal from "./AdModal/AdModal";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import DailyCoinClaim from "./DailyCoinClaim/DailyCoinClaim";
import LastOrders from "./LastOrders/LastOrders";
import SpecialOffers from "./SpecialOffers/SpecialOffers";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);
  const [ads, setAds] = useState(null);
  const axiosPublic = useAxiosPublic();

  // get ads data and set modal with sessionStorage
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axiosPublic.get("/ads");
        if (data?.imageUrl && !sessionStorage.getItem('adModalShown')) {
          setAds(data);
          setIsModalOpen(true);
          sessionStorage.setItem('adModalShown', 'true'); // Set the flag
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };
    fetch();
  }, [axiosPublic]);

  // stop scroll when open modal
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isModalOpen]);

  // outside click to remove modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <div className="space-y-5">
      {isModalOpen && ads && (
        <AdModal
          modalRef={modalRef}
          setIsModalOpen={setIsModalOpen}
          imageUrl={ads?.imageUrl}
          linkTo={ads?.path}
        />
      )}

      <DailyCoinClaim />
      <Notice />
      <Banner />
      <SpecialOffers />
      <Services />
      <LastOrders />
      <FollowUs />
    </div>
  );
};

export default Home;
