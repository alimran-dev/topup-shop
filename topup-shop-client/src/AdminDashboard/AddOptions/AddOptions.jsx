const AddOptions = () => {
  return (
    <div className="-mt-5 space-y-5">
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5">
        Add Options
      </h1>
      <div className="flex flex-col md:flex-row gap-5 md:w-2/3 mx-auto items-center justify-center">
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
        <div className="space-y-2">
          <label
            htmlFor="category"
            className="block text-xl font-medium text-gray-700"
          >
            Choose Category
          </label>
          <select
            name="category"
            id=""
            className="py-1.5 px-3 w-full border-2 border-gray-600 rounded-md block font-medium"
          >
            <option
              value=""
              className="bg-white hover:bg-red-500 focus:bg-red-500"
            >
              Unipin
            </option>
            <option
              value=""
              className="bg-white hover:bg-red-500 focus:bg-red-500"
            >
              IdCode
            </option>
            <option
              value=""
              className="bg-white hover:bg-red-500 focus:bg-red-500"
            >
              Weekly
            </option>
            <option
              value=""
              className="bg-white hover:bg-red-500 focus:bg-red-500"
            >
              Shell
            </option>
          </select>
        </div>
      </div>
      <button className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] py-1.5 px-5 text-lg text-white font-semibold rounded block mx-auto">
        Add
      </button>
    </div>
  );
};

export default AddOptions;
