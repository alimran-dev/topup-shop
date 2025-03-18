import PropTypes from "prop-types";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";

const Confirmation = ({
  selectedCompany,
  selectedCategory,
  selectedOption,
  cards,
  setIsOpenCards,
  resetTextarea,
  setSelectedCompany,
  setSelectedCategory,
  setSelectedOption,
  setNext,
}) => {

  const axiosPrivate = useAxiosPrivate();


  // confirmation fn
  const handleConfirm = () => {

    axiosPrivate
      .post(`/code/admin/add/rechargeCards/${selectedOption.id}`, cards)
      .then((res) => {
        console.log(res.data);
        Swal.fire({
          position: "top",
          icon: "success",
          title: `${selectedOption.name} codes added.`,
          showConfirmButton: false,
          timer: 5000,
          toast: true,
        });
        setIsOpenCards(false);
        resetTextarea();
        setSelectedCompany({ _id: "" });
        setSelectedCategory("");
        setSelectedOption({ _id: "" });
        setNext("companies");
      });
    
  };


  return (
    <div>
      <h2 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent text-center py-3 mx-auto px-2 md:px-5 capitalize">
        Confirmation
      </h2>
      <table className="w-full border-2 rounded-md">
        <tbody>
          <tr className="border-2">
            <td className="border-2 px-3 py-1.5">Operator</td>
            <td className="border-2 px-3 py-1.5">{`${selectedCompany?.name}`}</td>
          </tr>
          <tr className="border-2">
            <td className="border-2 px-3 py-1.5">Category</td>
            <td className="border-2 px-3 py-1.5">{`${
              selectedCategory === "mbCard"
                ? "MB Card"
                : selectedCategory === "minCard"
                ? "Minute Card"
                : selectedCategory === "balanceCard"
                ? "Balance Card"
                : ""
            }`}</td>
          </tr>
          <tr className="border-2">
            <td className="border-2 px-3 py-1.5">Name</td>
            <td className="border-2 px-3 py-1.5">{`${selectedOption?.name}`}</td>
          </tr>
          <tr className="border-2">
            <td className="border-2 px-3 py-1.5">Price</td>
            <td className="border-2 px-3 py-1.5">{`${selectedOption?.price} TK`}</td>
          </tr>
          <tr className="border-2">
            <td className="border-2 px-3 py-1.5">Quantity</td>
            <td className="border-2 px-3 py-1.5">{`${cards.length}`}</td>
          </tr>
        </tbody>
      </table>
      <button
        onClick={handleConfirm}
        className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] px-4 py-1 text-white font-semibold rounded-md block mx-auto mt-4"
      >
        Confirm
      </button>
    </div>
  );
};

export default Confirmation;

Confirmation.propTypes = {
  selectedCompany: PropTypes.object.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  selectedOption: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired,
  setIsOpenCards: PropTypes.func.isRequired,
  setNext: PropTypes.func.isRequired,
  setSelectedOption: PropTypes.func.isRequired,
  setSelectedCategory: PropTypes.func.isRequired,
  setSelectedCompany: PropTypes.func.isRequired,
  resetTextarea: PropTypes.func.isRequired,
};
