const UpdateDelete = () => {
  return (
    <div className="-mt-5">
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5">
        Update or Delete
      </h1>
      <div className="flex flex-col md:flex-row w-2/3 mx-auto justify-center items-center gap-5 mt-5">
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
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
            placeholder="Example: 20 UC"
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
            className="block w-full py-1.5 px-3 font-medium text-lg border-2 border-gray-600 rounded-md"
            placeholder="Example: 50"
          />
        </div>
      </div>
      <div className="block w-fit space-x-5 mt-3 mx-auto">
        <button className="text-lg font-semibold bg-red-600 py-1.5 px-3 text-white rounded">
          Delete
        </button>
        <button className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded">
          Update
        </button>
      </div>
    </div>
  );
};

export default UpdateDelete;
