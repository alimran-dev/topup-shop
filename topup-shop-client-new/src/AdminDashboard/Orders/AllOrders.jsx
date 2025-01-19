import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import OrderCard from "./OrderCard";
import InfiniteScroll from "react-infinite-scroll-component";
import InfinityLoader from "../../components/InfinityLoader";
import Loader from "../../components/Loader";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const limit = 5;
  const page = Math.ceil(orders.length / limit + 1);

  const getOrders = () => {
    axiosPrivate
      .get(`/order/admin/all?page=${page}&limit=${limit}&search=${search}`)
      .then((res) => {
        // console.log(res.data);
        setOrders([...orders, ...res.data.orders]);
        setTotalOrders(res.data?.totalOrders);
        setIsLoading(false);
      });
  };
  const fetchMoreData = () => {
    if (totalOrders > orders.length) {
      getOrders();
    }
  };
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setOrders([]);
  };
  useEffect(() => {
    getOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  

  return (
    <div>
      <Loader isLoading={isLoading} />
      <div>
        <input
          onChange={handleSearch}
          type="text"
          className="border border-gray-400 w-80 block mx-auto my-3 py-1.5 px-3 rounded text-center"
          placeholder="User's Email"
        />
      </div>
      {orders.length <= 0 ? (
        <div className="h-[40vh] w-full flex items-center justify-center">
          <p className="text-4xl font-semibold">No Orders yet</p>
        </div>
      ) : (
        <></>
      )}
      <InfiniteScroll
        dataLength={orders.length}
        hasMore={orders.length < totalOrders}
        next={fetchMoreData}
        loader={<InfinityLoader />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {orders.map((order) => (
            <OrderCard
              order={order}
              orders={orders}
              setOrders={setOrders}
              fromPending={false}
              totalOrders={totalOrders}
              setTotalOrders={setTotalOrders}
              key={order._id}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default AllOrders;
