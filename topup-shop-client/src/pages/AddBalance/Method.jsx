import { useLocation, useNavigate } from "react-router-dom";
import bkash from "../../assets/images/bkash.png";
import nagad from "../../assets/images/nagad.png";
import { useEffect } from "react";

const Method = () => {
  const location = useLocation();
    const navigate = useNavigate();
    console.log(location);
    useEffect(() => {
        if (!location.state)
            navigate("/addBalance");
    },[location.state, navigate])
  return (
    <div>
      <h2 className="text-center text-3xl md:text-5xl font-bold px-4 bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-1.5">
        Payment method
      </h2>
      <p className="text-center text-xl font-medium ">পরিমাণঃ {location.state || 0}</p>
          <div className="flex justify-center gap-5 my-3 flex-wrap">
              <div className="border border-red-400 h-fit w-32 md:w-48 rounded-md transition ease-in-out duration-300 hover:scale-95 cursor-pointer">
                  <img src={bkash} alt="" className="mx-auto h-16 md:h-20" />
                  <p className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 md:text-lg text-white text-center font-medium md:font-semibold rounded-b">Pay {parseFloat(location.state) || 0} BDT</p>
              </div>
              <div className="border border-red-400 h-fit w-32 md:w-48 rounded-md transition ease-in-out duration-300 hover:scale-95 cursor-pointer">
                  <img src={nagad} alt="" className="mx-auto h-16 md:h-20" />
                  <p className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 md:text-lg text-white text-center font-medium md:font-semibold rounded-b">Pay {parseFloat(location.state) || 0} BDT</p>
              </div>
      </div>
    </div>
  );
};

export default Method;
