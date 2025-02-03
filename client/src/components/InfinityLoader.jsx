import { RotatingLines } from "react-loader-spinner";

const InfinityLoader = () => {
  return (
    <div className="w-fit h-fit block mx-auto py-4 bg-white">
      <RotatingLines
        visible={true}
        height="50"
        width="50"
        strokeColor="#FA6023"
        strokeWidth="5"
        animationDuration="0.75"
        ariaLabel="rotating-lines-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
};

export default InfinityLoader;
