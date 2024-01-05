import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Loader from "../../components/Loader";
import UpdateItemOption from "./UpdateItemOption";

const UpdateItems = () => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { category } = useParams();
  const axiosPrivate = useAxiosPrivate();
  useEffect(() => {
    axiosPrivate.get(`/options?category=${category}`)
      .then(res => {
        setOptions(res.data);
        setIsLoading(false);
    })
  },[axiosPrivate, category])
  return (
    <div className="-mt-5">
      <Loader isLoading={isLoading} />
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-4">
        Update Unipin Options
      </h1>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3 mt-5">
        {
          options?.map(option=><UpdateItemOption option={option} key={option._id} />)
        }
      </div>
    </div>
  );
};

export default UpdateItems;
