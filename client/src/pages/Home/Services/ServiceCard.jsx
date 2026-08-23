import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const ServiceCard = ({ image, title, path, onClick }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (onClick) {
      onClick();
      return;
    }
    if (title == "Minutes & MB offer") {
      navigate(path, { state: { simCompany: true, cardType: "offerCard" } })
    }
    else {
      navigate(path, { state: { simCompany: true } })
    }
  }

  return (
    <div
      onClick={handleNavigate}
      className="border-2 border-slate-200 border-b-4 border-b-primary rounded-xl h-full cursor-pointer md:w-64 mx-auto flex flex-col"
    >
      <img
        src={image}
        alt=""
        className="w-full h-20 md:h-48 rounded-t transition ease-in-out duration-300 hover:scale-90"
      />
      <div className="rounded-md flex items-center justify-center flex-1">
        <h2 className="text-[11px] md:text-lg font-semibold text-center py-3 px-0 md:px-2">
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
  onClick: PropTypes.func,
};
