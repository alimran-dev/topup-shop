import PropTypes from "prop-types";
import mbCard from "../../../assets/images/recharge/mb-card2.jpeg"
import minCard from "../../../assets/images/recharge/minutes-card2.jpeg"
import balanceCard from "../../../assets/images/recharge/balance-card2.jpeg"

const SelectCategory = ({ company, setSelectedCategory, setNext }) => {
  const handleSelectCategory = (category) => {
      setSelectedCategory(category);
      setNext("options")
  };
  return (
    <div>
      <h2 className="bg-gradient-to-r from-primary to-secondary w-fit text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent text-center py-3 mx-auto px-2 md:px-5 capitalize">
        Select Category [{company.name}]
      </h2>
      <div className="flex flex-wrap gap-4">
        <div
          onClick={() => handleSelectCategory("mbCard")}
          className="border-2 border-b-2 border-b-primary rounded-lg h-full w-24 md:w-28 cursor-pointer mx-auto flex flex-col"
        >
          <img
            src={mbCard}
            alt=""
            className="w-full h-16 md:h-20 rounded-t transition ease-in-out duration-300 hover:scale-90"
          />
          <div className="rounded-md flex items-center justify-center flex-1 border-t-2">
            <h2 className="text-xs lg:text-base font-semibold text-center py-3 px-3 md:px-1">
              MB
            </h2>
          </div>
        </div>
        <div
          onClick={() => handleSelectCategory("minCard")}
          className="border-2 border-b-2 border-b-primary rounded-lg h-full w-24 md:w-28 cursor-pointer mx-auto flex flex-col"
        >
          <img
            src={minCard}
            alt=""
            className="w-full h-16 md:h-20 rounded-t transition ease-in-out duration-300 hover:scale-90"
          />
          <div className="rounded-md flex items-center justify-center flex-1 border-t-2">
            <h2 className="text-xs lg:text-base font-semibold text-center py-3 px-3 md:px-1">
              Minute
            </h2>
          </div>
        </div>
        <div
          onClick={() => handleSelectCategory("balanceCard")}
          className="border-2 border-b-2 border-b-primary rounded-lg h-full w-24 md:w-28 cursor-pointer mx-auto flex flex-col"
        >
          <img
            src={balanceCard}
            alt=""
            className="w-full h-16 md:h-20 rounded-t transition ease-in-out duration-300 hover:scale-90"
          />
          <div className="rounded-md flex items-center justify-center flex-1 border-t-2">
            <h2 className="text-xs lg:text-base font-semibold text-center py-3 px-3 md:px-1">
              Balance
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectCategory;

SelectCategory.propTypes = {
  company: PropTypes.object.isRequired,
    setSelectedCategory: PropTypes.func.isRequired,
  setNext: PropTypes.func.isRequired,
};
