import PropTypes from "prop-types";

const ServiceCard = ({ image, title }) => {
  return (
    <div className="border rounded-md cursor-pointer">
      <img
        src={image}
        alt=""
        className="w-64 h-48 rounded-t transition ease-in-out duration-300 hover:scale-90"
      />
      <div className="border-b-2 border-[#FA6023] rounded-md">
        <h2 className="md:text-lg font-semibold text-center py-3">{title}</h2>
      </div>
    </div>
  );
};

export default ServiceCard;
ServiceCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
