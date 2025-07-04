import axios from "axios";
import { allLinks } from "../utils/constants";

const axiosPrivate = axios.create({
  // baseURL: "http://localhost:5000/",
  baseURL:
    import.meta.env.VITE_PROJECTENV === "production"
      ? `${allLinks.productionAPI}`
      : import.meta.env.VITE_PROJECTENV === "demo"
      ? `${allLinks.demoAPI}`
      : "http://localhost:5000/",
  withCredentials: true,
});

const useAxiosPrivate = () => {
  return axiosPrivate;
};

export default useAxiosPrivate;
