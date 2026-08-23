import PropTypes from "prop-types";

const SelectCompanies = ({ companies, setSelectedCompany, setNext }) => {
  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setNext("category");
  };
  return (
    <div>
      <h2 className="bg-gradient-to-r from-primary to-secondary w-fit text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent text-center py-3 mx-auto px-2 md:px-5 capitalize">
        Select Operator
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {companies.map((company) => (
          <div
            key={company._id}
            onClick={() => handleSelectCompany(company)}
            className="border-2 border-b-2 border-b-primary rounded-lg h-full w-full cursor-pointer mx-auto flex flex-col"
          >
            <img
              src={company.logo}
              alt=""
              className="w-full h-16 md:h-20 rounded-t transition ease-in-out duration-300 hover:scale-90 p-4"
            />
            <div className="rounded-md flex items-center justify-center flex-1 border-t-2">
              <h2 className="text-xs lg:text-base font-semibold text-center py-3 px-3 md:px-1">
                {company.name}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectCompanies;

SelectCompanies.propTypes = {
  companies: PropTypes.array.isRequired,
  setSelectedCompany: PropTypes.func.isRequired,
  setNext: PropTypes.func.isRequired,
};
