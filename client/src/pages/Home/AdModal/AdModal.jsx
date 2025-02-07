import { Link } from "react-router-dom";
/* eslint-disable react/prop-types */

const AdModal = ({ modalRef, setIsModalOpen, imageUrl, linkTo }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div ref={modalRef} className="w-[700px] bg-white p-5 rounded-lg relative">
        {imageUrl ? (
          <Link to={linkTo} target="_blank">
            <img
              src={imageUrl}
              alt="Modal Content"
              className="cursor-pointer rounded-lg"
            />
          </Link>
        ) : (
          <div className="skeleton w-full h-full bg-white"></div>
        )}
        <button
          className="absolute top-2 right-2 text-black bg-gray-200 rounded-full px-2 py-1"
          onClick={() => setIsModalOpen(false)}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AdModal;
