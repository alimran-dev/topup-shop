import { useLocation } from 'react-router-dom';


const ViewSummary = () => {

    const { state } = useLocation();

    console.log(state);


    return (
        <div>
            view summary
        </div>
    );
};

export default ViewSummary;