import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchShop, updateShop, addSubService, deleteService, clearError } from '../../redux/slices/shopSlice';
import { Edit2, Trash2, Plus, X, Check, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { convertTo12Hour } from '../../utils/convertTime';
import React from 'react';

const FALLBACK_IMAGE = 'https://placehold.co/150x150';

const ManageShop = () => {
  const dispatch = useDispatch();
  const { shop, loading, error } = useSelector((state) => state.shop);
  const [editService, setEditService] = useState(null);
  const [editShopDetails, setEditShopDetails] = useState(false);
  const [editTimings, setEditTimings] = useState(false);
  const [shopDetails, setShopDetails] = useState({
    shopName: '',
    emailId: '',
    genderSpecific: 'female',
    homeService: false,
  });
  const [timings, setTimings] = useState([]);
  const [isAddingSubService, setIsAddingSubService] = useState(null);
  const [newSubService, setNewSubService] = useState({
    name: '',
    duration: '',
    price: '',
    serviceImage: null,
  });
  const [newMainService, setNewMainService] = useState({
    name: '',
    category: '',
    subServices: [],
  });
  const [isAddingMainService, setIsAddingMainService] = useState(false);
  const [expandedService, setExpandedService] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());

  useEffect(() => {
    dispatch(fetchShop());
  }, [dispatch]);

  useEffect(() => {
    if (shop) {
      setShopDetails({
        shopName: shop.shopName || '',
        emailId: shop.emailId || '',
        genderSpecific: shop.genderSpecific || 'female',
        homeService : shop.homeService  || false,
      });
      setTimings(
        shop.timings || [
          { day: 'monday', opens: '', closes: '', isClosed: false },
          { day: 'tuesday', opens: '', closes: '', isClosed: false },
          { day: 'wednesday', opens: '', closes: '', isClosed: false },
          { day: 'thursday', opens: '', closes: '', isClosed: false },
          { day: 'friday', opens: '', closes: '', isClosed: false },
          { day: 'saturday', opens: '', closes: '', isClosed: false },
          { day: 'sunday', opens: '', closes: '', isClosed: false },
        ]
      );
    }
  }, [shop]);

  const handleEdit = (service) => {
    setEditService({
      ...service,
      subServices: service.subServices.map((sub) => ({
        ...sub,
        name: sub.name || '',
        duration: sub.duration || '',
        price: sub.price || '',
        serviceImage: sub.serviceImage || null,
      })),
    });
    setIsAddingSubService(null);
    setIsAddingMainService(false);
    setEditTimings(false);
    setEditShopDetails(false);
    setNewSubService({ name: '', duration: '', price: '', serviceImage: null });
  };

  const addSubServiceHandler = async (serviceId) => {
    if (!newSubService.name || !newSubService.duration || !newSubService.price) {
      toast.warning('Please fill all sub-service fields');
      return;
    }

    const duration = parseInt(newSubService.duration, 10);
    const price = parseFloat(newSubService.price);

    if (isNaN(duration) || duration < 5 || duration > 720) {
      toast.error('Duration must be between 5 and 720 minutes');
      return;
    }

    if (isNaN(price) || price < 0) {
      toast.error('Price must be a non-negative number');
      return;
    }

    const formData = new FormData();
    formData.append('serviceId', serviceId);
    formData.append('name', newSubService.name.trim());
    formData.append('duration', duration);
    formData.append('price', price);
    if (newSubService.serviceImage instanceof File) {
      formData.append('subServiceImage', newSubService.serviceImage);
    }

    try {
      await dispatch(addSubService(formData)).unwrap();
      toast.success('Sub-service added successfully!');
      setNewSubService({ name: '', duration: '', price: '', serviceImage: null });
      setIsAddingSubService(null);
      await dispatch(fetchShop()).unwrap();
    } catch (error) {
      toast.error(error.message || 'Failed to add sub-service');
    }
  };

  const addMainSubService = () => {
    if (!newSubService.name || !newSubService.duration || !newSubService.price) {
      toast.warning('Please fill all sub-service fields');
      return;
    }

    const duration = parseInt(newSubService.duration, 10);
    const price = parseFloat(newSubService.price);

    if (isNaN(duration) || duration < 5 || duration > 720) {
      toast.error('Duration must be between 5 and 720 minutes');
      return;
    }

    if (isNaN(price) || price < 0) {
      toast.error('Price must be a non-negative number');
      return;
    }

    const newSubServiceData = {
      name: newSubService.name.trim(),
      duration,
      price,
      serviceImage: newSubService.serviceImage,
      imageKey: newSubService.serviceImage instanceof File ? `new-${Date.now()}-${Math.random().toString(36).substring(2, 15)}` : null,
    };

    setNewMainService((prev) => ({
      ...prev,
      subServices: [...prev.subServices, newSubServiceData],
    }));
    setNewSubService({ name: '', duration: '', price: '', serviceImage: null });
    setIsAddingSubService(null);
  };

  const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    const servicesToUpdate = [];

    if (isAddingMainService && newMainService.name && newMainService.category && newMainService.subServices.length) {
      const mainServiceData = {
        name: newMainService.name.trim(),
        category: newMainService.category.trim(),
        subServices: newMainService.subServices.map((ss) => ({
          name: ss.name.trim(),
          duration: Number(ss.duration),
          price: Number(ss.price),
          imageKey: ss.imageKey || null,
        })),
      };
      servicesToUpdate.push(mainServiceData);
      newMainService.subServices.forEach((ss) => {
        if (ss.serviceImage instanceof File) {
          formData.append('subServiceImages', ss.serviceImage);
        }
      });
    }

    if (editService) {
      const serviceData = {
        _id: editService._id,
        name: editService.name.trim(),
        category: editService.category.trim(),
        subServices: editService.subServices.map((ss) => ({
          _id: ss._id || undefined,
          name: ss.name.trim(),
          duration: Number(ss.duration),
          price: Number(ss.price),
          imageKey: ss.imageKey || (ss.serviceImage instanceof File ? `edit-${Date.now()}-${Math.random().toString(36).substring(2, 15)}` : null),
        })),
      };
      servicesToUpdate.push(serviceData);
      editService.subServices.forEach((ss) => {
        if (ss.serviceImage instanceof File) {
          formData.append('subServiceImages', ss.serviceImage);
        }
      });
    }

    if (servicesToUpdate.length > 0) {
      formData.append('services', JSON.stringify(servicesToUpdate));
    }

    if (editTimings) {
      const validatedTimings = timings.map((t) => ({
        day: t.day,
        opens: t.isClosed ? '' : t.opens,
        closes: t.isClosed ? '' : t.closes,
        isClosed: t.isClosed,
      }));
      formData.append('timings', JSON.stringify(validatedTimings));
    }

    if (editShopDetails) {
      formData.append('shopName', shopDetails.shopName);
      formData.append('emailId', shopDetails.emailId);
      formData.append('genderSpecific', shopDetails.genderSpecific);
      formData.append('homeService', shopDetails.homeService.toString()); // Changed from isHomeService to homeService
    }

    const result = await dispatch(updateShop(formData)).unwrap();
    toast.success(result.message || 'Updated successfully!');
    setEditService(null);
    setEditTimings(false);
    setEditShopDetails(false);
    setIsAddingMainService(false);
    setNewMainService({ name: '', category: '', subServices: [] });
    setNewSubService({ name: '', duration: '', price: '', serviceImage: null });
    await dispatch(fetchShop()).unwrap();
  } catch (error) {
    toast.error(error.message || 'Failed to update');
  }
};


  const handleDelete = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await dispatch(deleteService(serviceId)).unwrap();
        toast.success('Service deleted successfully!');
        await dispatch(fetchShop()).unwrap();
      } catch (error) {
        toast.error(error.message || 'Failed to delete service');
      }
    }
  };

  const removeSubService = (index, context = 'edit') => {
    if (context === 'main') {
      setNewMainService((prev) => ({
        ...prev,
        subServices: prev.subServices.filter((_, i) => i !== index),
      }));
    } else {
      setEditService((prev) => ({
        ...prev,
        subServices: prev.subServices.filter((_, i) => i !== index),
      }));
    }
  };

  const handleTimingChange = (index, field, value) => {
    setTimings((prev) =>
      prev.map((t, i) =>
        i === index ? { ...t, [field]: value } : t
      )
    );
  };

  const toggleClosed = (index) => {
    setTimings((prev) =>
      prev.map((t, i) =>
        i === index
          ? {
              ...t,
              isClosed: !t.isClosed,
              opens: !t.isClosed ? '' : t.opens,
              closes: !t.isClosed ? '' : t.closes,
            }
          : t
      )
    );
  };

  const handleImageUpload = (e, index = null, context = 'sub') => {
    const file = e.target.files[0];
    if (!file) {
      toast.error('No file selected');
      return;
    }
    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (context === 'main') {
      setNewMainService((prev) => {
        const updatedSubServices = [...prev.subServices];
        updatedSubServices[index] = {
          ...updatedSubServices[index],
          serviceImage: file,
          imageKey: `new-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        };
        return { ...prev, subServices: updatedSubServices };
      });
    } else if (context === 'edit') {
      setEditService((prev) => {
        const updatedSubServices = [...prev.subServices];
        updatedSubServices[index] = {
          ...updatedSubServices[index],
          serviceImage: file,
          imageKey: `edit-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        };
        return { ...prev, subServices: updatedSubServices };
      });
    } else {
      setNewSubService({
        ...newSubService,
        serviceImage: file,
      });
    }
  };

  const removeImage = (index = null, context = 'sub') => {
    if (context === 'main') {
      setNewMainService((prev) => {
        const updatedSubServices = [...prev.subServices];
        updatedSubServices[index] = { ...updatedSubServices[index], serviceImage: null, imageKey: null };
        return { ...prev, subServices: updatedSubServices };
      });
    } else if (context === 'edit') {
      setEditService((prev) => {
        const updatedSubServices = [...prev.subServices];
        updatedSubServices[index] = { ...updatedSubServices[index], serviceImage: null, imageKey: null };
        return { ...prev, subServices: updatedSubServices };
      });
    } else {
      setNewSubService({ ...newSubService, serviceImage: null });
    }
  };

  const handleImageError = (e, imageUrl) => {
    if (!failedImages.has(imageUrl)) {
      setFailedImages((prev) => new Set(prev).add(imageUrl));
      e.target.src = FALLBACK_IMAGE;
    }
  };

  return (
    <div className="flex-1 pb-5 text-black">
      <div className="bg-white rounded-lg shadow p-4">
        <h1 className="text-2xl font-bold mb-6">Manage Shop</h1>

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
          <div className="text-center py-8">
            <span className="loading loading-spinner loading-lg text-pink-500"></span>
          </div>
        )}

        {!loading && !shop && (
          <div className="text-center py-8">
            <p className="text-gray-600">No shop found. Please create a shop first.</p>
          </div>
        )}

        {!loading && shop && (
          <>
            <div className="mb-8 border border-purple-400 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <h3 className="text-lg font-medium">Shop Details</h3>
                <button
                  onClick={() => {
                    setEditShopDetails(!editShopDetails);
                    setEditTimings(false);
                    setEditService(null);
                    setIsAddingMainService(false);
                    setIsAddingSubService(null);
                  }}
                  className="btn btn-sm bg-pink-500 border-0 text-white hover:bg-pink-600"
                >
                  {editShopDetails ? 'Cancel' : 'Edit Details'}
                </button>
              </div>
              
              {editShopDetails ? (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-full">
                    <div className="space-y-2">
                      <label className="label">
                        <span className="label-text font-semibold text-gray-700 text-sm">Shop Name</span>
                      </label>
                      <input
                        type="text"
                        value={shopDetails.shopName}
                        onChange={(e) => setShopDetails({ ...shopDetails, shopName: e.target.value })}
                        className="input input-bordered w-full bg-purple-100 border-purple-400 text-purple-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 font-sans text-base leading-6"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label">
                        <span className="label-text font-semibold text-gray-700 text-sm">Email</span>
                      </label>
                      <input
                        type="email"
                        value={shopDetails.emailId}
                        onChange={(e) => setShopDetails({ ...shopDetails, emailId: e.target.value })}
                        className="input input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500 font-sans text-base leading-6"
                        disabled
                      />
                      <p className="text-sm text-gray-500">Note: Email cannot be changed.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="label">
                        <span className="label-text font-semibold text-gray-700 text-sm">Gender Specific</span>
                      </label>
                      <div className="relative">
                        <select
                          value={shopDetails.genderSpecific}
                          onChange={(e) => setShopDetails({ ...shopDetails, genderSpecific: e.target.value })}
                          className="select select-bordered w-full bg-purple-100  border-purple-400 text-purple-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 hover:bg-purple-200 transition-colors duration-200 font-sans text-base leading-6 appearance-none pl-3 pr-10"
                          aria-label="Select gender specific option"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="unisex">Unisex</option>
                        </select>
                        
                      </div>
                    </div>
                    <div className="space-y-2 flex flex-col">
                      <label className="label">
                        <span className="label-text font-semibold text-gray-700 text-sm">Home Service</span>
                      </label>
                      <label className="label cursor-pointer gap-2">
                        <input
                          type="checkbox"
                          checked={shopDetails.homeService || false }
                          onChange={(e) => setShopDetails({ ...shopDetails, homeService: e.target.checked })}
                          className="checkbox checkbox-primary"
                        />
                        <span className="label-text font-sans text-base text-gray-700">Enable Home Service</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditShopDetails(false);
                        setShopDetails({
                          shopName: shop.shopName || '',
                          emailId: shop.emailId || '',
                          genderSpecific: shop.genderSpecific || 'female',
                          homeService : shop.homeService  || false,
                        });
                      }}
                      className="btn btn-ghost bg-purple-500 border-0 text-white hover:bg-pink-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      className="btn bg-pink-500 border-0 text-white hover:bg-pink-600"
                    >
                      Update Details
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-300">
                      <span className="font-medium text-gray-700">Shop Name: </span>
                      <span className="text-gray-600">{shop.shopName || 'N/A'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-700">Email: </span>
                      <span className="text-gray-600">{shop.emailId || 'N/A'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-700">Gender Specific: </span>
                      <span className="text-gray-600 capitalize">{shop.genderSpecific || 'Female'}</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-700">Home Service: </span>
                      <span className="text-gray-600">{shop.homeService  ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8 border border-purple-400 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <h3 className="text-lg font-medium">Shop Timings</h3>
                </div>
                <button
                  onClick={() => {
                    setEditTimings(!editTimings);
                    setEditShopDetails(false);
                    setEditService(null);
                    setIsAddingMainService(false);
                    setIsAddingSubService(null);
                  }}
                  className="btn btn-sm bg-pink-500 border-0 text-white hover:bg-pink-600"
                >
                  {editTimings ? 'Cancel' : 'Edit Timings'}
                </button>
              </div>
              {editTimings ? (
                <div className="p-4 space-y-3">
                  {timings.map((timing, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <span className="w-24 text-sm font-medium capitalize">{timing.day}</span>
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <input
                            type="time"
                            value={timing.opens}
                            onChange={(e) => handleTimingChange(index, 'opens', e.target.value)}
                            className="input input-bordered w-full bg-purple-500 text-white focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                            disabled={timing.isClosed}
                          />
                        </div>
                        <div>
                          <input
                            type="time"
                            value={timing.closes}
                            onChange={(e) => handleTimingChange(index, 'closes', e.target.value)}
                            className="input input-bordered w-full bg-purple-500 text-white focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                            disabled={timing.isClosed}
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="label cursor-pointer gap-2">
                            <input
                              type="checkbox"
                              checked={timing.isClosed}
                              onChange={() => toggleClosed(index)}
                              className="checkbox checkbox-primary"
                            />
                            <span className="label-text">Closed</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditTimings(false);
                        setTimings(shop.timings || timings);
                      }}
                      className="btn btn-ghost bg-purple-500 border-0 text-white hover:bg-pink-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      className="btn bg-pink-500 border-0 text-white hover:bg-pink-600"
                    >
                      Update Timings
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {timings.map((timing, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">{timing.day}</span>
                          {timing.isClosed ? (
                            <span className="badge badge-error">Closed</span>
                          ) : (
                            <span className="text-sm">{convertTo12Hour(timing.opens)} - {convertTo12Hour(timing.closes)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8 border border-purple-400 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <h3 className="text-lg font-medium">Services</h3>
                <button
                  onClick={() => {
                    setIsAddingMainService(!isAddingMainService);
                    setEditService(null);
                    setEditShopDetails(false);
                    setEditTimings(false);
                    setIsAddingSubService(null);
                    setNewMainService({ name: '', category: '', subServices: [] });
                  }}
                  className="btn btn-sm bg-pink-500 border-0 text-white hover:bg-pink-600"
                >
                  {isAddingMainService ? 'Cancel' : 'Add New Service'}
                </button>
              </div>
              <div className="p-4 space-y-4">
                {isAddingMainService ? (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-sm sm:text-lg font-semibold">Add New Service</h2>
                      <button
                        onClick={() => {
                          setIsAddingMainService(false);
                          setNewMainService({ name: '', category: '', subServices: [] });
                          setIsAddingSubService(null);
                        }}
                        className="btn btn-sm btn-ghost"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="label"><span className="label-text font-medium">Service Name</span></label>
                          <input
                            type="text"
                            value={newMainService.name}
                            onChange={(e) => setNewMainService({ ...newMainService, name: e.target.value })}
                            placeholder="e.g. Haircut"
                            className="input input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="label"><span className="label-text font-medium">Category</span></label>
                          <input
                            type="text"
                            value={newMainService.category}
                            onChange={(e) => setNewMainService({ ...newMainService, category: e.target.value })}
                            placeholder="e.g. Hair Services"
                            className="input input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-md sm:text-lg">Sub-Services</h3>
                          <button
                            type="button"
                            onClick={() => setIsAddingSubService('new-main')}
                            className="btn btn-sm bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white"
                          >
                            <Plus size={16} className="mr-1" />
                            Add Sub-Service
                          </button>
                        </div>
                        <div className="space-y-3">
                          {newMainService.subServices.length > 0 ? (
                            newMainService.subServices.map((subService, index) => (
                              <div
                                key={`main-${index}`}
                                className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 hover:border-pink-300 transition-colors"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                                  <div>
                                    <label className="label label-text text-xs text-gray-500 font-semibold">Name</label>
                                    <input
                                      type="text"
                                      value={subService.name}
                                      onChange={(e) => {
                                        const updatedSubServices = [...newMainService.subServices];
                                        updatedSubServices[index] = { ...subService, name: e.target.value };
                                        setNewMainService({ ...newMainService, subServices: updatedSubServices });
                                      }}
                                      className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="label label-text text-xs text-gray-500 font-semibold">Duration (min)</label>
                                    <input
                                      type="number"
                                      value={subService.duration}
                                      onChange={(e) => {
                                        const updatedSubServices = [...newMainService.subServices];
                                        updatedSubServices[index] = { ...subService, duration: e.target.value };
                                        setNewMainService({ ...newMainService, subServices: updatedSubServices });
                                      }}
                                      className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="label label-text text-xs text-gray-500 font-semibold">Price (₹)</label>
                                    <input
                                      type="number"
                                      value={subService.price}
                                      onChange={(e) => {
                                        const updatedSubServices = [...newMainService.subServices];
                                        updatedSubServices[index] = { ...subService, price: e.target.value };
                                        setNewMainService({ ...newMainService, subServices: updatedSubServices });
                                      }}
                                      className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="label label-text text-xs text-gray-500 font-semibold">Image</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={subService.serviceImage instanceof File ? subService.serviceImage.name : subService.serviceImage || ''}
                                        readOnly
                                        className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                        placeholder="Image URL"
                                      />
                                      <label className="btn btn-sm btn-outline bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white">
                                        <input
                                          type="file"
                                          className="hidden"
                                          accept="image/*"
                                          onChange={(e) => handleImageUpload(e, index, 'main')}
                                        />
                                        Upload
                                      </label>
                                    </div>
                                    {subService.serviceImage && (
                                      <div className="mt-2">
                                        <div className="flex items-center gap-2">
                                          <img
                                            src={
                                              subService.serviceImage instanceof File
                                                ? URL.createObjectURL(subService.serviceImage)
                                                : failedImages.has(subService.serviceImage)
                                                ? FALLBACK_IMAGE
                                                : subService.serviceImage || FALLBACK_IMAGE
                                            }
                                            alt="Service preview"
                                            className="w-16 h-16 object-cover rounded"
                                            onError={(e) => handleImageError(e, subService.serviceImage || FALLBACK_IMAGE)}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeImage(index, 'main')}
                                            className="btn btn-xs btn-error"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSubService(index, 'main')}
                                  className="btn btn-sm btn-circle btn-error btn-outline hover:bg-error hover:text-white"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-500">No sub-services added yet</div>
                          )}
                          {isAddingSubService === 'new-main' && (
                            <div className="flex items-center gap-3 bg-white p-4 rounded-lg border-2 border-dashed border-pink-500">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                                <div>
                                  <label className="label label-text text-xs text-gray-500 font-semibold">Name</label>
                                  <input
                                    type="text"
                                    value={newSubService.name}
                                    onChange={(e) => setNewSubService({ ...newSubService, name: e.target.value })}
                                    placeholder="e.g. Shave"
                                    className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                  />
                                </div>
                                <div>
                                  <label className="label label-text text-xs text-gray-500 font-semibold">Duration (min)</label>
                                  <input
                                    type="number"
                                    value={newSubService.duration}
                                    onChange={(e) => setNewSubService({ ...newSubService, duration: e.target.value })}
                                    placeholder="e.g. 20"
                                    className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                  />
                                </div>
                                <div>
                                  <label className="label label-text text-xs text-gray-500 font-semibold">Price (₹)</label>
                                  <input
                                    type="number"
                                    value={newSubService.price}
                                    onChange={(e) => setNewSubService({ ...newSubService, price: e.target.value })}
                                    placeholder="e.g. 100"
                                    className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                  />
                                </div>
                                <div>
                                  <label className="label label-text text-xs text-gray-500 font-semibold">Image</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={newSubService.serviceImage instanceof File ? newSubService.serviceImage.name : newSubService.serviceImage || ''}
                                      readOnly
                                      placeholder="Image URL"
                                      className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                    />
                                    <label className="btn btn-sm btn-outline bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white">
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e)}
                                      />
                                      Upload
                                    </label>
                                  </div>
                                  {newSubService.serviceImage && (
                                    <div className="mt-2">
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={
                                            newSubService.serviceImage instanceof File
                                              ? URL.createObjectURL(newSubService.serviceImage)
                                              : failedImages.has(newSubService.serviceImage)
                                              ? FALLBACK_IMAGE
                                              : newSubService.serviceImage || FALLBACK_IMAGE
                                          }
                                          alt="Service preview"
                                          className="w-16 h-16 object-cover rounded"
                                          onError={(e) => handleImageError(e, newSubService.serviceImage || FALLBACK_IMAGE)}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeImage()}
                                          className="btn btn-xs btn-error"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={addMainSubService}
                                  className="btn btn-sm btn-circle btn-success hover:bg-success hover:text-white"
                                  disabled={!newSubService.name || !newSubService.duration || !newSubService.price}
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsAddingSubService(null)}
                                  className="btn btn-sm btn-circle btn-error btn-outline hover:bg-error hover:text-white"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingMainService(false);
                            setNewMainService({ name: '', category: '', subServices: [] });
                            setIsAddingSubService(null);
                          }}
                          className="btn bg-purple-500 border-0 text-white hover:bg-pink-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn bg-pink-500 border-0 text-white hover:bg-pink-600"
                          disabled={!newMainService.name || !newMainService.category || !newMainService.subServices.length}
                        >
                          Save Service
                        </button>
                      </div>
                    </form>
                  </div>
                ) : editService ? (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-sm sm:text-lg font-semibold">Edit Service</h2>
                      <button
                        onClick={() => {
                          setEditService(null);
                          setIsAddingSubService(null);
                        }}
                        className="btn btn-sm btn-ghost"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="label"><span className="label-text font-medium">Service Name</span></label>
                          <input
                            type="text"
                            value={editService.name}
                            onChange={(e) => setEditService({ ...editService, name: e.target.value })}
                            className="input input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="label"><span className="label-text font-medium">Category</span></label>
                          <input
                            type="text"
                            value={editService.category}
                            onChange={(e) => setEditService({ ...editService, category: e.target.value })}
                            className="input input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-md sm:text-lg">Sub-Services</h3>
                          {!isAddingSubService && (
                            <button
                              type="button"
                              onClick={() => setIsAddingSubService(editService._id)}
                              className="btn btn-sm bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white"
                            >
                              <Plus size={16} className="mr-1" />
                              Add Sub-Service
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          {editService.subServices.length > 0 ? (
                            editService.subServices.map((subService, index) => (
                              <div
                                key={subService._id || `new-${index}`}
                                className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 hover:border-pink-300 transition-colors"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                                  <div>
                                    <label className="label label-text text-xs text-gray-500 font-semibold">Name</label>
                                    <input
                                      type="text"
                                      value={subService.name}
                                      onChange={(e) => {
                                        const updatedSubServices = [...editService.subServices];
                                        updatedSubServices[index] = { ...subService, name: e.target.value };
                                        setEditService({ ...editService, subServices: updatedSubServices });
                                      }}
                                      className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="label label-text text-xs text-gray-500 font-semibold">Duration (min)</label>
                                    <input
                                      type="number"
                                      value={subService.duration}
                                      onChange={(e) => {
                                        const updatedSubServices = [...editService.subServices];
                                        updatedSubServices[index] = { ...subService, duration: e.target.value };
                                        setEditService({ ...editService, subServices: updatedSubServices });
                                      }}
                                      className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="label label-text text-xs text-gray-500 font-semibold">Price (₹)</label>
                                    <input
                                      type="number"
                                      value={subService.price}
                                      onChange={(e) => {
                                        const updatedSubServices = [...editService.subServices];
                                        updatedSubServices[index] = { ...subService, price: e.target.value };
                                        setEditService({ ...editService, subServices: updatedSubServices });
                                      }}
                                      className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="label label-text text-xs text-gray-500 font-semibold">Image</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={subService.serviceImage instanceof File ? subService.serviceImage.name : subService.serviceImage || ''}
                                        readOnly
                                        className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                        placeholder="Image URL"
                                      />
                                      <label className="btn btn-sm btn-outline bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white">
                                        <input
                                          type="file"
                                          className="hidden"
                                          accept="image/*"
                                          onChange={(e) => handleImageUpload(e, index, 'edit')}
                                        />
                                        Upload
                                      </label>
                                    </div>
                                    {subService.serviceImage && (
                                      <div className="mt-2">
                                        <div className="flex items-center gap-2">
                                          <img
                                            src={
                                              subService.serviceImage instanceof File
                                                ? URL.createObjectURL(subService.serviceImage)
                                                : failedImages.has(subService.serviceImage)
                                                ? FALLBACK_IMAGE
                                                : subService.serviceImage || FALLBACK_IMAGE
                                            }
                                            alt="Service preview"
                                            className="w-16 h-16 object-cover rounded"
                                            onError={(e) => handleImageError(e, subService.serviceImage || FALLBACK_IMAGE)}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => removeImage(index, 'edit')}
                                            className="btn btn-xs btn-error"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSubService(index)}
                                  className="btn btn-sm btn-circle btn-error btn-outline hover:bg-error hover:text-white"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-gray-500">No sub-services added yet</div>
                          )}
                          {isAddingSubService === editService._id && (
                            <div className="flex items-center gap-3 bg-white p-4 rounded-lg border-2 border-dashed border-pink-500">
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                                <div>
                                  <label className="label label-text text-xs text-gray-500 font-semibold">Name</label>
                                  <input
                                    type="text"
                                    value={newSubService.name}
                                    onChange={(e) => setNewSubService({ ...newSubService, name: e.target.value })}
                                    placeholder="e.g. Shave"
                                    className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                  />
                                </div>
                                <div>
                                  <label className="label label-text text-xs text-gray-500 font-semibold">Duration (min)</label>
                                  <input
                                    type="number"
                                    value={newSubService.duration}
                                    onChange={(e) => setNewSubService({ ...newSubService, duration: e.target.value })}
                                    placeholder="e.g. 20"
                                    className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                  />
                                </div>
                                <div>
                                  <label className="label label-text text-xs text-gray-500 font-semibold">Price (₹)</label>
                                  <input
                                    type="number"
                                    value={newSubService.price}
                                    onChange={(e) => setNewSubService({ ...newSubService, price: e.target.value })}
                                    placeholder="e.g. 100"
                                    className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                  />
                                </div>
                                <div>
                                  <label className="label label-text text-xs text-gray-500 font-semibold">Image</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={newSubService.serviceImage instanceof File ? newSubService.serviceImage.name : newSubService.serviceImage || ''}
                                      readOnly
                                      placeholder="Image URL"
                                      className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                    />
                                    <label className="btn btn-sm btn-outline bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white">
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e)}
                                      />
                                      Upload
                                    </label>
                                  </div>
                                  {newSubService.serviceImage && (
                                    <div className="mt-2">
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={
                                            newSubService.serviceImage instanceof File
                                              ? URL.createObjectURL(newSubService.serviceImage)
                                              : failedImages.has(newSubService.serviceImage)
                                              ? FALLBACK_IMAGE
                                              : newSubService.serviceImage || FALLBACK_IMAGE
                                          }
                                          alt="Service preview"
                                          className="w-16 h-16 object-cover rounded"
                                          onError={(e) => handleImageError(e, newSubService.serviceImage || FALLBACK_IMAGE)}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeImage()}
                                          className="btn btn-xs btn-error"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={() => addSubServiceHandler(editService._id)}
                                  className="btn btn-sm btn-circle btn-success hover:bg-success hover:text-white"
                                  disabled={!newSubService.name || !newSubService.duration || !newSubService.price}
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsAddingSubService(null)}
                                  className="btn btn-sm btn-circle btn-error btn-outline hover:bg-error hover:text-white"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setEditService(null);
                            setIsAddingSubService(null);
                          }}
                          className="btn bg-purple-500 border-0 text-white hover:bg-pink-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn bg-pink-500 border-0 text-white hover:bg-pink-600"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="font-semibold text-gray-600">Service</th>
                          <th className="font-semibold text-gray-600">Category</th>
                          <th className="font-semibold text-gray-600">Sub-Services</th>
                          <th className="font-semibold text-right text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shop.services.map((service) => (
                          <React.Fragment key={service._id}>
                            <tr
                              className="hover:bg-gray-100 group"
                              onClick={() => setExpandedService(expandedService === service._id ? null : service._id)}
                            >
                              <td className="font-medium text-gray-700">{service.name}</td>
                              <td><span className="font-semibold text-gray-700">{service.category}</span></td>
                              <td>
                                <div className="flex items-center gap-1 cursor-pointer">
                                  <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600">
                                    {service.subServices.length} Sub-Services
                                  </span>
                                  {expandedService === service._id ? (
                                    <ChevronUp size={16} className="text-gray-500 group-hover:text-pink-600" />
                                  ) : (
                                    <ChevronDown size={16} className="text-gray-500 group-hover:text-pink-600" />
                                  )}
                                </div>
                              </td>
                              <td className="text-right">
                                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleEdit(service)}
                                    className="btn btn-sm btn-outline btn-primary hover:bg-primary hover:text-white"
                                    aria-label="Edit service"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => setIsAddingSubService(service._id)}
                                    className="btn btn-sm btn-outline btn-success hover:bg-success hover:text-white"
                                    aria-label="Add sub-service"
                                  >
                                    <Plus size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(service._id)}
                                    className="btn btn-sm btn-outline btn-error hover:bg-error hover:text-white"
                                    aria-label="Delete service"
                                    disabled={loading}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {expandedService === service._id && service.subServices.length > 0 && (
                              <tr className="bg-gray-50">
                                <td colSpan={4} className="p-4">
                                  <div className="max-w-4xl mx-auto">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {service.subServices.map((subService, index) => (
                                        <div
                                          key={subService._id || `sub-${index}`}
                                          className="bg-purple-100 p-3 rounded-lg shadow-sm border border-gray-200 hover:border-pink-300 hover:shadow-md transition-all"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                              <h4 className="font-medium text-gray-800">{subService.name}</h4>
                                              <div className="mt-1">
                                                <span className="font-bold text-pink-600">₹{subService.price}</span>
                                                <span className="text-sm text-gray-600 ml-2">• {subService.duration} min</span>
                                              </div>
                                            </div>
                                            {subService.serviceImage && (
                                              <img
                                                src={
                                                  failedImages.has(subService.serviceImage)
                                                    ? FALLBACK_IMAGE
                                                    : subService.serviceImage || FALLBACK_IMAGE
                                                }
                                                alt={subService.name}
                                                className="w-12 h-12 object-cover rounded"
                                                onError={(e) => handleImageError(e, subService.serviceImage || FALLBACK_IMAGE)}
                                              />
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                            {isAddingSubService === service._id && (
                              <tr className="bg-gray-50">
                                <td colSpan={4} className="p-4">
                                  <div className="flex items-center gap-3 bg-white p-4 rounded-lg border-2 border-dashed border-pink-500">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
                                      <div>
                                        <label className="label label-text text-xs text-gray-500 font-semibold">Name</label>
                                        <input
                                          type="text"
                                          value={newSubService.name}
                                          onChange={(e) => setNewSubService({ ...newSubService, name: e.target.value })}
                                          placeholder="e.g. Shave"
                                          className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="label label-text text-xs text-gray-500 font-semibold">Duration (min)</label>
                                        <input
                                          type="number"
                                          value={newSubService.duration}
                                          onChange={(e) => setNewSubService({ ...newSubService, duration: e.target.value })}
                                          placeholder="e.g. 20"
                                          className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="label label-text text-xs text-gray-500 font-semibold">Price (₹)</label>
                                        <input
                                          type="number"
                                          value={newSubService.price}
                                          onChange={(e) => setNewSubService({ ...newSubService, price: e.target.value })}
                                          placeholder="e.g. 100"
                                          className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="label label-text text-xs text-gray-500 font-semibold">Image</label>
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            value={newSubService.serviceImage instanceof File ? newSubService.serviceImage.name : newSubService.serviceImage || ''}
                                            readOnly
                                            placeholder="Image URL"
                                            className="input input-sm input-bordered w-full bg-purple-100 text-purple-700 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                          />
                                          <label className="btn btn-sm btn-outline bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white">
                                            <input
                                              type="file"
                                              className="hidden"
                                              accept="image/*"
                                              onChange={(e) => handleImageUpload(e)}
                                            />
                                            Upload
                                          </label>
                                        </div>
                                        {newSubService.serviceImage && (
                                          <div className="mt-2">
                                            <div className="flex items-center gap-2">
                                              <img
                                                src={
                                                  newSubService.serviceImage instanceof File
                                                    ? URL.createObjectURL(newSubService.serviceImage)
                                                    : failedImages.has(newSubService.serviceImage)
                                                    ? FALLBACK_IMAGE
                                                    : newSubService.serviceImage || FALLBACK_IMAGE
                                                }
                                                alt="Service preview"
                                                className="w-16 h-16 object-cover rounded"
                                                onError={(e) => handleImageError(e, newSubService.serviceImage || FALLBACK_IMAGE)}
                                              />
                                              <button
                                                type="button"
                                                onClick={() => removeImage()}
                                                className="btn btn-xs btn-error"
                                              >
                                                Remove
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <button
                                        type="button"
                                        onClick={() => addSubServiceHandler(service._id)}
                                        className="btn btn-sm btn-circle btn-success hover:bg-success hover:text-white"
                                        disabled={!newSubService.name || !newSubService.duration || !newSubService.price}
                                      >
                                        <Check size={16} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setIsAddingSubService(null)}
                                        className="btn btn-sm btn-circle btn-error btn-outline hover:bg-error hover:text-white"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageShop;
