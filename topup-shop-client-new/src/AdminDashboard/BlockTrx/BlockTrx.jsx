import { useEffect, useState } from "react";
import BlockTrxCard from "./BlockTrxCard";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import InfiniteScroll from "react-infinite-scroll-component";
import InfinityLoader from "../../components/InfinityLoader";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";

const BlockTrx = () => {
  const [blockTrxs, setBlockTrxs] = useState([]);
  const [totalTrx, setTotalTrx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTrx, setSearchTrx] = useState("");
  const [page, setPage] = useState(1);
  const axiosPrivate = useAxiosPrivate();
  const { loading } = useAuth();
  const limit = 6;

  // console.log(blockTrxs);
  const getTrx = () => {
    if (!loading) {
      axiosPrivate
        .get(
          `/transaction/block/admin/all?page=${page}&limit=${limit}&trxID=${searchTrx}`
        )
        .then((res) => {
          setBlockTrxs([...blockTrxs, ...res.data.blockedTrx]);
          setTotalTrx(res.data?.totalTrx);
          setIsLoading(false);
        });
    }
  };
  const getMore = () => {
    if (blockTrxs.length < totalTrx) {
      setPage(page + 1);
    }
  };
  useEffect(() => {
    if (page === 1) {
      window.scrollTo(0, 0);
    }
    getTrx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTrx]);
  const handleSearch = (e) => {
    setSearchTrx(e.target.value);
    setBlockTrxs([]);
    setTotalTrx(0);
    setPage(1);
  };
  const handleBlock = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.target;
    const provider = form.provider.value;
    const category = form.category.value;
    const trxID = form.trxID.value;
    const newBlock = { provider, category, trxID };
    // console.log(newBlock);
    axiosPrivate.post("/transaction/block/admin/add", newBlock).then((res) => {
      if (res.data?.insertedId) {
        Swal.fire({
          toast: true,
          title: "Trx Blocked",
          icon: "success",
          showConfirmButton: false,
          position: "top",
          timer: 3000,
        });
        setIsLoading(false);
        form.reset();
      }
    });
  };
  return (
    <div>
      <Loader isLoading={isLoading} />
      <h2 className="text-center text-2xl md:text-5xl font-bold px-4 bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text pb-3">
        Block Transaction
      </h2>
      <form
        onSubmit={handleBlock}
        className="flex flex-col border-2 border-[#E61C55] w-fit mx-auto p-4 rounded-md space-y-1.5"
      >
        <div>
          <label htmlFor="provider" className="font-semibold">
            Provider:{" "}
          </label>
          <select name="provider" id="" className="rounded px-2 py-0.5">
            <option value="bkash">Bkash</option>
            <option value="nagad">Nagad</option>
          </select>
        </div>
        <div>
          <label htmlFor="category" className="font-semibold">
            Category:{" "}
          </label>
          <select name="category" id="" className="rounded px-2 py-0.5">
            <option value="personal">Personal</option>
            <option value="agent">Agent</option>
          </select>
        </div>
        <div>
          <label htmlFor="trxID" className="font-semibold block mb-1.5">
            TrxID:{" "}
          </label>
          <input
            name="trxID"
            type="text"
            required
            className="border-2 px-3 py-1 w-full rounded-md focus:outline-[#E61C55]"
            placeholder="Enter TrxID"
          />
        </div>
        <button
          type="submit"
          className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white font-semibold px-3 py-1 rounded-md"
        >
          Block
        </button>
      </form>
      <h2 className="text-center text-2xl md:text-4xl font-bold px-4 bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-transparent bg-clip-text py-3">
        All blocked TrxID
      </h2>
      <div>
        <input
          onChange={handleSearch}
          type="text"
          className="border-2 border-gray-400 focus:outline-[#E61C55] px-3 py-1.5 rounded-md mx-auto block w-full md:w-fit"
          placeholder="Search TrxID"
        />
        <div>
          <InfiniteScroll
            dataLength={blockTrxs.length}
            next={getMore}
            hasMore={blockTrxs.length < totalTrx}
            loader={<InfinityLoader />}
          >
            <div className="my-3 flex flex-wrap gap-3 items-center justify-center">
              {blockTrxs?.map((trx) => (
                <BlockTrxCard
                  blockTrxs={blockTrxs}
                  setBlockTrxs={setBlockTrxs}
                  trx={trx}
                  setIsLoading={setIsLoading}
                  key={trx._id}
                />
              ))}
            </div>
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default BlockTrx;
