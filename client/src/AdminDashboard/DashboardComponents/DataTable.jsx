import PropTypes from "prop-types";

const DataTable = ({title, thead, data, category, total}) => {
  return (
    <div>
          <h2 className="bg-gradient-to-r from-primary to-secondary w-fit text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent text-center py-3 mx-auto px-2 md:px-5 capitalize">
            {title}
          </h2>
          <table className="w-full my-3">
            <thead>
              <tr className="text-center">
                <th className="border-2 border-primary w-1/2 py-1.5 border-collapse">
                  {thead?.first}
                </th>
                <th className="border-2 border-primary w-1/2 py-1.5 border-collapse">
                  {thead?.second}
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item, idx) => {
                // if (category!=="auto" && item.codes) {
                  return (
                    <tr className="text-center" key={idx}>
                      <td className="border-2 border-primary w-1/2 font-medium py-1.5 border-collapse">
                        {category==="unipins" && `${item?.uc} UC`}
                        {(category==="shells" || category==="auto") && `${item?.name}`}
                      </td>
                      <td className="border-2 border-primary w-1/2 font-medium py-1.5 border-collapse">
                        {(category==="unipins" || category==="shells") && `${item.codes}`}
                        {category==="auto" && `${item?.count}`}
                      </td>
                    </tr>
                  );
                // }
              })}
              <tr className="text-center">
                <td className="border-2 border-primary w-1/2 font-bold py-1.5 border-collapse">
                  Total
                </td>
                <td className="border-2 border-primary w-1/2 font-bold py-1.5 border-collapse">
                  {(category==="unipins" || category==="shells") && data?.reduce((acc, item) => {
                    return acc + item.codes;
                  }, 0)}
                  {category==="auto" && total}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
  );
};

export default DataTable;

DataTable.propTypes = {
  title: PropTypes.string,
  thead: PropTypes.shape({
    first: PropTypes.string,
    second: PropTypes.string
  }),
  data: PropTypes.array,
  category: PropTypes.string,
  total: PropTypes.number
}