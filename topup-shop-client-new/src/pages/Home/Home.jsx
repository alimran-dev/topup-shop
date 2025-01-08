import { useState, useEffect, useRef } from "react";
import Banner from "./Banner/Banner";
import FollowUs from "./FollowUs/FollowUs";
import Notice from "./Notice/Notice";
import Services from "./Services/Services";
import AdModal from "./AdModal/AdModal";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const [ads, setAds] = useState(null); 
  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axiosPublic.get("/ads");
        if (data?.imageUrl) { 
          setAds(data);
          setIsModalOpen(true); 
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };
    fetch();
  }, [axiosPublic]);

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

  const handleImageClick = () => {
    navigate(`/${ads.path}`);
  };

  return (
    <div className="space-y-5">
      {isModalOpen && ads && (
        <AdModal
          modalRef={modalRef}
          setIsModalOpen={setIsModalOpen}
          handleImageClick={handleImageClick}
          imageUrl={ads?.imageUrl}
        />
      )}

      <Notice />
      <Banner />
      <Services />
      <FollowUs />
    </div>
  );
};

export default Home;
