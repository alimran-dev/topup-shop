import { Link } from "react-router-dom";
import Loader from "../../../components/Loader";

/* eslint-disable react/prop-types */
const AdModal = ({ modalRef, setIsModalOpen, imageUrl, linkTo }) => {
  return (
    <Link to={linkTo} target="_blank" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white p-4 rounded-lg relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Modal Content"
            className="cursor-pointer"
          />
        ) : (
          <Loader isLoading={!imageUrl} />
        )}
        <button
          className="absolute top-2 right-2 text-black bg-gray-200 rounded-full px-2 py-1"
          onClick={() => setIsModalOpen(false)}
        >
          ✕
        </button>
      </div>
    </Link>
  );
};

export default AdModal;
