import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import Loader from "../../../components/Loader";
import Option from "./Option";

const RechargeItems = () => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState({ _id: "" });
  const { category } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  useEffect(() => {
    axiosPrivate
      .get(
        `/option/all?category=recharge&id=${location.state?.id}&docName=${location.state?.docName}`
      )
      .then((res) => {
        setOptions(res.data);
        setIsLoading(false);
      });
  }, [axiosPrivate, category, location.state?.docName, location.state?.id]);
  return (
    <div className="-mt-5">
      <Loader isLoading={isLoading} />
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-4 capitalize">
        Update {category} Options
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-3 md:px-5 py-5">
        {options?.map((option) => (
          <Option
            option={option}
            selected={selected}
            setSelected={setSelected}
            key={option._id}
          />
        ))}
      </div>
    </div>
  );
};

export default RechargeItems;
