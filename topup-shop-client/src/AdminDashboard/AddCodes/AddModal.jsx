import PropTypes from "prop-types";
import { IoCloseSharp } from "react-icons/io5";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import ModalRow from "./ModalRow";
import Swal from "sweetalert2";

const AddModal = ({
  isOpen,
  setIsOpen,
  codesArray,
  selected,
  resetTextarea,
  setInputs,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const handleAddCodes = () => {
    axiosPrivate.post(`/addCodes/${selected}`, codesArray).then((res) => {
      // console.log(res.data);
      Swal.fire({
        position: "top",
        icon: "success",
        title: `${selected} codes added.`,
        showConfirmButton: false,
        timer: 5000,
        toast: true,
      });
      setIsOpen(false);
      resetTextarea();
      setInputs("");
    });
  };
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
        <h2 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center py-3 mx-auto px-2 md:px-5 capitalize">
          {selected}
        </h2>
        <table className="w-full my-3">
          <thead>
            <tr className="text-center">
              <th className="border-2 border-[#FA6023] w-1/2 py-1.5 border-collapse">
                UC
              </th>
              <th className="border-2 border-[#FA6023] w-1/2 py-1.5 border-collapse">
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
              <td className="border-2 border-[#FA6023] w-1/2 font-bold py-1.5 border-collapse">
                Total
              </td>
              <td className="border-2 border-[#FA6023] w-1/2 font-bold py-1.5 border-collapse">
                {codesArray.reduce((acc, item) => {
                  return acc + item.codes.length;
                }, 0)}
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <button
            onClick={handleAddCodes}
            className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white py-1.5 rounded px-5 block mx-auto"
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
  resetTextarea: PropTypes.func.isRequired,
  setInputs: PropTypes.func.isRequired,
};
