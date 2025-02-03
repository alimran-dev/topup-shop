

const ArchivedUnipins = () => {

    const handleOnChange = (e) => {
        console.log('Input Value:', e.target.value);
    };


    return (
        <div>
            <h2 className="title">Archived Unipins</h2>
            <form className="max-w-xl mx-auto">
                <label htmlFor="" className="input-label">Search By Unipin</label>
                <input type="text"  onChange={handleOnChange} className="input" placeholder="Type Unipin" />
            </form>
        </div>
    );
};

export default ArchivedUnipins; 