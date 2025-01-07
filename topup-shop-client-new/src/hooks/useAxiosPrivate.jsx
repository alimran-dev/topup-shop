import axios from "axios";

const axiosPrivate = axios.create({
  // baseURL: "http://localhost:5000/",
  baseURL:
    import.meta.env.VITE_PROJECTENV === "production"
      ? "https://api.mezbashop.com/"
      : import.meta.env.VITE_PROJECTENV === "demo"
      ? "https://demo.api.mezbashop.com/"
      : "http://localhost:3200/",
  withCredentials: true,
});

const useAxiosPrivate = () => {
  return axiosPrivate;
};

export default useAxiosPrivate;
