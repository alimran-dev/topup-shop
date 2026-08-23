import axios from "axios";
import { allLinks } from "../utils/constants";

// Same as useAxiosPublic, but sends the httpOnly access-token cookie with
// every request. Used ONLY for public catalog fetches that optionally
// personalize prices for logged-in subscribers (server never rejects guests).
const axiosPublicCredentials = axios.create({
  // baseURL: 'http://localhost:5000/'
  baseURL:
    import.meta.env.VITE_PROJECTENV === "production"
      ? `${allLinks.productionAPI}`
      : import.meta.env.VITE_PROJECTENV === "demo"
      ? `${allLinks.demoAPI}`
      : "http://localhost:5000/",
  withCredentials: true,
});
const useAxiosPublicCredentials = () => {
  return axiosPublicCredentials;
};

export default useAxiosPublicCredentials;
