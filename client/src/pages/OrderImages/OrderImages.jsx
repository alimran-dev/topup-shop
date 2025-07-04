import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import Image from "./Image";

const OrderImages = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState([]);
  const { orderId } = useParams();
  const axiosPublic = useAxiosPublic();
  useEffect(()=>{
    axiosPublic.get(`/order/images?id=${orderId}`)
    .then(res=>{
      if(res.data.success){
        setImages(res.data.images);
      }else{
        console.error("Failed to fetch images");
        setImages([]);
      }
      setIsLoading(false);
    })
    .catch(err=>{
      console.error("Error fetching images:", err);
      setImages([]);
      setIsLoading(false);
    })
  },[axiosPublic, orderId])
  return (
    <div className="space-y-5">
      {
        images.map((img,idx)=> <Image img={img} key={idx} />)
      }
      {
        images.length === 0 && !isLoading && <div className="text-center text-gray-500 text-2xl font-semibold">No images found for this order.</div>
      }
    </div>
  );
};

export default OrderImages;