import PropTypes from "prop-types";
import { IoCloseSharp } from "react-icons/io5";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import { useState } from "react";

const UnipinConfirmation = ({
  isOpenUnipinConfirmation,
  setIsOpenUnipinConfirmation,
  isUploadToAuto,
  codesArray,
  resetTextarea,
  setInputs,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const handleAddCodes = () => {
    if (loading) return;
    setLoading(true);
    if (isUploadToAuto) {
      axiosPrivate
        .post("/auto/add-unipins", codesArray)
        .then((res) => {
          toast.success(`${res.data?.message} (${res.data?.total})`);
          setIsOpenUnipinConfirmation(false);
          resetTextarea();
          setInputs("");
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to upload");
          setIsOpenUnipinConfirmation(false);
          setLoading(false);
        });
    } else {
      axiosPrivate
        .post(`/code/admin/add/unipin`)
        .then(() => {
          toast.success("Unipins added successfully to main server");
          setIsOpenUnipinConfirmation(false);
          resetTextarea();
          setInputs("");
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to add unipins to main server.");
          setIsOpenUnipinConfirmation(false);
          setLoading(false);
        });
    }
  };
  return (
    <div
      className={`fixed inset-0 z-30 w-screen h-screen items-center justify-center bg-black bg-opacity-40 py-5 ${
        isOpenUnipinConfirmation ? "flex" : "hidden"
      }`}
    >
      <div className="bg-white border w-[380px] lg:w-[450px] max-h-[80vh] block px-5 pb-5 rounded-md overflow-auto relative">
        <IoCloseSharp
          onClick={() => setIsOpenUnipinConfirmation(false)}
          className="absolute right-4 top-4 text-2xl font-semibold cursor-pointer"
        />
        <h2 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center py-3 mx-auto px-2 md:px-5 capitalize">
          Confirmation
        </h2>
        <p className="text-center">
          Are you sure to add{" "}
          {codesArray.reduce((acc, item) => {
            return acc + item.codes.length;
          }, 0)}{" "}
          unipins to {isUploadToAuto ? "Auto" : "Main"} Server?
        </p>
        <button onClick={handleAddCodes} className="button block mx-auto mt-3">
          {loading? "Please wait": "Confirm"}
        </button>
      </div>
    </div>
  );
};

export default UnipinConfirmation;

UnipinConfirmation.propTypes = {
  isOpenUnipinConfirmation: PropTypes.bool.isRequired,
  setIsOpenUnipinConfirmation: PropTypes.func.isRequired,
  isUploadToAuto: PropTypes.bool.isRequired,
  codesArray: PropTypes.array.isRequired,
  resetTextarea: PropTypes.func.isRequired,
  setInputs: PropTypes.func.isRequired,
};
