import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";

const Notice = () => {
  const [isLoadingNotice, setIsLoadingNotice] = useState(true);
  const [isLoadingOffer, setIsLoadingOffer] = useState(true);
  const [notice, setNotice] = useState({});
  const [offer, setOffer] = useState({});
  const axiosPrivate = useAxiosPrivate();
  useEffect(() => {
    axiosPrivate.get("/notice").then((res) => {
      setNotice(res.data[0]);
      setIsLoadingNotice(false);
    });
  }, [axiosPrivate]);
  useEffect(() => {
    axiosPrivate.get("/balance/offer").then((res) => {
      setOffer(res.data[0]);
      setIsLoadingOffer(false);
    });
  }, [axiosPrivate]);
  const handleNotice = (e) => {
    e.preventDefault();
    setIsLoadingNotice(true);
    const text = e.target.notice.value;
    const noticeDoc = { notice: text };
    axiosPrivate
      .patch(`/notice/admin/update?id=${notice._id}`, noticeDoc)
      .then((res) => {
        setIsLoadingNotice(false);
        if (res.data.modifiedCount > 0) {
          Swal.fire({
            toast: true,
            title: "Notice Updated",
            icon: "success",
            position: "top",
            showConfirmButton: false,
            timer: 3000,
          });
        }
      });
  };
  const handleOffer = (e) => {
    e.preventDefault();
    setIsLoadingOffer(true);
    const text = e.target.offer.value;
    const offerDoc = { offer: text };
    axiosPrivate
      .patch(`/balance/admin/offer/update?id=${offer._id}`, offerDoc)
      .then((res) => {
        setIsLoadingOffer(false);
        if (res.data.modifiedCount > 0) {
          Swal.fire({
            toast: true,
            title: "Offer Updated",
            icon: "success",
            position: "top",
            showConfirmButton: false,
            timer: 3000,
          });
        }
      });
  };

  // page apear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Loader isLoading={isLoadingNotice || isLoadingOffer} />
      <h2 className="text-center text-3xl md:text-5xl font-bold px-4 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text py-3">
        Update Notice
      </h2>
      <form onSubmit={handleNotice}>
        <textarea
          name="notice"
          id=""
          className="border-2 border-primary focus:outline-secondary rounded-md w-full md:w-3/5 mx-auto block px-3 py-2 h-40 md:h-44"
          placeholder="Type your notice here"
          defaultValue={notice?.notice}
        ></textarea>
        <button
          type="submit"
          className="bg-gradient-to-r from-primary to-secondary px-3 py-1.5 text-white font-medium rounded-md block mx-auto my-3"
        >
          Update
        </button>
      </form>
      <h2 className="text-center text-3xl md:text-5xl font-bold px-4 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text py-3">
        Offer Notice Update
      </h2>
      <form onSubmit={handleOffer}>
        <textarea
          name="offer"
          id=""
          className="border-2 border-primary focus:outline-secondary rounded-md w-full md:w-3/5 mx-auto block px-3 py-2 h-40 md:h-44"
          placeholder="Type your offer here"
          defaultValue={offer?.offer}
        ></textarea>
        <button
          type="submit"
          className="bg-gradient-to-r from-primary to-secondary px-3 py-1.5 text-white font-medium rounded-md block mx-auto my-3"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default Notice;
