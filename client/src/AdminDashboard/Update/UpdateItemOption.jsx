import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const UpdateItemOption = ({ option }) => {
    const navigate = useNavigate();
    const { _id, category, name, price, stock } = option || {};
    return (
        <div
        onClick={()=>navigate(`./${_id}`)}
        className={`flex items-center gap-3 py-2 px-3 rounded relative border-2 border-gray-400 cursor-pointer`}
      >
        {category === "unipin" || category === "shell" ? (
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 text-sm rounded bg-[#FA6023] text-white w-max">
              {stock ? `In Stock: ${stock}` : stock === 0 ? "Stock Out" : ""}
            </span>
          ):<></>}
        {category === "idcode" && (
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 text-sm rounded bg-[#FA6023] text-white w-max">
            {stock ? "" : "Stock Out"}
          </span>
        )}
  
        <span
          className={`border-[5px] rounded-full p-0.5`}
        ></span>
        <span className="font-bold flex-1 text-gray-500">{name}</span>
        <span className="text-[#FA6023] font-bold">{price} TK</span>
      </div>
    );
};

export default UpdateItemOption;
UpdateItemOption.propTypes = {
    option: PropTypes.object.isRequired,
}