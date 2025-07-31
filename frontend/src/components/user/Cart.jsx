import { useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { Link } from 'react-router-dom';
import { Trash2, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';
import { ShoppingCart, Image } from 'lucide-react';

const Cart = () => {
  const {
    cart,
    cartLoading,
    cartError,
    cartMessage,
    cartTotal,
    cartItemCount,
    fetchCart,
  
    removeItemFromCart,
    clearCartError,
    clearCartMessage
  } = useUser();
  
  useEffect(() => {
    if (!cart.length) {
      fetchCart();
    }
  }, [fetchCart, cart]);

  useEffect(() => {
    if (cartError) {
      toast.error(cartError);
      clearCartError();
    }
  }, [cartError, clearCartError]);

  useEffect(() => {
    if (cartMessage) {
      toast.success(cartMessage);
      clearCartMessage();
    }
  }, [cartMessage, clearCartMessage]);

  
  const handleRemoveItem = async (shopName, serviceId) => {
    try {
      
      await removeItemFromCart({ shopName, serviceId }).unwrap();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error || 'Failed to remove item');
    }
  };

  

  if (cartLoading && !cart) {
    return <LoadingSpinner />;
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
            
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h3>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added any services to your cart yet.
          </p>
          <Link
            to="/"
            className="btn btn-primary bg-pink-500 hover:bg-pink-600 text-white"
          >
            Browse Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 md:ml-64 pt-2 pb-4 px-2 sm:px-6 lg:px-8 mb-6 sm:mb-0">
      <div className="flex flex-col lg:flex-row gap-8 w-full">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Your Cart ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'})
              </h2>
            </div>

            {cart.map((shop) => (
              
              <div key={shop._id} className="border-b border-gray-200 last:border-b-0">
                <div className="p-4 bg-gray-50">
                  <Link
                    to={`/salon/${shop.shopName}`}
                    className="text-lg font-medium text-pink-600 hover:text-pink-700"
                  >
                    {shop.shopName}
                  </Link>
                </div>

                {shop.services.map((service) => (
                  <div
                    key={`${service._id}`} // ${service.shopId}-
                    className="p-4 flex items-start border-b border-gray-200 hover:bg-purple-50 last:border-b-0"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      {service?.image ? (
                        <img
                          src={service?.image}
                          alt={service?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                          <Image className='h-6 w-6'/>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-md font-medium text-gray-800">
                            {service?.name || 'Service'}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {service?.duration || '--'} mins
                          </p>
                        </div>

                        <div className="flex flex-col items-end space-y-1">
                          <p className="text-md font-medium text-gray-800">
                            ₹{(service?.price || 0).toFixed(2)}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(shop?.shopName, service?.service_id)}
                            className="text-red-500 bg-red-100 px-2 py-1 rounded hover:text-red-700 hover:bg-red-200 flex items-center"
                          >
                            <Trash2 size={14} className="mr-1" />
                            <span className="text-sm">Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-2/3 pb-5">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
            </div>

            <div className="p-4">
              <div className="flex justify-between mb-2 text-gray-600">
                <span >Subtotal</span>
                <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-600">
                <span >Tax</span>
                <span className="font-medium">₹0.00</span>
              </div>
              <div className="flex justify-between mb-4  text-gray-600">
                <span >Service Fee</span>
                <span className='font-medium'>₹0.00</span>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-semibold text-pink-600">
                    ₹{cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="w-full flex items-center justify-between mt-4">
                <Link
                  to="/cart"
                  className="btn btn-primary border-0 bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center px-4 py-2 rounded"
                >
                  Proceed to Checkout
                  <ChevronRight size={18} className="ml-1" />
                </Link>

                <Link
                  to="/"
                  className="btn btn-primary border-0 border-purple-00 bg-purple-200 text-purple-600 hover:bg-purple-900 hover:text-white  flex items-center justify-center px-4 py-2 rounded"
                >
                  Continue Shopping
                  <ChevronRight size={18} className="ml-1" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;