import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./styles/Method.css";
import MethodCard from "./MethodCard";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const Method = () => {
  
  const [methods, setMethods] = useState([]);
  const [err, setErr] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) navigate("/addBalance");
  }, [location.state, navigate]);
  
  useEffect(() => {
    axiosPrivate.get("/payment/methods",{params: {amount: location.state}}).then((data) => {
      setMethods(data.data);
    });
  }, [axiosPrivate, location.state]);
  
  
  return (
    <div>
      <h2 className="text-center text-3xl md:text-5xl font-bold px-4 bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-1.5">
        Payment method
      </h2>
      {err && (
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          <p className="text-center text-lg font-semibold">{err} </p>
          <Link
            to={"/myTransactions"}
            className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] px-3 rounded text-white font-medium"
          >
            Pay Now
          </Link>
        </div>
      )}
      <div className="flex justify-center gap-5 my-3 flex-wrap">
        {methods?.map((method) => (
          <MethodCard
            method={method}
            key={method._id}
            amount={location.state}
            setErr={setErr}
          />
        ))}
      </div>
    </div>
  );
};

export default Method;
