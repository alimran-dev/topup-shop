import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const ServiceCard = ({ image, title, path }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(path)}
      className="border-2 border-b-2 border-b-[#FA6023] rounded-lg cursor-pointer w-40 md:w-64 mx-auto"
    >
      <img
        src={image}
        alt=""
        className="w-full h-36 md:h-48 rounded-t transition ease-in-out duration-300 hover:scale-90"
      />
      <div className="rounded-md">
        <h2 className="md:text-lg font-semibold text-center py-3 px-3 md:px-1">
          {title}
        </h2>
      </div>
    </div>
  );
};

export default ServiceCard;
ServiceCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
};
