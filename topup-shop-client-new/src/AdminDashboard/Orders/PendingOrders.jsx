import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import OrderCard from "./OrderCard";
import InfiniteScroll from "react-infinite-scroll-component";
import InfinityLoader from "../../components/InfinityLoader";
import Loader from "../../components/Loader";

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();
  const limit = 5;
  const page = Math.ceil(orders.length / limit + 1);

  const getOrders = () => {
    axiosPrivate
      .get(`/order/admin/pending?page=${page}&limit=${limit}`)
      .then((res) => {
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
  useEffect(() => {
    getOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <Loader isLoading={isLoading} />
      {orders.length <= 0 ? (
        <div className="h-[40vh] w-full flex items-center justify-center">
          <p className="text-4xl font-semibold text-center">
            No Pending Orders Now
          </p>
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
        <div className="space-y-2">
          {orders.map((order) => (
            <OrderCard
              order={order}
              orders={orders}
              setOrders={setOrders}
              fromPending={true}
              setTotalOrders={setTotalOrders}
              totalOrders={totalOrders}
              key={order._id}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default PendingOrders;
