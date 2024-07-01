import { TbCurrencyTaka } from "react-icons/tb";
import TransactionsCard from "./TransactionsCard";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";
import InfinityLoader from "../../components/InfinityLoader";
import Loader from "../../components/Loader";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalTrx, setTotalTrx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTrx, setSearchTrx] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [page, setPage] = useState(1);
  const [bkash, setBkash] = useState(0);
  const [nagad, setNagad] = useState(0);
  const [id, setId] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const { loading } = useAuth();
  const limit = 5;

  const getTrx = () => {
    if (!loading) {
      axiosPrivate
        .get(
          `/transactions?page=${page}&limit=${limit}&email=${searchEmail}&trxID=${searchTrx}`
        )
        .then((res) => {
          setTransactions([...transactions, ...res.data.transactions]);
          setTotalTrx(res.data.trxCount);
          setIsLoading(false);
        });
    }
  };
  const getMore = () => {
    if (transactions.length < totalTrx) {
      setPage(page + 1);
    }
  };
  useEffect(() => {
    axiosPrivate.get("/admin/paymentMethod/summary").then((res) => {
      setBkash(res.data[0]?.bkash);
      setNagad(res.data[0]?.nagad);
      setId(res.data[0]?._id);
    });
  }, [axiosPrivate]);
  useEffect(() => {
    if (page === 1) {
      window.scrollTo(0, 0);
    }
    getTrx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTrx, searchEmail]);
  const handleSearch = () => {
    setTransactions([]);
    setTotalTrx(0);
    setPage(1);
  };
  const handleResetMethod = (method) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Reset ${method} method`,
      icon: "warning",
      showCancelButton: false,
      confirmButtonColor: "#E61C55",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate
          .patch(`/admin/paymentMethod/reset?id=${id}&method=${method}`)
          .then((res) => {
            console.log(res.data);
            if (res.data?.modifiedCount > 0) {
              Swal.fire({
                title: "Reset successful",
                toast: true,
                showConfirmButton: false,
                position: "top",
                icon: "success",
                timer: 3000,
              });
              if (method === "bkash") {
                setBkash(0);
              } else if (method === "nagad") {
                setNagad(0);
              }
            }
          });
      }
    });
  };
  return (
    <div>
      <Loader isLoading={isLoading} />
      <div className="flex gap-5 flex-wrap">
        <div className="flex-1 border-2 border-[#FA6023] p-3 rounded-md flex flex-col items-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-semibold w-max  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text">
            Bkash
          </p>
          <p className="flex items-center justify-center w-fit text-3xl  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text font-semibold">
            {bkash || 0}
            <TbCurrencyTaka className="text-[#FA6023]" />
          </p>
          <button
            onClick={() => handleResetMethod("bkash")}
            className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white font-semibold px-3 py-1 rounded"
          >
            Reset
          </button>
        </div>
        <div className="flex-1 border-2 border-[#FA6023] p-3 rounded-md flex flex-col items-center">
          <p className="text-2xl md:text-3xl lg:text-4xl font-semibold w-max  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text">
            Nagad
          </p>
          <p className="flex items-center justify-center w-fit text-3xl  bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text font-semibold">
            {nagad || 0}
            <TbCurrencyTaka className="text-[#FA6023]" />
          </p>
          <button
            onClick={() => handleResetMethod("nagad")}
            className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white font-semibold px-3 py-1 rounded"
          >
            Reset
          </button>
        </div>
      </div>
      <h2 className="text-center text-2xl md:text-5xl font-bold px-4 bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3">
        All Transactions
      </h2>
      <div
        onChange={handleSearch}
        className="flex flex-col justify-center items-center gap-2 pb-3"
      >
        <input
          type="text"
          onChange={(e) => setSearchTrx(e.target.value)}
          className="border px-3 py-1 rounded border-gray-400 focus:outline-[#FA6023]"
          placeholder="Trx ID"
        />
        <input
          type="text"
          onChange={(e) => setSearchEmail(e.target.value)}
          className="border px-3 py-1 rounded border-gray-400 focus:outline-[#FA6023]"
          placeholder="Email"
        />
      </div>
      <div>
        <InfiniteScroll
          dataLength={transactions.length}
          next={getMore}
          hasMore={transactions.length < totalTrx}
          loader={<InfinityLoader />}
        >
          <div className="flex flex-col gap-4">
            {transactions.map((transaction) => (
              <TransactionsCard
                key={transaction._id}
                transaction={transaction}
                transactions={transactions}
                setTransactions={setTransactions}
              />
            ))}
          </div>
        </InfiniteScroll>
      </div>
      {transactions.length > 0 || (
        <div className="h-full w-full flex flex-col items-center justify-center gap-2">
          <span className="text-3xl font-medium">No transactions</span>
          <button
            onClick={() => window.location.reload()}
            className="border-2 border-[#FA6023] px-4 py-0.5 rounded font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] bg-clip-text text-transparent"
          >
            Reload
          </button>
        </div>
      )}
    </div>
  );
};

export default Transactions;
