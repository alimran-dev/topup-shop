import { useEffect, useState } from "react";
import "./MyOrders.css";
import OrderHistory from "./OrderHistory";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import InfinityLoader from "../../components/InfinityLoader";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalOrder, setTotalOrder] = useState(0);
  const axiosPrivate = useAxiosPrivate();
  const { user, loading } = useAuth();
  const limit = 5;
  const page = Math.ceil(orders.length / limit + 1);

  const getOrders = () => {
    if (!loading) {
      axiosPrivate
        .get(`/orders?email=${user?.email}&page=${page}&limit=${limit}`)
        .then((res) => {
          setOrders([...orders, ...res.data.orders]);
          setTotalOrder(res.data.total);
          setIsLoading(false);
        });
    }
  };
  const getMoreOrders = () => {
    if (orders.length < totalOrder) {
      getOrders();
    }
  };
  useEffect(() => {
    window.scrollTo(0, 0);
    getOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axiosPrivate, loading, user?.email, limit]);
  console.log(orders);
  return (
    <div>
      <Loader isLoading={isLoading} />
      <div className="w-fit mx-auto">
        <h2 className={`order-tab-border`}>
          <span className={`order-active-tab`}>Order History</span>
        </h2>
      </div>
      <div className="my-8">
        <InfiniteScroll
          dataLength={orders.length}
          next={getMoreOrders}
          hasMore={orders.length < totalOrder}
          loader={<InfinityLoader />}
        >
          <div className="space-y-4">
            {orders.length > 0 &&
              orders.map((order, idx) => (
                <OrderHistory order={order} key={idx} />
              ))}
          </div>
        </InfiniteScroll>
        {orders.length > 0 || (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2">
            <span className="text-3xl font-medium">No Order Data</span>
            <Link
              to={"/topup"}
              className="border-2 border-[#FA6023] px-4 py-0.5 rounded font-bold bg-gradient-to-r from-[#FA6023] to-[#E61C55] bg-clip-text text-transparent"
            >
              Order
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
