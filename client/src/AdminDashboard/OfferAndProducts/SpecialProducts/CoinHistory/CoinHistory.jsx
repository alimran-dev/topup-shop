import { useEffect, useState, useCallback } from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";
import InfinityLoader from "../../../../components/InfinityLoader";
import Coin from "../../../../components/reusuable/Coin/Coin";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const AdminCoinHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [showReview, setShowReview] = useState(true);
  const limit = 5;
  const axiosPrivate = useAxiosPrivate();

  const fetchData = useCallback(
    async (reset = false, currentDataLength = 0) => {
      try {
        const currentPage = reset
          ? 1
          : Math.ceil(currentDataLength / limit + 1);
        const res = await axiosPrivate.get(
          `/coins/history?page=${currentPage}&limit=${limit}&email=${searchEmail}&showReview=${showReview}`
        );
        // console.log(res.data, "---------data");
        if (reset) {
          setHistoryData(res.data.history);
        } else {
          setHistoryData((prev) => [...prev, ...res.data.history]);
        }
        setTotalData(res.data?.totalHistory || 0);
      } catch (err) {
        // console.log(err);
        toast.error(err?.response?.data?.message || "Error Fetching Data!");
      } finally {
        setLoading(false);
      }
    },
    [axiosPrivate, limit, searchEmail, showReview]
  );

  const fetchMoreData = () => {
    if (totalData > historyData?.length) {
      fetchData(false, historyData.length);
    }
  };

  useEffect(() => {
    setHistoryData([]);
    fetchData(true);
  }, [searchEmail, showReview, fetchData]);

  const handleUpdateStatus = (e, id) => {
    const status = e.target.value;

    const payload = { id, status };

    Swal.fire({
      title: "Are you sure?",
      html: `Updated Status Will Be <span style="color: #e91e63; font-weight: bold; font-style: capitalize;">${status}</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Change",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosPrivate.patch("/coins/review/status", payload);
          // console.log(res.data);
          toast.success(res?.data?.message || "Status Updated!");
          setHistoryData((prev) =>
            prev.map((item) => (item._id === id ? { ...item, status } : item))
          );
        } catch (err) {
          toast.error(err.response?.data?.message || "Somehitng Went Wrong!");
        }
      }
    });
  };

  // page apear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return <div className="py-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="title">Coin History</h2>
      <div className="flex items-center justify-center gap-2">
        <label htmlFor="review" className="input-label">
          Show only Pending Review
        </label>
        <input
          type="checkbox"
          className="toggle"
          defaultChecked={showReview}
          onChange={(e) => setShowReview(e.target.checked)}
        />
      </div>

      {/* user email for filter */}
      <div className="">
        <label className="input-label">Search By Email</label>
        <input
          type="text"
          className="input"
          placeholder="User's email"
          onChange={(e) => setSearchEmail(e.target.value)}
        />
      </div>

      {/* all history */}
      {historyData?.length == 0 ? (
        <div className={`${loading && "hidden"} py-8 text-center`}>
          No Data Found!
        </div>
      ) : (
        <div className="py-4">
          <InfiniteScroll
            dataLength={historyData.length}
            hasMore={historyData.length < totalData}
            next={fetchMoreData}
            loader={<InfinityLoader />}
          >
            <div className="space-y-3">
              {historyData.map((item) => (
                <div
                  key={item?._id}
                  className="flex justify-between items-center bg-slate-100 px-4 py-2 rounded-sm"
                >
                  <div>
                    <div className="flex items-center gap-2 text-sm pb-1">
                      <span>{item?.email}</span>
                      <span className="mt-1">
                        <Coin /> {item?.amount}
                      </span>
                    </div>
                    <p className="text-sm">{item?.name}</p>
                    <div>
                      {item?.info &&
                        Object.entries(item?.info)?.map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong>{" "}
                            {typeof value === "string" &&
                            value?.includes("http") ? (
                              <Link
                                to={value}
                                className="text-blue-700"
                                target="_blank"
                              >
                                {value}
                              </Link>
                            ) : (
                              <span>{value || ""}</span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    {item?.name == "Review Offer Claim" &&
                    item?.status == "pending" ? (
                      <div>
                        <select
                          onChange={(e) => handleUpdateStatus(e, item?._id)}
                          className="px-3 border"
                          defaultValue={item?.status || "pending"}
                        >
                          <option value="pending" disabled>
                            Pending
                          </option>
                          <option value="success">Success</option>
                          <option value="cancel">Cancel</option>
                        </select>
                      </div>
                    ) : (
                      <div
                        className={`badge ${
                          item?.status == "pending"
                            ? "badge-warning"
                            : item?.status == "cancel"
                            ? "badge-error"
                            : "badge-success"
                        } text-white capitalize`}
                      >
                        {item?.status}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        </div>
      )}
    </div>
  );
};

export default AdminCoinHistory;
