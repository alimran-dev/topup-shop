import { useState } from "react";
import { uploadImage } from "../../utils/uploadImage";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";

const AddAdvertisement = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [path, setPath] = useState("");
  const axiosPrivate = useAxiosPrivate();

  const handleSubmitAdForm = async (e) => {
    e.preventDefault();
    try {
      const data = await axiosPrivate.post("/ads/post", { imageUrl, path });
      if (data?.status == 200) {
        toast.success("Success");
        e.target.reset();
        setImageUrl("");
      } else {
        toast.error("Something wrong! Try again.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveAds = async () => {
    try {
      const { data } = await axiosPrivate.post("/ads/remove");
      if (data.deletedCount > 0) {
        toast.success("Ads deleted");
      } else {
        toast.error("Something wrong! Try again!");
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div>
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5 py-3">
        Add Advertisement
      </h1>
      <form onSubmit={handleSubmitAdForm}>
        <div className="grid md:grid-cols-2 gap-5 md:w-2/3 mx-auto items-center justify-center">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-xl font-medium text-gray-700"
            >
              Image
            </label>
            <input
              type="file"
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              onChange={async (e) => {
                setLoading(true);
                try {
                  setImageUrl(await uploadImage(e.target.files[0]));
                  setLoading(false);
                } catch (error) {
                  alert(error);
                  setLoading(false);
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="price"
              className="block text-xl font-medium text-gray-700"
            >
              Redirect Path
            </label>
            <input
              type="text"
              required
              className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
              placeholder="Enter redirect path"
              onChange={(e) => setPath(e.target.value)}
            />
          </div>

          <div>
            {loading && <h1>Uploading...</h1>}
            {imageUrl && <img src={imageUrl} />}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !imageUrl}
          className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg my-4 text-white font-semibold rounded block mx-auto"
        >
          Add
        </button>
      </form>
      <button
        type="submit"
        onClick={handleRemoveAds}
        className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg my-4 text-white font-semibold rounded block mx-auto"
      >
        Remove Advertisement
      </button>
    </div>
  );
};

export default AddAdvertisement;
