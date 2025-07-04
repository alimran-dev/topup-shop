import PropTypes from "prop-types";
import { IoCloseSharp } from "react-icons/io5";
import ComboModalRow from "./ComboModalRow";

const ComboModal = ({isOpenCombo, setIsOpenCombo, combo, setCombo}) => {

  const handleCloseModal=()=>{
    const newCombo = combo?.map(pack=>{return {name: pack?.name, value: pack?.value, quantity: 0}});
    setCombo(newCombo);
    setIsOpenCombo(false);
  }
  return (
        <div
          className={`fixed inset-0 z-30 w-screen h-screen items-center justify-center bg-black bg-opacity-40 py-5 ${
            isOpenCombo ? "flex" : "hidden"
          }`}
        >
          <div className="bg-white border w-[380px] lg:w-[450px] max-h-[80vh] block px-5 pb-5 rounded-md overflow-auto relative">
            <IoCloseSharp
              onClick={handleCloseModal}
              className="absolute right-4 top-4 text-2xl font-semibold cursor-pointer"
            />
            <h2 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-xl md:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent text-center py-2 mx-auto px-2 md:px-5 capitalize">
              Make a Combo
            </h2>
            <table className="w-full my-2">
              <thead>
                <tr className="text-center">
                  <th className="border-2 border-[#FA6023] w-1/2 py-1.5 border-collapse">
                    Package
                  </th>
                  <th className="border-2 border-[#FA6023] w-1/2 py-1.5 border-collapse">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {combo.map((item, idx) => {
                    return <ComboModalRow item={item} key={idx} idx={idx} combo={combo} setCombo={setCombo} />;
                })}
              </tbody>
            </table>
            <div>
              <button
                onClick={()=>{setIsOpenCombo(false)}}
                className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white py-1.5 rounded px-5 block mx-auto mt-2.5"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
  );
};

export default ComboModal;

ComboModal.propTypes={
  isOpenCombo: PropTypes.bool.isRequired,
  setIsOpenCombo: PropTypes.func.isRequired,
  combo: PropTypes.array.isRequired,
  setCombo: PropTypes.func.isRequired
}