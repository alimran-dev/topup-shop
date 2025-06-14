import axios from "axios";
import { allLinks } from "../utils/constants";

const axiosPublic = axios.create({
  // baseURL: 'http://localhost:5000/'
  baseURL:
    import.meta.env.VITE_PROJECTENV === "production"
      ? `${allLinks.productionAPI}`
      : import.meta.env.VITE_PROJECTENV === "demo"
      ? `${allLinks.demoAPI}`
      : "http://localhost:5000/",
});
const useAxiosPublic = () => {
  return axiosPublic;
};

export default useAxiosPublic;
