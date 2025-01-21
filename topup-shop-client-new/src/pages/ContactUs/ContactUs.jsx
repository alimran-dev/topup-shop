import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useAxiosPublic from '../../hooks/useAxiosPublic';
import { Link } from "react-router-dom";


const ContactUs = () => {

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


  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  

  return (
    <div className="lg:w-2/3 mx-auto border rounded-lg p-4 md:p-8">
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 pb-5">
        Contact Us
      </h1>
      <div className="grid md:grid-cols-2 justify-center gap-4 md:gap-8">
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
                        <Link key={idx} to={item?.url} target="_blank" className="flex items-center gap-2 border bg-slate-50 p-2 md:py-6 md:px-4">
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

export default ContactUs;
