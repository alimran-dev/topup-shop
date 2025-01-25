import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import sucessIcon from '../../../assets/images/success-icon.png';
import errorIcon from '../../../assets/images/error-icon.png';
import { useEffect } from 'react';

const Confirmation = () => {

    const [searchParams] = useSearchParams();
    const status = searchParams.get('status');
    const navigate = useNavigate();

    
    useEffect(() => {
        const validStatuses = ['success', 'cancel', 'failure'];
        if (!status || !validStatuses.includes(status)) {
            navigate('/');
        }
    }, [status, navigate]);


    return (
        <div className='flex flex-col items-center py-5'>
            <img src={status == 'success' ? sucessIcon : errorIcon} className='w-14 md:w-40 h-fit object-contain' alt="success icon" />
            <h3 className={`text-lg md:text-2xl pt-3 pb-6 font-bold`}>
                {status == 'success' && 'Payment Completed!'}
                {status == 'cancel' && 'Payment Cenceled!'}
                {status == 'failure' && 'Payment Failed!'}
            </h3>
            <Link to={status ? '/myTransactions' : '/addBalance'} className='button'>
                {status == 'success' ? 'View Transaction' : 'Try Again'}
            </Link>
        </div>
    );
};

export default Confirmation;