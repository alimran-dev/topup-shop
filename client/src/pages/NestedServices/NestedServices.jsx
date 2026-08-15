import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import ServiceCard from "../Home/Services/ServiceCard";
import Loader from "../../components/Loader";
import InfinityLoader from "../../components/InfinityLoader";
import NoticeView from "../Home/Notice/NoticeView";
import Pagination from "../../components/reusuable/Pagination/Pagination";
import ItemCard from "./ItemCard";
import ItemFilters from "./ItemFilters";

const ITEMS_LIMIT = 20;

const NestedServices = () => {
  const { parentId } = useParams();
  const [parentService, setParentService] = useState(null);
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isNoticeOpen, setIsNoticeOpen] = useState(true);
  // item listing state
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState(false);
  const [bounds, setBounds] = useState(null);
  const [sort, setSort] = useState("default");
  const [appliedFilters, setAppliedFilters] = useState({});
  // recently sold showcase (independent paging)
  const [soldItems, setSoldItems] = useState([]);
  const [soldTotal, setSoldTotal] = useState(0);
  const [soldPage, setSoldPage] = useState(1);
  const [soldLoading, setSoldLoading] = useState(false);
  const requestRef = useRef(0);
  const soldRequestRef = useRef(0);
  const listTopRef = useRef(null);
  const soldTopRef = useRef(null);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  const isItemListing = parentService?.serviceType === "itemListing";
  // page sizes are configured per service by the admin
  const itemsPerPage = parentService?.itemsPerPage > 0 ? parentService.itemsPerPage : ITEMS_LIMIT;
  const soldPerPage = parentService?.soldPerPage > 0 ? parentService.soldPerPage : ITEMS_LIMIT;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const soldTotalPages = Math.ceil(soldTotal / soldPerPage);

  // This route re-uses the same component when navigating between services, so
  // scroll position and any previous service's sort/filters must be reset —
  // stat ranges mean different things under a different service's statLabels.
  useEffect(() => {
    window.scrollTo(0, 0);
    setSort("default");
    setAppliedFilters({});
    setBounds(null);
    setPage(1);
    setSoldPage(1);
  }, [parentId]);

  // Changing the sort or filters must send the user back to page 1, otherwise
  // they could land on a page number that no longer exists in the new result set.
  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
  };
  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    setPage(1);
  };
  const handleResetFilters = () => {
    setAppliedFilters({});
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    listTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handleSoldPageChange = (nextPage) => {
    setSoldPage(nextPage);
    soldTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Fetch parent service details
        const parentRes = await axiosPublic.get(
          `/services/get?id=${parentId}`
        );
        const parentData = parentRes.data;

        if (!parentData || !parentData._id) {
          setError("Service not found");
          setIsLoading(false);
          return;
        }

        setParentService(parentData);

        // Fetch children
        const childrenRes = await axiosPublic.get(
          `/services/children?parentId=${parentId}`
        );
        setChildren(childrenRes.data);
      } catch (err) {
        console.error("Failed to load nested services:", err);
        setError("Failed to load services. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [axiosPublic, parentId]);

  // Build the query string for the listing browse endpoint
  const buildItemQuery = useCallback(
    (page) => {
      const params = new URLSearchParams();
      params.set("serviceId", parentId);
      params.set("page", page);
      params.set("limit", itemsPerPage);
      params.set("sort", sort);
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          params.set(key, value);
        }
      });
      return params.toString();
    },
    [parentId, sort, appliedFilters, itemsPerPage]
  );

  // Load filter bounds once the service is known to be an item listing
  useEffect(() => {
    if (!isItemListing) return;
    axiosPublic
      .get(`/serviceItems/filters?serviceId=${parentId}`)
      .then((res) => setBounds(res.data))
      .catch(() => setBounds(null));
  }, [axiosPublic, parentId, isItemListing]);

  // Load the requested page whenever the service, sort, filters or page change.
  // requestRef identifies the current query so a superseded in-flight response
  // (e.g. the previous sort landing late) is discarded rather than rendered.
  useEffect(() => {
    if (!isItemListing) return;
    const requestId = ++requestRef.current;
    setItemsLoading(true);
    setItemsError(false);
    axiosPublic
      .get(`/serviceItems?${buildItemQuery(page)}`)
      .then((res) => {
        if (requestId !== requestRef.current) return;
        setItems(res.data?.items || []);
        setTotalItems(res.data?.totalItems || 0);
      })
      .catch(() => {
        if (requestId !== requestRef.current) return;
        setItems([]);
        setTotalItems(0);
        setItemsError(true);
      })
      .finally(() => {
        if (requestId !== requestRef.current) return;
        setItemsLoading(false);
      });
  }, [axiosPublic, isItemListing, buildItemQuery, page]);

  // Recently sold showcase — always most-recent-first, independent of the
  // sort/filter controls above it.
  useEffect(() => {
    if (!isItemListing) return;
    const requestId = ++soldRequestRef.current;
    setSoldLoading(true);
    axiosPublic
      .get(
        `/serviceItems?serviceId=${parentId}&sold=true&page=${soldPage}&limit=${soldPerPage}`
      )
      .then((res) => {
        if (requestId !== soldRequestRef.current) return;
        setSoldItems(res.data?.items || []);
        setSoldTotal(res.data?.totalItems || 0);
      })
      .catch(() => {
        if (requestId !== soldRequestRef.current) return;
        setSoldItems([]);
        setSoldTotal(0);
      })
      .finally(() => {
        if (requestId !== soldRequestRef.current) return;
        setSoldLoading(false);
      });
  }, [axiosPublic, isItemListing, parentId, soldPage, soldPerPage]);

  // If the last item on the final page is bought while the user is on it, the
  // page can fall out of range — step back instead of showing an empty grid.
  useEffect(() => {
    if (totalItems > 0 && page > Math.ceil(totalItems / itemsPerPage)) {
      setPage(Math.ceil(totalItems / itemsPerPage));
    }
  }, [totalItems, page, itemsPerPage]);

  const handleChildClick = (child) => {
    if (child?.redirectUrl) {
      if (child.redirectUrl.startsWith("http")) {
        window.location.href = child.redirectUrl;
      } else {
        navigate(child.redirectUrl);
      }
      return;
    }
    if (child.serviceType === "itemListing" || child.childCount > 0) {
      navigate(`/nested-services/${child._id}`);
    } else {
      navigate(`/subCategory/${child._id}`);
    }
  };

  if (isLoading) {
    return <Loader isLoading={true} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 text-xl font-semibold">{error}</p>
        <Link
          to="/"
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Go back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="md:py-8 space-y-2 md:space-y-5">
      {/* Section Title */}
      <div className="flex items-center justify-center">
        <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
        <h1 className="title px-4">{parentService?.title}</h1>
        <span className="block border-t-2 border-[#FA6023] flex-1"></span>
      </div>

      {/* Notice Banner */}
      {parentService?.notice && parentService.notice.trim().length > 0 && (
        <div className="-my-2 md:-my-2">
          <NoticeView
            isOpen={isNoticeOpen}
            notice={parentService.notice}
            setIsOpen={setIsNoticeOpen}
            title="Notice"
          />
        </div>
      )}

      {/* Child Services Grid — the click is handled by ServiceCard only; a
          handler on the wrapper too would fire twice and push two history entries */}
      {children.length > 0 && (
        <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
          {children.map((child) => (
            <div className="flex-1 cursor-pointer" key={child._id}>
              <ServiceCard
                image={child?.image}
                path={`/subCategory/${child._id}`}
                title={child?.title}
                onClick={() => handleChildClick(child)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Item Listing (sort + filter + product cards) */}
      {isItemListing && (
        <div ref={listTopRef} className="space-y-3 my-5 scroll-mt-4">
          {/* keyed on the service so the filter draft resets between services */}
          <ItemFilters
            key={parentId}
            statLabels={parentService?.statLabels}
            bounds={bounds}
            sort={sort}
            setSort={handleSortChange}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />

          {itemsLoading ? (
            <div className="py-10">
              <InfinityLoader />
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {items.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    statLabels={parentService?.statLabels}
                  />
                ))}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : itemsError ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg">Could not load items.</p>
              <button
                onClick={() => setAppliedFilters((prev) => ({ ...prev }))}
                className="mt-2 text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg">
                {Object.values(appliedFilters).some(
                  (v) => v !== "" && v !== undefined && v !== null
                )
                  ? "No items match your filters."
                  : "No items available right now."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recently sold showcase */}
      {isItemListing && soldTotal > 0 && (
        <div ref={soldTopRef} className="space-y-3 my-5 scroll-mt-4">
          <div className="flex items-center justify-center">
            <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
            <h2 className="title px-4">Recently Sold</h2>
            <span className="block border-t-2 border-[#FA6023] flex-1"></span>
          </div>

          {soldLoading ? (
            <div className="py-10">
              <InfinityLoader />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {soldItems.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    statLabels={parentService?.statLabels}
                    isSold
                  />
                ))}
              </div>
              <Pagination
                currentPage={soldPage}
                totalPages={soldTotalPages}
                onPageChange={handleSoldPageChange}
              />
            </>
          )}
        </div>
      )}

      {/* Nothing to show at all */}
      {children.length === 0 && !isItemListing && (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg">No sub-services found under this service.</p>
          <Link
            to="/"
            className="mt-2 inline-block text-blue-600 hover:underline"
          >
            ← Go back to Home
          </Link>
        </div>
      )}

      {/* Description Section */}
      {parentService?.description && parentService.description.length > 0 && (
        <div className="border rounded-md p-3 md:p-6">
          <div
            dangerouslySetInnerHTML={{ __html: parentService.description }}
            className="rich-text-output"
          />
        </div>
      )}
    </div>
  );
};

export default NestedServices;