import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import Loader from "../../../components/Loader";
import { useParams } from "react-router-dom";
import Image from "../../../pages/OrderImages/Image";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const AutoCheck = () => {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const {id} = useParams();
  const axiosPrivate = useAxiosPrivate();

  useEffect(()=>{
    axiosPrivate.get("/auto/order-info",{params: {id}})
    .then(res=>{
      console.log(res.data);
      setData(res.data);
    })
    .catch(err=>{
      console.error("Error fetching data:", err);
    })
    .finally(()=>{
      setIsLoading(false);
    });
  },[axiosPrivate, id])

  const handlePendingAgain = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will mark the order as pending again.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, mark as pending",
      cancelButtonText: "No, cancel",
      confirmButtonColor: "#FA6023",
    }).then(async(result) => {
      if (result.isConfirmed) {
        try{
          await axiosPrivate.patch("/auto/update-status", {id, status: "pending"});
          toast.success("Order marked as pending again.");
        } catch (error) {
          toast.error("Failed to mark order as pending.");
        }
      } else {
        toast.error("Action cancelled.");
      }
    })
  };
  return (
    <div>
      <Loader isLoading={isLoading} />
      <div>
        <button className="button block mx-auto" onClick={handlePendingAgain}>Pending Again</button>
        <h2 className="text-xl font-semibold">Order Info:</h2>
        {data && (
          <pre className="overflow-x-scroll">{JSON.stringify(data?.order, null, 2)}</pre>
        )}
        <h2 className="text-xl font-semibold">Screenshots: </h2>
        {data?.screenshots && (
          data?.screenshots?.map((img, idx) => <Image img={img} key={idx} />)
        )}
      </div>
    </div>
  );
};

export default AutoCheck;