import PropTypes from "prop-types";
import { IoClose } from "react-icons/io5";

const NoticeView = ({ title, notice, isOpen, setIsOpen }) => {
  return (
    <div
      className={`relative w-full max-w-none mx-auto md:py-4 ${
        notice?.length > 0 ? (isOpen ? "" : "hidden") : "hidden"
      }`}
    >
      <div className="bg-primary px-1 pb-1 border-4 border-primary rounded-md relative w-full">
        <IoClose
          onClick={() => setIsOpen(!isOpen)}
          className="absolute text-xl font-bold top-1 right-1 cursor-pointer text-white"
        />

        <h2 className="text-center text-white font-bold text-lg md:text-xl uppercase py-1 md:py-3">
          {title || ""}
        </h2>
        <div className="px-3 md:px-6 py-2 md:py-4 bg-slate-800 text-white text-sm leading-6 text-justify rounded-md">
          <p className="text-center">{notice || "No notices available at the moment."}</p>
        </div>
      </div>
    </div>
  );
};

export default NoticeView;

NoticeView.propTypes = {
  title: PropTypes.string.isRequired,
  notice: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
};
