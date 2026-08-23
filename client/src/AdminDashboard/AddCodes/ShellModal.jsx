import { useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import PropTypes from "prop-types";
import ShellOption from "./ShellOption";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";

const ShellModal = ({
  isOpenShell,
  setIsOpenShell,
  shellOptions,
  resetTextarea,
  setInputs,
  shellCodes,
}) => {
  const [selected, setSelected] = useState({ _id: "" });
  const [error, setError] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const handleAddCodes = () => {
    if (!selected._id) {
      setError("Please select an option");
      return;
    }
    const codesArray = [...shellCodes];
    axiosPrivate
      .post(`/code/admin/add/shell/${selected._id}`, codesArray)
      .then((res) => {
        // console.log(res.data);
        Swal.fire({
          position: "top",
          icon: "success",
          title: `${selected.name} codes added.`,
          showConfirmButton: false,
          timer: 5000,
          toast: true,
        });
        setIsOpenShell(false);
        resetTextarea();
        setInputs("");
      });
  };
  useEffect(() => {
    setSelected({ _id: "" });
    setError("");
  }, [isOpenShell]);
  return (
    <div
      className={`fixed inset-0 z-30 w-screen h-screen items-center justify-center bg-black bg-opacity-40 py-5 ${
        isOpenShell ? "flex" : "hidden"
      }`}
    >
      <div className="bg-white border w-[380px] lg:w-[450px] max-h-[80vh] block px-5 pb-5 rounded-md overflow-auto relative">
        <IoCloseSharp
          onClick={() => setIsOpenShell(false)}
          className="absolute right-4 top-4 text-2xl font-semibold cursor-pointer"
        />
        <h2 className="bg-gradient-to-r from-primary to-secondary w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center py-3 mx-auto px-2 md:px-5 capitalize">
          Garena Shell
        </h2>
        <p className="text-center bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text text-xl font-semibold">
          Total: {shellCodes.length}
        </p>
        <div className="w-full grid grid-cols-2 gap-4 my-3">
          {shellOptions.map((option) => (
            <ShellOption
              option={option}
              selected={selected}
              setSelected={setSelected}
              key={option._id}
            />
          ))}
        </div>
        <div>
          {error && (
            <p className="text-red-500 text-center font-medium">{error}</p>
          )}
          <button
            onClick={handleAddCodes}
            className="bg-gradient-to-r from-primary to-secondary text-white py-1.5 rounded px-5 block mx-auto"
          >
            Add All
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShellModal;
ShellModal.propTypes = {
  isOpenShell: PropTypes.bool.isRequired,
  setIsOpenShell: PropTypes.func.isRequired,
  shellOptions: PropTypes.array.isRequired,
  resetTextarea: PropTypes.func.isRequired,
  setInputs: PropTypes.func.isRequired,
  shellCodes: PropTypes.array.isRequired,
};
