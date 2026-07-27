import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import ServiceCard from "../Home/Services/ServiceCard";
import Loader from "../../components/Loader";

const NestedServices = () => {
  const { parentId } = useParams();
  const [parentService, setParentService] = useState(null);
  const [children, setChildren] = useState([]);
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

        // Fetch category name for breadcrumb
        if (parentData.categoryId) {
          try {
            const catRes = await axiosPublic.get("/category");
            const categories = catRes.data;
            const foundCategory = categories.find(
              (c) => c._id === parentData.categoryId
            );
            if (foundCategory) {
              setCategory(foundCategory);
            }
          } catch {
            // category fetch is optional for display
          }
        }
      } catch (err) {
        console.error("Failed to load nested services:", err);
        setError("Failed to load services. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [axiosPublic, parentId]);

  const handleChildClick = (child) => {
    if (child.childCount > 0) {
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
    <div className="md:py-8 space-y-5 md:space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
        <Link to="/" className="hover:text-[#FA6023] transition-colors">
          Home
        </Link>
        <span>/</span>
        {category && (
          <>
            <span className="text-gray-500">{category.title}</span>
            <span>/</span>
          </>
        )}
        <span className="font-semibold text-gray-800">{parentService?.title}</span>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-center">
        <span className="block border-t-2 border-[#FA6023] flex-1 translate-y-1/2"></span>
        <h1 className="title px-4">{parentService?.title}</h1>
        <span className="block border-t-2 border-[#FA6023] flex-1"></span>
      </div>

      {/* Child Services Grid */}
      {children.length > 0 ? (
        <div className="grid grid-cols-3 md:flex md:flex-wrap justify-center items-stretch gap-2 md:gap-5 my-5">
          {children.map((child) => (
            <div
              className="flex-1 cursor-pointer"
              key={child._id}
              onClick={() => handleChildClick(child)}
            >
              <ServiceCard
                image={child?.image}
                path={`/subCategory/${child._id}`}
                title={child?.title}
              />
            </div>
          ))}
        </div>
      ) : (
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
    </div>
  );
};

export default NestedServices;