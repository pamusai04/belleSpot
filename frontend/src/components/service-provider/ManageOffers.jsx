// frontend/src/components/service-provider/ManageOffers.jsx
import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchOffers, createOffer, updateOffer, deleteOffer, clearError } from '../../redux/slices/offerSlice';

const ManageOffers = () => {
  const dispatch = useDispatch();
  const { offers = [], loading, error } = useSelector((state) => state.offer);
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
    isActive: true,
    minOrderValue: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchOffers());
  }, [dispatch]);

  

  const formatDateForInput = useCallback((dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name) errors.name = 'Offer name is required';
    if (!formData.discountType) errors.discountType = 'Discount type is required';
    if (!formData.discountValue || isNaN(formData.discountValue) || formData.discountValue < 0) {
      errors.discountValue = 'Discount value must be a non-negative number';
    }
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        errors.endDate = 'End date must be after start date';
      }
    }
    if (formData.minOrderValue && (isNaN(formData.minOrderValue) || formData.minOrderValue < 0)) {
      errors.minOrderValue = 'Minimum order value must be a non-negative number';
    }
    return errors;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      _id: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      startDate: '',
      endDate: '',
      isActive: true,
      minOrderValue: '',
    });
    setFormErrors({});
  }, []);

  const handleSubmit = useCallback(
  async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the form errors');
      return;
    }

    try {
      // Prepare data for backend
      const submitData = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      

      if (formData._id) {
        // Update offer
        const result = await dispatch(updateOffer(submitData)).unwrap();
        toast.success(result.message || 'Offer updated successfully!');
      } else {
        // Create offer
        const { _id, ...newOfferData } = submitData;
        const result = await dispatch(createOffer(newOfferData)).unwrap();
        toast.success(result.message || 'Offer created successfully!');
      }
      resetForm();
    } catch (error) {
      
      if (error.errors) {
        setFormErrors(error.errors);
        // Display specific error for endDate
        if (error.errors.endDate) {
          toast.error(error.errors.endDate);
        } else {
          toast.error('Please fix the form errors');
        }
      } else {
        toast.error(error.message || 'Failed to save offer');
      }
    }
  },
  [formData, dispatch, resetForm, validateForm]
);

  const handleEdit = useCallback(
    (offer) => {
      
      setFormData({
        _id: offer._id,
        name: offer.name,
        description: offer.description || '',
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        startDate: formatDateForInput(offer.startDate),
        endDate: formatDateForInput(offer.endDate),
        isActive: offer.isActive,
        minOrderValue: offer.minOrderValue || '',
      });
      setFormErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [formatDateForInput],
  );

  const handleDelete = useCallback(
    async (offerId) => {
      if (window.confirm('Are you sure you want to delete this offer?')) {
        try {
         
          const result = await dispatch(deleteOffer(offerId)).unwrap();
          toast.success(result.message || 'Offer deleted successfully!');
        } catch (error) {
          
          toast.error(error.message || 'Failed to delete offer');
        }
      }
    },
    [dispatch],
  );

  return (
    <div className="flex-1 py-3 pb-5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-md md:text-2xl font-bold text-gray-800">Manage Offers</h1>
          {formData._id && (
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              + Create New Offer
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <div className="flex justify-between items-center">
              <p>{error}</p>
              <button
                onClick={() => dispatch(clearError())}
                className="text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {Object.keys(formErrors).length > 0 && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <ul>
              {Object.entries(formErrors).map(([field, msg]) => (
                <li key={field}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">
              {formData._id ? 'Edit Offer' : 'Create New Offer'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Offer Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full text-purple-700 font-semibold px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-purple-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-purple-100`}
                  required
                  placeholder="Summer Sale"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full text-purple-700 font-semibold px-3 py-2 border border-purple-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-purple-100"
                  placeholder="Enter offer description"
                />
              </div>
              <div>
                <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type *
                </label>
                <select
                  id="discountType"
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className={`w-full text-purple-700 font-semibold px-3 py-2 border ${formErrors.discountType ? 'border-red-500' : 'border-purple-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-purple-100`}
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat Amount</option>
                </select>
              </div>
              <div>
                <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value *
                </label>
                <input
                  type="number"
                  id="discountValue"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleChange}
                  className={`w-full text-purple-700 font-semibold px-3 py-2 border ${formErrors.discountValue ? 'border-red-500' : 'border-purple-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-purple-100`}
                  required
                  placeholder={formData.discountType === 'percentage' ? '10' : '50'}
                  min="0"
                  step={formData.discountType === 'percentage' ? '1' : '0.01'}
                />
              </div>
              <div>
                <label htmlFor="minOrderValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Order Value
                </label>
                <input
                  type="number"
                  id="minOrderValue"
                  name="minOrderValue"
                  value={formData.minOrderValue}
                  onChange={handleChange}
                  className={`w-full text-purple-700 font-semibold px-3 py-2 border ${formErrors.minOrderValue ? 'border-red-500' : 'border-purple-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-purple-100`}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full text-purple-700 font-semibold px-3 py-2 border ${formErrors.startDate ? 'border-red-500' : 'border-purple-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-purple-100`}
                  required
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full text-purple-700 font-semibold px-3 py-2 border ${formErrors.endDate ? 'border-red-500' : 'border-purple-300'} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-purple-100`}
                  required
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Activate this offer
              </label>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              {formData._id && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {formData._id ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  formData._id ? 'Update Offer' : 'Create Offer'
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-800">Current Offers</h2>
          </div>
          {loading ? (
            <div className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          ) : !Array.isArray(offers) || offers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No offers available. Create your first offer above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Discount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Validity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Min Order
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {offers.map((offer) => (
                    <tr key={offer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {offer.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {offer.description || 'No description available'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {offer.discountValue} {offer.discountType === 'percentage' ? '%' : '₹'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateForInput(offer.startDate)} - {formatDateForInput(offer.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {offer.minOrderValue ? `₹${offer.minOrderValue}` : 'None'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            offer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {offer.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(offer)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(offer._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageOffers;