import { ThreeCircles } from "react-loader-spinner";
import PropTypes from "prop-types";

const Loader = ({isLoading}) => {
  return (
    <div className={`fixed inset-0 z-10 h-screen w-screen bg-white items-center justify-center ${isLoading?"flex":"hidden"}`}>
      <ThreeCircles
        visible={true}
        height="80"
        width="80"
        color="rgb(var(--theme-primary))"
        ariaLabel="three-circles-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
};

export default Loader;
Loader.propTypes = {
    isLoading: PropTypes.bool,
}
