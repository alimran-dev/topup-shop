import { useEffect, useState } from "react";
import TransactionCard from "./TransactionCard";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import InfiniteScroll from "react-infinite-scroll-component";
import useAuth from "../../hooks/useAuth";
import InfinityLoader from "../../components/InfinityLoader";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";

const MyTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalTrx, setTotalTrx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();
  const { loading } = useAuth();
  const limit = 5;
  const page = Math.ceil(transactions.length / limit + 1);

  const getTrx = () => {
    if (!loading) {
      axiosPrivate
        .get(`/transactions?page=${page}&limit=${limit}`)
        .then((res) => {
          setTransactions([...transactions, ...res.data.transactions]);
          setTotalTrx(res.data.trxCount);
          setIsLoading(false);
        });
    }
  };
  const getMore = () => {
    if (transactions.length < totalTrx) {
      getTrx();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    getTrx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <Loader isLoading={isLoading} />
      <h2 className="text-center text-3xl md:text-5xl font-bold px-4 bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-1.5">
        My Transactions
      </h2>
      <div>
        {transactions.length > 0 && (
          <div className="hidden md:flex justify-around items-center mt-3">
            <p className="border w-full text-center py-1.5 font-semibold border-gray-400 rounded-tl-md">
              Method
            </p>
            <p className="border w-full text-center py-1.5 font-semibold border-gray-400">
              Time
            </p>
            <p className="border w-full text-center py-1.5 font-semibold border-gray-400">
              Trx ID
            </p>
            <p className="border w-full text-center py-1.5 font-semibold border-gray-400">
              Amount
            </p>
            <p className="border w-full text-center py-1.5 font-semibold border-gray-400">
              Status
            </p>
            <p className="border w-full text-center py-1.5 font-semibold border-gray-400 rounded-tr-md">
              Action
            </p>
          </div>
        )}
        <div>
          <InfiniteScroll
            dataLength={transactions.length}
            next={getMore}
            hasMore={transactions.length < totalTrx}
            loader={<InfinityLoader />}
          >
            {transactions.map((transaction) => (
              <TransactionCard
                transaction={transaction}
                key={transaction._id}
              />
            ))}
          </InfiniteScroll>
        </div>
        {transactions.length > 0 || (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 my-5">
            <span className="text-2xl font-medium text-center">
              No Transaction Data
            </span>
            <Link
              to={"/addBalance"}
              className="border-2 border-[#FA6023] px-4 py-0.5 rounded font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] bg-clip-text text-transparent"
            >
              Add Balance
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTransactions;
