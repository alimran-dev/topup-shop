import { Link } from "react-router-dom";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const FollowUs = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const axiosPublic = useAxiosPublic();

  // load all data
  useEffect(() => {
    setLoading(true);

    axiosPublic.get("/follows/get").then((res) => {
      setData(res.data || []);
      setLoading(false);
    }).catch(err => {
      console.log(err);
      setLoading(false);
      toast.error("Failed to load data!")
    });
  }, [axiosPublic]);

  return (
    <div className="lg:w-2/3 mx-auto md:border rounded-lg md:p-8 pb-8">
      <h1 className="title">
        Follow Us
      </h1>
      <div className="grid md:grid-cols-2 justify-center gap-8">
        {
          loading ?
            <div className="text-center font-bold">Loading...</div>
            :
            <>
              {
                data?.length == 0 ?
                  <div className="text-center font-bold text-red-600">No Data Found!</div>
                  :
                  <>
                    {
                      data?.map((item, idx) =>
                        <Link key={idx} to={item?.url} target="_blank" className="flex items-center gap-2 border bg-slate-50 py-6 px-4">
                          <img src={item?.icon} className="w-20 h-20 object-contain" alt="social logo" />
                          <p className="font-medium">
                            {item?.text}
                          </p>
                        </Link>
                      )
                    }
                  </>
              }
            </>
        }
      </div>
    </div>
  );
};

export default FollowUs;
