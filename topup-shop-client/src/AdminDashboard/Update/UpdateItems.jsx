import { Link } from "react-router-dom";

const UpdateItems = () => {
  return (
    <div className="-mt-5">
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5">
        Update Unipin Options
      </h1>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3 mt-5">
        <Link to={`./id`} className="flex items-center gap-3 border border-gray-400 py-2 px-5 rounded">
          <span className="font-bold flex-1 text-gray-500">20 UC</span>
          <span className="text-[#FA6023] font-bold">17 TK</span>
        </Link>
        <div className="flex items-center gap-3 border border-gray-400 py-2 px-5 rounded">
          <span className="font-bold flex-1 text-gray-500">20 UC</span>
          <span className="text-[#FA6023] font-bold">17 TK</span>
        </div>
        <div className="flex items-center gap-3 border border-gray-400 py-2 px-5 rounded">
          <span className="font-bold flex-1 text-gray-500">20 UC</span>
          <span className="text-[#FA6023] font-bold">17 TK</span>
        </div>
        <div className="flex items-center gap-3 border border-gray-400 py-2 px-5 rounded">
          <span className="font-bold flex-1 text-gray-500">20 UC</span>
          <span className="text-[#FA6023] font-bold">17 TK</span>
        </div>
        <div className="flex items-center gap-3 border border-gray-400 py-2 px-5 rounded">
          <span className="font-bold flex-1 text-gray-500">20 UC</span>
          <span className="text-[#FA6023] font-bold">17 TK</span>
        </div>
      </div>
    </div>
  );
};

export default UpdateItems;
