import { useState } from "react";
import { uploadImage } from "../../utils/uploadImage";

const AddAdvertisement = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [path, setPath] = useState("");

  const handleSubmitAdForm = async (e) => {
    e.preventDefault();
    console.log({ imageUrl, path });
  };
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
                setImageUrl(await uploadImage(e.target.files[0]));
                setLoading(false);
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
            {loading && <h1>Uploading..</h1>}
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
    </div>
  );
};

export default AddAdvertisement;
