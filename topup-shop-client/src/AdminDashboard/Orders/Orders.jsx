const Orders = () => {
  return (
    <div className="-mt-5">
      <h1 className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center mx-auto px-2 md:px-5">
        All Orders
      </h1>
      <div className="w-full border mt-5 overflow-auto">
        <thead className="block text-center min-w-[650px]">
          <tr className="grid grid-cols-6 w-full">
            <th className="border py-1.5 px-2">Order ID</th>
            <th className="border py-1.5 px-2">Email</th>
            <th className="border py-1.5 px-2">Type</th>
            <th className="border py-1.5 px-2">Option Name</th>
            {/* <th className="border py-1.5">Price</th> */}
            <th className="border py-1.5 px-2">UID</th>
            <th className="border py-1.5 px-2">Status</th>
          </tr>
        </thead>
        <tbody className="block text-center min-w-[650px]">
          <tr className="grid grid-cols-6 w-full">
            <td className="border py-1.5 px-2 overflow-auto">01</td>
            <td className="border py-1.5 px-2 overflow-auto">alimran@gmail.com</td>
            <td className="border py-1.5 px-2 overflow-auto">IdCode</td>
            <td className="border py-1.5 px-2 overflow-auto">20 UC</td>
            <td className="border py-1.5 px-2 overflow-auto">15411</td>
            <td className="border py-1.5 px-2 overflow-auto">Completed</td>
          </tr>
        </tbody>
      </div>
    </div>
  );
};

export default Orders;
