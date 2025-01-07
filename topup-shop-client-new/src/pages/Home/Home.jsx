import { useState, useEffect, useRef } from "react";
import Banner from "./Banner/Banner";
import FollowUs from "./FollowUs/FollowUs";
import Notice from "./Notice/Notice";
import Services from "./Services/Services";
import AdModal from "./AdModal/AdModal";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const url = "advertise";
  const imageUrl =
    "https://thumbs.dreamstime.com/b/advertising-word-cloud-business-concept-56936998.jpg";

  useEffect(() => {
    setIsModalOpen(true);
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
    navigate(`/${url}`);
  };

  return (
    <div className="space-y-5">
      {isModalOpen && (
        <AdModal
          modalRef={modalRef}
          setIsModalOpen={setIsModalOpen}
          handleImageClick={handleImageClick}
          imageUrl={imageUrl}
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
