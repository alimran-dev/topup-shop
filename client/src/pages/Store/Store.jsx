import { BsCoin } from "react-icons/bs";


const Store = () => {
    const products = [
        { id: 1, name: "Product 1", description: "Limited-time discount on coins!", price: 100, stock: 10 },
        { id: 2, name: "Product 2", description: "Exclusive token deal!", price: 200, stock: 0 },
        { id: 3, name: "Product 3", description: "Special bonus for premium users!", price: 150, stock: 10 },
    ];

    return (
        <div className="py-10 px-6 max-w-5xl mx-auto">
            <h2 className="title">Store</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md p-6 text-center border border-gray-200">
                        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                        <p className="text-gray-500 mb-4 text-sm">{product.description}</p>
                        <p className="text-xl font-bold text-blue-600 flex justify-center items-center gap-1">
                            <BsCoin />
                            {product.price}
                            </p>
                        <p className={`text-sm font-semibold mt-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </p>
                        <button 
                            className={`mt-4 px-4 button ${!product.stock > 0 && '!bg-gray-400 cursor-not-allowed'}`} 
                            disabled={product.stock === 0}
                        >
                            Redeem Now
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Store;
