import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";

const Notice = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState({});
  const axiosPrivate = useAxiosPrivate();
  useEffect(() => {
    axiosPrivate.get("/notice").then((res) => {
      setNotice(res.data[0]);
      setIsLoading(false);
    });
  }, [axiosPrivate]);
  const handleNotice = (e) => {
    e.preventDefault();
    const text = e.target.notice.value;
    const noticeDoc = { notice: text };
    axiosPrivate
      .patch(`/notice/update?id=${notice._id}`, noticeDoc)
      .then((res) => {
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
  return (
    <div>
      <Loader isLoading={isLoading} />
      <h2 className="text-center text-3xl md:text-5xl font-bold px-4 bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3">
        Update Notice
      </h2>
      <form onSubmit={handleNotice}>
        <textarea
          name="notice"
          id=""
          className="border-2 border-[#FA6023] focus:outline-[#E61C55] rounded-md w-full md:w-3/5 mx-auto block px-3 py-2 h-40 md:h-44"
          placeholder="Type your notice here"
          defaultValue={notice.notice}
        ></textarea>
        <button
          type="submit"
          className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] px-3 py-1.5 text-white font-medium rounded-md block mx-auto my-3"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default Notice;
