import { Link } from 'react-router-dom';
import sucessIcon from '../../../assets/images/success-icon.png';
import errorIcon from '../../../assets/images/error-icon.png';

const Confirmation = () => {

    const status = true;

    return (
        <div className='flex flex-col items-center py-5'>
            <img src={status ? sucessIcon : errorIcon} className='w-14 md:w-40 h-fit object-contain' alt="success icon" />
            <h3 className={`text-lg md:text-2xl pt-3 pb-6 font-bold`}>
                {status ? 'Payment Completed!' : 'Payment Failed!'}
            </h3>
            <Link to={status ? '/myTransactions' : '/addBalance'} className='button'>
                {status ? 'View Transaction' : 'Try Again'}
            </Link>
        </div>
    );
};

export default Confirmation;