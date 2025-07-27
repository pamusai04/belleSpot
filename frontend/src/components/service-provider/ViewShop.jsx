import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchShop, updateShop, clearError } from '../../redux/slices/shopSlice';
import { Clock, Star, Eye } from 'lucide-react';

const ViewShop = () => {
  const dispatch = useDispatch();
  const { shop, loading, error, shopDataFetched } = useSelector((state) => state.shop);
  const [status, setStatus] = useState({
    isOpen: true,
    override: false,
    closureReason: null,
    lastUpdated: new Date().toISOString(),
  });

  const closureReasons = [
    { value: null, label: 'Select a reason' },
    { value: 'Holiday', label: 'Holiday' },
    { value: 'Emergency', label: 'Emergency' },
    { value: 'Maintenance', label: 'Maintenance' },
    { value: 'Other', label: 'Other' },
  ];

  // Fetch shop only if not already fetched
  const fetchShopData = useCallback(() => {
    if (!shopDataFetched && !shop) {
      dispatch(fetchShop());
    }
  }, [dispatch, shopDataFetched, shop]);

  useEffect(() => {
    fetchShopData();
  }, [fetchShopData]);
  useEffect(() => {
    if (shop?.realTimeStatus) {
      setStatus({
        ...shop.realTimeStatus,
        lastUpdated: new Date().toISOString(),
      });
    }
  }, [shop]);

  const handleStatusUpdate = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const result = await dispatch(
          updateShop({
            realTimeStatus: {
              ...status,
              lastUpdated: new Date().toISOString(),
            },
          })
        ).unwrap();
        toast.success(result.message || 'Shop status updated successfully!');
        dispatch(fetchShop()); // Refresh shop data
      } catch (error) {
        toast.error(error.message || 'Failed to update shop status');
      }
    },
    [dispatch, status]
  );

  const handleStatusChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setStatus((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'override' && { isOpen: checked ? !prev.isOpen : prev.isOpen }),
    }));
  }, []);

  const toggleOpenStatus = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  return (
    <div className="flex-1 md:px-20 py-3 pb-5 text-black">
      <h1 className="text-2xl font-bold p-4">View Shop</h1>
      <div className="bg-white rounded-lg shadow p-6 mx-4">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <div className="flex justify-between items-center">
              <p>{error}</p>
              <button onClick={() => dispatch(clearError())} className="text-red-700 hover:text-red-900">
                ×
              </button>
            </div>
          </div>
        )}
        {loading && (
          <div className="text-center">
            <span className="loading loading-spinner text-pink-500"></span>
          </div>
        )}
        {!loading && !shop && <p className="text-gray-600">No shop found.</p>}
        {!loading && shop && (
          <>
            <div className="relative ">
              <figure className="relative h-50 ">
                <img
                  src={shop?.shopImage || 'https://static.vecteezy.com/system/resources/previews/009/784/989/original/picture-icon-isolated-on-white-background-free-vector.jpg'}
                  alt={shop?.shopName || 'Beauty Service'}
                  className="w-full h-full object-cover rounded-2xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 w-full flex items-center justify-between px-3">
                  <div className="flex w-full justify-between">
                    <div className="flex gap-1">
                      <Star className="text-sm text-yellow-400" fill="currentColor" />
                      <span className="text-white"> {shop?.globalRating?.avg_rating || 0} Average Rating</span>
                    </div>
                    <div className="flex text-white text-sm gap-1">
                      <Eye className="text-sm" />
                      <span> {shop?.globalRating?.ratings.length || 0}</span>
                    </div>
                  </div>
                </div>
              </figure>
              <div className={`absolute top-4 right-4 badge gap-1 ${status.isOpen ? 'badge-success' : 'badge-error'}`}>
                {status.isOpen ? 'Open' : 'Closed'}
                {status.override && <span className="ml-1 text-xs">(Manual)</span>}
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-xl font-semibold">{shop.shopName}</h2>
              <p className="text-gray-600 mt-2">
                <strong>Email :</strong> {shop.emailId}
              </p>
              <p className="text-gray-600 mt-2">
                <strong>Address :</strong> {shop.location.address}, {shop.location.city}, {shop.location.pincode}
              </p>
              <p className="text-gray-600 mt-2">
                <strong>Services :</strong> {shop.services.map((s) => s.name).join(', ')}
              </p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Clock size={16} className="mr-1" />
                Last updated: {new Date(status.lastUpdated).toLocaleString()}
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-700">Shop Status Control</h3>
              <form onSubmit={handleStatusUpdate} className="space-y-4 mt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Shop Status</label>
                  <label className="swap">
                    <input type="checkbox" checked={status.isOpen} onChange={toggleOpenStatus} />
                    <div className={`swap-on text-white btn btn-success ${status.isOpen ? '' : 'hidden'}`}>OPEN</div>
                    <div className={`swap-off text-white btn btn-error ${!status.isOpen ? '' : 'hidden'}`}>CLOSED</div>
                  </label>
                </div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="override"
                    checked={status.override}
                    onChange={handleStatusChange}
                    className="checkbox checkbox-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Manual Override</span>
                </label>
                {!status.isOpen && (
                  <div>
                    <label htmlFor="closureReason" className="block text-sm font-medium text-gray-700">
                      Closure Reason
                    </label>
                    <select
                      id="closureReason"
                      name="closureReason"
                      value={status.closureReason || ''}
                      onChange={handleStatusChange}
                      className="mt-1 block w-full border-0 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-2 sm:p-3 bg-gray-200 font-semibold"
                      required={!status.isOpen}
                    >
                      {closureReasons.map((reason) => (
                        <option
                          key={reason.value || 'null'}
                          value={reason.value || ''}
                          className="font-medium text-purple-500 hover:bg-purple-500 hover:text-purple-800"
                        >
                          {reason.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Offers</h4>
                  {shop?.offers?.length > 0 ? (
                    <div className="carousel rounded-box w-full gap-4">
                      {shop?.offers?.map((offer) => (
                        <div
                          key={offer._id}
                          className="carousel-item bg-purple-100 border-1 border-purple-400 rounded-xl shadow-md p-3 w-60 max-h-[90px] flex items-center"
                        >
                          <div className="flex-shrink-0 h-16 w-16 rounded-full overflow-hidden">
                            <img
                              src="https://png.pngtree.com/png-vector/20211028/ourlarge/pngtree-today-offer-with-free-vector-png-image_4012911.png"
                              alt="Beauty Service"
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="border-l border-dashed border-gray-400 h-16 mx-3 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0 text-center">
                            <p className="text-md font-medium truncate text-purple-700">{offer.name || 'No Offer Name'}</p>
                            <p className="text-sm text-purple-700 line-clamp-2">{offer.description || 'No description available'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No offers available at the moment.</p>
                  )}
                </div>
                <div className="mt-4">
                  <h4 className="text-md font-medium text-gray-700 mb-2">Shop Timings</h4>
                  <div className="carousel rounded-box w-full">
                    {shop.timings?.map((timing, index) => (
                      <div key={index} className="carousel-item p-2">
                        <div className="bg-gray-200 rounded h-full flex flex-col justify-center items-center text-center py-2 px-4">
                          <p className="font-medium">{timing.day}</p>
                          <p>
                            {timing.opens} - {timing.closes}
                            {timing.isClosed && <span className="text-red-500 ml-2">(Closed)</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn border-0 bg-purple-500 text-white hover:bg-purple-600 transition-all duration-300 ease-in-out ${loading ? 'loading' : ''}`}
                >
                  Update Status
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewShop;