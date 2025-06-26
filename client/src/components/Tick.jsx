const Tick = () => {
  return (
    <span className={`bg-gray-400 rounded-full w-3 h-3 p-[7px] relative`}>
      <span className="inline-block absolute w-1 h-2 border-r-2 border-b-2 rotate-45 left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/3"></span>
    </span>
  );
};

export default Tick;