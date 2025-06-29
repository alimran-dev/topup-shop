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
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    category: "",
    subCategory: "",
  });

  // console.log(orders);

  const [searchTrigger, setSearchTrigger] = useState(0);

  // Initial load and search function
  const loadOrders = (resetPage = false) => {
    const currentPage = resetPage ? 1 : Math.ceil(orders.length / limit + 1);

    axiosPrivate
      .get(`/order/admin/all`, {
        params: {
          page: currentPage,
          limit,
          search: searchEmail,
          fromDate: formData?.fromDate,
          toDate: formData?.toDate,
          category: formData?.category,
          subCategory: formData?.subCategory,
        },
      })
      .then((res) => {
        if (resetPage) {
          setOrders(res.data.orders);
        } else {
          setOrders((prevOrders) => [...prevOrders, ...res.data.orders]);
        }
        setTotalOrders(res.data?.totalOrders);
        setIsLoading(false);
      });
  };

  // Function for FilterOrders component - just trigger a search
  const triggerSearch = () => {
    setOrders([]);
    setSearchTrigger((prev) => prev + 1);
  };
  const fetchMoreData = () => {
    if (totalOrders > orders.length) {
      loadOrders(false);
    }
  };

  // Effect for search by email
  useEffect(() => {
    setOrders([]); // Clear orders when searchEmail changes
    setTimeout(() => loadOrders(true), 0); // Reset to page 1 when searching by email
  }, [searchEmail]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect for search trigger from FilterOrders
  useEffect(() => {
    if (searchTrigger > 0) {
      setTimeout(() => loadOrders(true), 0); // Reset to page 1 when searching
    }
  }, [searchTrigger, formData]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <FilterOrders
        searchEmail={searchEmail}
        setSearchEmail={setSearchEmail}
        setFormData={setFormData}
        triggerSearch={triggerSearch}
        setOrders={setOrders}
      />
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
