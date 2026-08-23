import PropTypes from "prop-types";
import { IoCloseSharp } from "react-icons/io5";
import ModalRow from "../ModalRow";

const AddModal = ({
  isOpen,
  setIsOpen,
  codesArray,
  selected,
  isUploadToAuto,
  setIsUploadToAuto,
  setIsOpenUnipinConfirmation
}) => {
  const handleAdd=()=>{
    setIsOpen(false);
    setIsOpenUnipinConfirmation(true);
  }
  return (
    <div
      className={`fixed inset-0 z-30 w-screen h-screen items-center justify-center bg-black bg-opacity-40 py-5 ${
        isOpen ? "flex" : "hidden"
      }`}
    >
      <div className="bg-white border w-[380px] lg:w-[450px] max-h-[80vh] block px-5 pb-5 rounded-md overflow-auto relative">
        <IoCloseSharp
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-2xl font-semibold cursor-pointer"
        />
        <h2 className="bg-gradient-to-r from-primary to-secondary w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center py-3 mx-auto px-2 md:px-5 capitalize">
          {selected}
        </h2>
        <table className="w-full my-3">
          <thead>
            <tr className="text-center">
              <th className="border-2 border-primary w-1/2 py-1.5 border-collapse">
                UC
              </th>
              <th className="border-2 border-primary w-1/2 py-1.5 border-collapse">
                Quantity
              </th>
            </tr>
          </thead>
          <tbody>
            {codesArray.map((item, idx) => {
              if (item.codes.length) {
                return <ModalRow item={item} key={idx} />;
              }
            })}
            <tr className="text-center">
              <td className="border-2 border-primary w-1/2 font-bold py-1.5 border-collapse">
                Total
              </td>
              <td className="border-2 border-primary w-1/2 font-bold py-1.5 border-collapse">
                {codesArray.reduce((acc, item) => {
                  return acc + item.codes.length;
                }, 0)}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex items-center justify-center mx-auto flex-wrap">
          <button
            onClick={() => setIsUploadToAuto(true)}
            className={`flex items-center gap-1 px-3 py-1.5 font-semibold rounded-l-md border-[3px] ${
              isUploadToAuto ? "border-primary" : "border-gray-400"
            }`}
          >
            <span
              className={`border-[5px] rounded-full ${
                isUploadToAuto ? "border-primary" : ""
              }`}
            ></span>
            Auto Server
          </button>
          <button
            onClick={() => setIsUploadToAuto(false)}
            className={`flex items-center gap-1 px-3 py-1.5 font-semibold rounded-r-md border-[3px] ${
              !isUploadToAuto ? "border-primary z-10" : "border-gray-400"
            }`}
          >
            <span
              className={`border-[5px] rounded-full ${
                !isUploadToAuto ? "border-primary" : ""
              }`}
            ></span>
            Main Server
          </button>
        </div>
        <div>
          <button
            onClick={handleAdd}
            className="bg-gradient-to-r from-primary to-secondary text-white py-1.5 rounded px-5 block mx-auto mt-2.5"
          >
            Add All
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModal;
AddModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  codesArray: PropTypes.array.isRequired,
  selected: PropTypes.string.isRequired,
  isUploadToAuto: PropTypes.bool.isRequired,
  setIsUploadToAuto: PropTypes.func.isRequired,
  setIsOpenUnipinConfirmation: PropTypes.func.isRequired,
};
