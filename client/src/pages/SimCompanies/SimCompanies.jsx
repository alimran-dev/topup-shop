import { useEffect, useState } from "react";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import CompanyCard from "./CompanyCard";
import Loader from "../../components/Loader";
import { useLocation } from "react-router-dom";

const SimCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const axiosPublic = useAxiosPublic();
  const location = useLocation();

  useEffect(() => {
    axiosPublic.get("/recharge/companies").then((res) => {
      setCompanies(res.data);
      setIsLoading(false);
    });
  }, [axiosPublic]);

  // console.log(location.state, "--------sim");


  // page appear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Loader isLoading={isLoading} />
      <h2 className="text-center text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3 -mt-5 w-fit mx-auto">
        Choose a Sim
      </h2>
      <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
        {companies.map((company) => (
          <div className="flex-1" key={company._id}>
            <CompanyCard image={company.logo} title={company.name} path="./../category" state={{ id: company._id, companyName: company.name, docName: location?.state }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimCompanies;
