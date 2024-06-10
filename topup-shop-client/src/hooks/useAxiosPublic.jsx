import axios from "axios";

const axiosPublic = axios.create({
    // baseURL: 'http://localhost:5000/'
    baseURL: import.meta.env.VITE_PROJECTENV==="production" ? "https://api.mezbashop.com/":"http://localhost:5000/",
})
const useAxiosPublic = () => {
    return axiosPublic;
}

export default useAxiosPublic;