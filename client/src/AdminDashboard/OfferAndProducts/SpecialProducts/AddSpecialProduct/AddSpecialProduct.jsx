import { useState } from "react";



const AddSpecialProduct = () => {
    const [loading, setLoading] = useState(false);


    // add offer fn
    const handleAddSpecialProduct = async (e) => {

        e.preventDefault();
        setLoading(true);
        
        const title = e.target.title.value;
        const stock = e.target.stock.value;
        const price = e.target.price.value;
        const type = e.target.type.value;
        const shortDescription = e.target.shortDescription.value;

        const offerData = { title, stock, price, type, shortDescription };

        console.log("Offer Data:", offerData);

    };

    return (
        <div>
            <h2 className="title">Add New Offer</h2>
            <div className="pt-5 max-w-3xl mx-auto">
                <form onSubmit={handleAddSpecialProduct}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="input-label">Title</label>
                            <input type="text" name="title" className="input" placeholder="Type title" required />
                        </div>
                        <div>
                            <label className="input-label">Stock</label>
                            <input type="number" name="stock" className="input" placeholder="Type stock" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 my-5">
                        <div>
                            <label className="input-label">Price</label>
                            <input type="number" name="price" className="input" placeholder="Type price" required />
                        </div>
                        <div>
                            <label className="input-label">Type</label>
                            <select name="type" className="input" defaultValue={""} required>
                                <option value="" disabled>Choose One</option>
                                <option value="taka">Taka</option>
                                <option value="coin">Coin</option>
                            </select>
                        </div>
                    </div>

                    {/* textarea / description */}
                    <div>
                        <label className="input-label">Short Description</label>
                        <textarea name="shortDescription" className="input h-20" placeholder="Type description" required></textarea>
                    </div>
                    <button className="button mt-6 mx-auto flex" disabled={loading}>
                        {loading ? "Please Wait..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddSpecialProduct;