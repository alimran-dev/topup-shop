/* eslint-disable react/prop-types */
const AdModal = ({modalRef, handleImageClick, setIsModalOpen, imageUrl}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white p-4 rounded-lg relative">
        <img
          src={imageUrl}
          alt="Modal Content"
          className="cursor-pointer"
          onClick={handleImageClick}
        />
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
