import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import OfferOption from "../../pages/SpecialOffer/OfferOption";
import Loader from "../../components/Loader";

const UpdateSpecialOption = () => {
  const [selected, setSelected] = useState({ id: "", price: 0 });
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const axiosPublic = useAxiosPublic();
  const { server } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    axiosPublic.get(`/special/offers/${server}`).then((res) => {
      setOptions(res.data);
      setIsLoading(false);
    });
  }, [axiosPublic, server]);
  useEffect(() => {
    navigate(`./${selected.id}`);
  }, [navigate, selected.id]);

  return (
    <div>
      <Loader isLoading={isLoading} />
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-3">
        Special Offer Options
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {options?.map((option) => (
          <OfferOption
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

export default UpdateSpecialOption;
