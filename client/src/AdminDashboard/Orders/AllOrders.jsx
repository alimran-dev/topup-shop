import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import OrderCard from "./OrderCard";
import InfiniteScroll from "react-infinite-scroll-component";
import InfinityLoader from "../../components/InfinityLoader";
import Loader from "../../components/Loader";
import FilterOrders from "./FilterOrders";


const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchEmail, setSearchEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();
  const limit = 5;
  const page = Math.ceil(orders.length / limit + 1);
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    category: "",
    subCategory: "",
  });


  const getOrders = () => {
    // console.log(formData, "---------from fn");

    axiosPrivate
      .get(`/order/admin/all`, {
        params: {
          page,
          limit,
          search: searchEmail,
          fromDate: formData?.fromDate,
          toDate: formData?.toDate,
          category: formData?.category,
          subCategory: formData?.subCategory,
        },
      })
      .then((res) => {
        // console.log(res.data, "-------res");
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
    setOrders([]);
    console.log(searchEmail,orders.length);

    getOrders();
  }, [searchEmail]);

  // console.log(searchEmail);
  // console.log(formData);
  // console.log(orders, "--------orders");


  // page apear from top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <Loader isLoading={isLoading} />
      <FilterOrders searchEmail={searchEmail} setSearchEmail={setSearchEmail} formData={formData} setFormData={setFormData} getOrders={getOrders} setOrders={setOrders} />
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
