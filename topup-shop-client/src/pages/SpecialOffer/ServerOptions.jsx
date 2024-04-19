import { useNavigate, useParams } from "react-router-dom";
import OfferDetails from "./OfferDetails";
import { useEffect } from "react";

const ServerOptions = () => {
  const { server } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (server !== "indonesia" && server !== "all") navigate(-1);
  });
  return <OfferDetails server={server} />;
};

export default ServerOptions;
