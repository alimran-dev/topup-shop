import { useEffect, useRef, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import Swal from "sweetalert2";

const UpdateDelete = () => {
  const [option, setOption] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [stock, setStock] = useState(null);
  const [subTypes, setSubTypes] = useState([]);
  const [subPrices, setSubPrices] = useState({}); // [typeId] = "" | value-string
  const axiosPrivate = useAxiosPrivate();
  const { category, id } = useParams();
  const navigate = useNavigate();
  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const descriptionRef = useRef(null);
  const stockRef = useRef(null);
  const coinRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    axiosPrivate
      .get("/subscription/admin/types")
      .then((res) => setSubTypes(res.data || []))
      .catch(() => {});
  }, [axiosPrivate]);


  const handleUpdate = () => {
    if (nameRef.current && priceRef.current) {
      setIsLoading(true);
      const name = nameRef.current?.value;
      const price = priceRef.current?.value;
      const description = descriptionRef.current?.value;
      const stock = stockRef.current?.value;
      const coin = coinRef.current?.value;


      const updatedOption = { id, category: `${category === "cards" ? "recharge" : category}`, name, price, description, coin, ...(option?.subCategory === "offer" && { type: "offer", stock }) };
      if (category === "cards") {
        const subscriberPrices = {};
        for (const t of subTypes) {
          const val = subPrices[t._id];
          if (val !== undefined && val !== "") {
            subscriberPrices[t._id] = Number(val);
          }
        }
        updatedOption.subscriberPrices = subscriberPrices;
      }

      console.log(updatedOption);
      axiosPrivate.patch("/option/admin/update", updatedOption).then((res) => {
        setIsLoading(false);
        // console.log(res.data);

        if (res.data?.modifiedCount > 0) {
          Swal.fire({
            title: "Option Updated",
            timer: 1500,
            position: "top",
            showConfirmButton: false,
            toast: true,
            icon: "success",
          });
        }
      });
    }
  };


  const handleDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "rgb(var(--theme-secondary))",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate
          .delete(`/option/admin/delete?id=${id}&category=${category === "cards" ? "recharge" : category}`)
          .then((res) => {
            // console.log(res.data);
            if (res.data?.deletedCount > 0) {
              navigate(-1);
              Swal.fire({
                title: "Deleted!",
                text: "This option has been deleted.",
                icon: "success",
              });
            }
          });
      }
    });
  };


  const handleStock = () => {
    Swal.fire({
      title: `${stock ? "Stock Out?" : "In Stock?"}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "rgb(var(--theme-secondary))",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        axiosPrivate
          .patch("/option/admin/stock", { id, category, stock: !stock })
          .then((res) => {
            if (res.data?.modifiedCount > 0) {
              setStock(!stock);
              setIsLoading(false);
              Swal.fire({
                title: "Stock updated",
                position: "top",
                timer: 1500,
                showConfirmButton: false,
                toast: true,
                icon: "success",
              });
            }
          });
      }
    });
  };

  useEffect(() => {
    axiosPrivate
      .get(
        `/option?category=${category === "cards" ? "recharge" : category
        }&id=${id}&docName=${location.state?.docName}`
      )
      .then((res) => {
        setIsLoading(false);
        setOption(res.data);
        setStock(res.data?.stock);
        setSubPrices(
          Object.fromEntries(
            Object.entries(res.data?.subscriberPrices || {}).map(([k, v]) => [
              k,
              String(v),
            ])
          )
        );
      });
  }, [axiosPrivate, category, id, location.state?.docName]);


  console.log(option, "api");


  return (
    <div className="-mt-5">
      <Loader isLoading={isLoading} />
      <h1 className="bg-gradient-to-r from-primary to-secondary w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-4">
        Update or Delete [{category}]
      </h1>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-5 mt-5">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-xl font-medium text-gray-700"
          >
            Option Name
          </label>
          <input
            type="text"
            name="name"
            ref={nameRef}
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
            placeholder="Example: 20 UC"
            defaultValue={option?.name}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="price"
            className="block text-xl font-medium text-gray-700"
          >
            Option Price
          </label>
          <input
            type="text"
            name="price"
            ref={priceRef}
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
            placeholder="Example: 50"
            defaultValue={option?.price}
          />
        </div>
        {category === "cards" ? (
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-xl font-medium text-gray-700"
            >
              Option Description
            </label>
            <input
              type="text"
              name="description"
              ref={descriptionRef}
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="Example: Here will be description..."
              defaultValue={option?.description}
            />
          </div>
        ) : (
          <></>
        )}
        {
          option?.subCategory == "offer" &&
          <>
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-xl font-medium text-gray-700"
              >
                Stock
              </label>
              <input
                type="number"
                name="stock"
                className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
                ref={stockRef}
                placeholder="Example: 0"
                defaultValue={option?.stock}
              />
            </div>
          </>
        }

        <div className="space-y-2">
          <label
            htmlFor="coin"
            className="block text-xl font-medium text-gray-700"
          >
            Coin
          </label>
          <input
            type="number"
            name="coin"
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
            ref={coinRef}
            placeholder="Example: 0"
            defaultValue={option?.coin}
          />
        </div>
        {category === "cards" && subTypes.length > 0 && (
          <div className="md:col-span-3 space-y-2">
            <label className="block text-xl font-medium text-gray-700">
              Subscriber Prices (৳){" "}
              <span className="text-sm font-normal text-gray-500">
                — blank = normal price
              </span>
            </label>
            <div className="flex flex-wrap gap-4">
              {subTypes.map((t) => (
                <div key={t._id} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600">
                    {t.name}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="block w-40 py-1.5 px-3 font-medium border-2 border-gray-600 rounded-md"
                    placeholder="Normal price"
                    value={subPrices[t._id] ?? ""}
                    onChange={(e) =>
                      setSubPrices((prev) => ({
                        ...prev,
                        [t._id]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-5 w-fit mt-3 mx-auto">
        <button
          onClick={handleDelete}
          className="text-lg font-semibold bg-red-600 py-1.5 px-3 text-white rounded"
        >
          Delete
        </button>
        {category === "idcode" ||
          category === "weekly-monthly" ||
          category === "airdrop" ||
          category === "lessIsMore" ? (
          <>
            {stock ? (
              <button
                onClick={handleStock}
                className="text-lg font-semibold bg-red-600 py-1.5 px-3 text-white rounded"
              >
                Stock Out
              </button>
            ) : (
              <button
                onClick={handleStock}
                className="text-lg font-semibold bg-green-600 py-1.5 px-3 text-white rounded"
              >
                In Stock
              </button>
            )}
          </>
        ) : (
          <></>
        )}
        <button
          onClick={handleUpdate}
          className="bg-gradient-to-r from-primary to-secondary py-1.5 px-5 text-lg text-white font-semibold rounded"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default UpdateDelete;
