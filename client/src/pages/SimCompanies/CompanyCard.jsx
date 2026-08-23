import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const CompanyCard = ({ image, title, path, state }) => {

  // console.log("title----",title);
  // console.log("state----",state);
  // console.log("path----",path);
  

  const navigate = useNavigate();


  return (
    <div
      onClick={() => navigate(path,{state: state})}
      className="border-2 border-b-2 border-b-primary rounded-lg h-full cursor-pointer md:w-64 mx-auto flex flex-col"
    >
      <img
        src={image}
        alt=""
        className="w-full h-20 md:h-48 rounded-t transition ease-in-out duration-300 hover:scale-90 p-4"
      />
      <div className="rounded-md flex items-center justify-center flex-1 border-t-2">
        <h2 className="text-xs md:text-lg font-semibold text-center py-3 px-3 md:px-1">
          {title}
        </h2>
      </div>
    </div>
  );
};

export default CompanyCard;

CompanyCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  state: PropTypes.object,
};
