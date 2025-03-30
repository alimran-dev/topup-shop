import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import useAxiosPublic from "../../../hooks/useAxiosPublic";

const AdModal = () => {
  const modalRef = useRef(null);
  const [ads, setAds] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const axiosPublic = useAxiosPublic();

  // Fetch ad data from the API
  useEffect(() => {
    const fetchAd = async () => {
      try {
        const { data } = await axiosPublic.get("/ads");
        if (data?.imageUrl) {
          setAds(data);
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };

    fetchAd();
  }, [axiosPublic]);

  // check the time of appearence
  useEffect(() => {
    const lastModalTime = localStorage.getItem("lastModalTime");
    const currentTime = new Date().getTime();

    // If 3 hours (10800000 ms) have passed or no time is set in localStorage
    if (!lastModalTime || currentTime - lastModalTime >= 3 * 60 * 60 * 1000) {
      setShowModal(true);
    }
  }, []);

  // Stop scroll when modal is open
  useEffect(() => {
    if (showModal && ads) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [ads, showModal]);

  // Handle modal close and save the time to localStorage
  const handleCloseModal = () => {
    setShowModal(false);
    localStorage.setItem("lastModalTime", new Date().getTime());
  };

  return (
    showModal &&
    ads && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div
          ref={modalRef}
          className="w-[700px] bg-white p-5 rounded-lg relative"
        >
          {ads.imageUrl ? (
            <Link
              to={ads.linkTo || "#"}
              target="_blank"
              className="flex justify-center"
            >
              <img
                src={ads.imageUrl}
                alt="Ad Modal"
                className="cursor-pointer rounded-lg"
                onClick={handleCloseModal}
              />
            </Link>
          ) : (
            <div className="skeleton w-full h-full bg-white"></div>
          )}
          <button
            className="absolute top-2 right-2 text-black bg-gray-200 rounded-full px-2 py-1"
            onClick={handleCloseModal}
          >
            ✕
          </button>
        </div>
      </div>
    )
  );
};

export default AdModal;
