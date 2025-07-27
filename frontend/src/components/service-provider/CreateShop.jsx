import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createShop, clearError } from '../../redux/slices/shopSlice';
import { Plus, X, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          <p>Something went wrong: {this.state.error?.message || 'Unknown error'}</p>
          <button
            className="mt-2 btn btn-sm btn-error"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const CreateShop = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.shop);
  const [formData, setFormData] = useState({
    shopName: '',
    shopImage: null,
    emailId: '',
    location: {
      address: '',
      city: '',
      pincode: '',
      coordinates: [0, 0],
    },
    timings: [
      { day: 'Monday', opens: '', closes: '', isClosed: false },
      { day: 'Tuesday', opens: '', closes: '', isClosed: false },
      { day: 'Wednesday', opens: '', closes: '', isClosed: false },
      { day: 'Thursday', opens: '', closes: '', isClosed: false },
      { day: 'Friday', opens: '', closes: '', isClosed: false },
      { day: 'Saturday', opens: '', closes: '', isClosed: false },
      { day: 'Sunday', opens: '', closes: '', isClosed: false },
    ],
    services: [
      {
        name: '',
        category: '',
        subServices: [{ name: '', duration: '', price: '', serviceImage: null }],
      },
    ],
    genderSpecific: 'female', // Added to match schema
    homeService: false, // Added to match schema
    // realTimeStatus: { isOpen: true, override: false, closureReason: '' }, // Removed
  });
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    timings: true,
    services: true,
  });
  const [imagePreviews, setImagePreviews] = useState({ shopImage: null, services: [] });
  const [isUploading, setIsUploading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFormData((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                coordinates: [position.coords.latitude, position.coords.longitude],
              },
            }));
            setLocationLoading(false);
          },
          (error) => {
            setLocationError('Unable to retrieve your location');
            setLocationLoading(false);
            console.error('Geolocation error:', error);
          }
        );
      } else {
        setLocationError('Geolocation is not supported by this browser');
      }
    };

    getLocation();
  }, []);

  const compressImage = async (file) => {
    if (!file) return null;
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image size exceeds ${maxSizeMB}MB`);
      return null;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/webp',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            'image/webp',
            0.7
          );
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    return () => {
      if (imagePreviews.shopImage) URL.revokeObjectURL(imagePreviews.shopImage);
      imagePreviews.services.forEach((service) =>
        service.subServices.forEach((url) => url && URL.revokeObjectURL(url))
      );
    };
  }, [imagePreviews]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleImageUpload = async (e, serviceIndex = null, subIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      const compressedFile = await compressImage(file);
      if (!compressedFile) return;

      const previewUrl = URL.createObjectURL(compressedFile);
      setImagePreviews((prev) => {
        if (serviceIndex !== null && subIndex !== null) {
          const updatedServices = [...(prev.services || [])];
          if (!updatedServices[serviceIndex]) {
            updatedServices[serviceIndex] = { subServices: [] };
          }
          updatedServices[serviceIndex].subServices[subIndex] = previewUrl;
          return { ...prev, services: updatedServices };
        }
        return { ...prev, shopImage: previewUrl };
      });

      setFormData((prev) => {
        if (serviceIndex !== null && subIndex !== null) {
          const updatedServices = [...prev.services];
          updatedServices[serviceIndex].subServices[subIndex] = {
            ...updatedServices[serviceIndex].subServices[subIndex],
            serviceImage: compressedFile,
          };
          return { ...prev, services: updatedServices };
        }
        return { ...prev, shopImage: compressedFile };
      });
    } catch (error) {
      toast.error('Failed to process image');
      console.error('Image processing error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e, section, index, subSection, subIndex) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      if (section === 'timings') {
        const updatedTimings = [...prev.timings];
        updatedTimings[index] = {
          ...updatedTimings[index],
          [name]: type === 'checkbox' ? checked : value,
        };
        return { ...prev, timings: updatedTimings };
      } else if (section === 'services' && subSection === 'subServices') {
        const updatedServices = [...prev.services];
        updatedServices[index].subServices[subIndex] = {
          ...updatedServices[index].subServices[subIndex],
          [name]: value,
        };
        return { ...prev, services: updatedServices };
      } else if (section === 'services') {
        const updatedServices = [...prev.services];
        updatedServices[index] = { ...updatedServices[index], [name]: value };
        return { ...prev, services: updatedServices };
      } else if (section === 'location') {
        return { ...prev, location: { ...prev.location, [name]: value } };
      }
      return { ...prev, [name]: value };
    });
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          name: '',
          category: '',
          subServices: [{ name: '', duration: '', price: '', serviceImage: null }],
        },
      ],
    }));
    setImagePreviews((prev) => ({
      ...prev,
      services: [...prev.services, { subServices: [] }],
    }));
  };

  const addSubService = (serviceIndex) => {
    setFormData((prev) => {
      const updatedServices = [...prev.services];
      updatedServices[serviceIndex].subServices.push({
        name: '',
        duration: '',
        price: '',
        serviceImage: null,
      });
      return { ...prev, services: updatedServices };
    });

    setImagePreviews((prev) => {
      const updatedServices = [...(prev.services || [])];
      while (updatedServices.length <= serviceIndex) {
        updatedServices.push({ subServices: [] });
      }
      updatedServices[serviceIndex].subServices = [
        ...(updatedServices[serviceIndex].subServices || []),
        null,
      ];
      return { ...prev, services: updatedServices };
    });
  };

  const removeService = (serviceIndex) => {
    if (formData.services.length > 1) {
      setFormData((prev) => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== serviceIndex),
      }));
      setImagePreviews((prev) => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== serviceIndex),
      }));
    }
  };

  const removeSubService = (serviceIndex, subIndex) => {
    if (formData.services[serviceIndex].subServices.length > 1) {
      setFormData((prev) => {
        const updatedServices = [...prev.services];
        updatedServices[serviceIndex].subServices = updatedServices[serviceIndex].subServices.filter(
          (_, i) => i !== subIndex
        );
        return { ...prev, services: updatedServices };
      });
      setImagePreviews((prev) => {
        const updatedServices = [...prev.services];
        updatedServices[serviceIndex].subServices = updatedServices[serviceIndex].subServices.filter(
          (_, i) => i !== subIndex
        );
        return { ...prev, services: updatedServices };
      });
    }
  };

  const removeImage = (serviceIndex = null, subIndex = null) => {
    setFormData((prev) => {
      if (serviceIndex !== null && subIndex !== null) {
        const updatedServices = [...prev.services];
        updatedServices[serviceIndex].subServices[subIndex] = {
          ...updatedServices[serviceIndex].subServices[subIndex],
          serviceImage: null,
        };
        return { ...prev, services: updatedServices };
      }
      return { ...prev, shopImage: null };
    });
    setImagePreviews((prev) => {
      if (serviceIndex !== null && subIndex !== null) {
        const updatedServices = [...prev.services];
        updatedServices[serviceIndex].subServices[subIndex] = null;
        return { ...prev, services: updatedServices };
      }
      return { ...prev, shopImage: null };
    });
  };

  const validateForm = () => {
    if (!formData.shopName.trim()) return 'Shop name is required';
    if (!formData.emailId.trim() || !/\S+@\S+\.\S+/.test(formData.emailId))
      return 'Valid email is required';
    if (!formData.location.address.trim()) return 'Address is required';
    if (!formData.location.city.trim()) return 'City is required';
    if (!formData.location.pincode.trim()) return 'Pincode is required';
    for (const service of formData.services) {
      if (!service.name.trim()) return 'Service name is required';
      if (!service.category.trim()) return 'Service category is required';
      for (const subService of service.subServices) {
        if (!subService.name.trim()) return 'Sub-service name is required';
        if (!subService.duration.trim()) return 'Sub-service duration is required';
        if (!subService.price.trim() || isNaN(subService.price))
          return 'Valid sub-service price is required';
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (formData.timings.length !== 7 || !formData.timings.every((t) => daysOfWeek.includes(t.day))) {
      toast.error('Timings must include exactly 7 days');
      return;
    }
    for (const timing of formData.timings) {
      if (!timing.isClosed && (!timing.opens || !timing.closes)) {
        toast.error(`Opening and closing times are required for ${timing.day} if not closed`);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('shopName', formData.shopName);
      formDataToSend.append('emailId', formData.emailId);
      formDataToSend.append('location', JSON.stringify(formData.location));
      formDataToSend.append('timings', JSON.stringify(formData.timings));
      formDataToSend.append('genderSpecific', formData.genderSpecific || 'female');
      formDataToSend.append('homeService', formData.homeService.toString());

      if (formData.shopImage instanceof File) {
        formDataToSend.append('shopImage', formData.shopImage);
      } else {
        toast.error('Shop image is required');
        return;
      }

      const services = formData.services.map((service) => ({
        ...service,
        subServices: service.subServices.map((subService) => ({
          ...subService,
          serviceImage: null,
        })),
      }));
      formDataToSend.append('services', JSON.stringify(services));

      formData.services.forEach((service) => {
        service.subServices.forEach((subService) => {
          if (subService.serviceImage instanceof File) {
            formDataToSend.append('subServiceImages', subService.serviceImage);
          }
        });
      });

      console.log('FormData entries:');
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      const result = await dispatch(createShop(formDataToSend)).unwrap();
      toast.success(result.message || 'Shop created successfully!');
      setFormData({
        shopName: '',
        shopImage: null,
        emailId: '',
        location: {
          address: '',
          city: '',
          pincode: '',
          coordinates: formData.location.coordinates,
        },
        timings: daysOfWeek.map((day) => ({ day, opens: '', closes: '', isClosed: false })),
        services: [
          {
            name: '',
            category: '',
            subServices: [{ name: '', duration: '', price: '', serviceImage: null }],
          },
        ],
        genderSpecific: 'female',
        homeService: false,
      });
      setImagePreviews({ shopImage: null, services: [] });
    } catch (error) {
      toast.error(error.message || 'Failed to create shop');
      console.error('Shop creation error:', error);
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex-1 py-3 pb-5 text-black">
        <h1 className="text-2xl font-bold p-4">Create Shop</h1>
        <div className="bg-white rounded-lg shadow md:p-6 mx-4">
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

          {locationError && (
            <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
              <p>{locationError} - Using default coordinates (0,0)</p>
            </div>
          )}

          {locationLoading && (
            <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded">
              <p>Detecting your location...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4 p-3">
              <div>
                <label htmlFor="shopName" className="label">
                  <span className="label-text font-medium">Shop Name</span>
                </label>
                <input
                  type="text"
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={(e) => handleChange(e)}
                  className="input text-purple-700 font-semibold input-bordered w-full bg-purple-100 border-1 border-purple-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                  required
                  placeholder="Enter shop name"
                />
              </div>

              <div>
                <label htmlFor="shopImage" className="label">
                  <span className="label-text font-medium">Shop Image</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.shopImage instanceof File ? formData.shopImage.name : ''}
                    className="input input-bordered w-full font-semibold text-purple-700 bg-purple-100 border-1 border-purple-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Upload an image"
                    readOnly
                  />
                  <label className="btn btn-outline border-purple-300 text-purple-700 hover:bg-purple-100">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </label>
                </div>
                {imagePreviews.shopImage && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={imagePreviews.shopImage}
                        alt="Shop preview"
                        className="h-20 w-20 object-cover rounded"
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

              <div>
                <label htmlFor="emailId" className="label">
                  <span className="label-text font-medium">Shop Email</span>
                </label>
                <input
                  type="email"
                  id="emailId"
                  name="emailId"
                  value={formData.emailId}
                  onChange={(e) => handleChange(e)}
                  className="input input-bordered w-full font-semibold text-purple-700 bg-purple-100 border-1 border-purple-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                  required
                  placeholder="shop@example.com"
                />
              </div>
            </div>

            <div className="border border-purple-600 rounded-2xl overflow-hidden">
              <div
                className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                onClick={() => toggleSection('location')}
              >
                <h3 className="text-lg font-medium">Location</h3>
                {expandedSections.location ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections.location && (
                <div className="p-4 space-y-4">
                  <div>
                    <label htmlFor="address" className="label">
                      <span className="label-text">Address</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.location.address}
                      onChange={(e) => handleChange(e, 'location')}
                      className="input input-bordered w-full font-semibold text-purple-700 bg-purple-100 border-1 border-purple-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                      required
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="label">
                        <span className="label-text">City</span>
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.location.city}
                        onChange={(e) => handleChange(e, 'location')}
                        className="input input-bordered w-full font-semibold text-purple-700 bg-purple-100 border-1 border-purple-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                        required
                        placeholder="City name"
                      />
                    </div>

                    <div>
                      <label htmlFor="pincode" className="label">
                        <span className="label-text">Pincode</span>
                      </label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        value={formData.location.pincode}
                        onChange={(e) => handleChange(e, 'location')}
                        className="input input-bordered w-full font-semibold text-purple-700 bg-purple-100 border-1 border-purple-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                        required
                        placeholder="Postal code"
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>
                      Location coordinates will be automatically detected:{' '}
                      {formData.location.coordinates[0]}, {formData.location.coordinates[1]}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border border-purple-600 rounded-2xl overflow-hidden">
              <div
                className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                onClick={() => toggleSection('timings')}
              >
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <h3 className="text-lg font-medium">Timings</h3>
                </div>
                {expandedSections.timings ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections.timings && (
                <div className="p-4 space-y-3">
                  {formData.timings.map((timing, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
                    >
                      <span className="w-24 text-sm font-medium text-purple-700">{timing.day}</span>

                      <div className="flex-1 grid grid-cols-3 sm:grid-cols-3 gap-3">
                        <div className="text-purple-900">
                          <label className="block text-sm font-semibold mb-1">Opening</label>
                          <input
                            type="time"
                            name="opens"
                            value={timing.opens}
                            onChange={(e) => handleChange(e, 'timings', index)}
                            className="input input-bordered w-full font-semibold text-purple-700 bg-purple-100 border border-purple-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-200"
                            disabled={timing.isClosed}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-purple-900 mb-1">
                            Closing
                          </label>
                          <input
                            type="time"
                            name="closes"
                            value={timing.closes}
                            onChange={(e) => handleChange(e, 'timings', index)}
                            className="input input-bordered w-full font-semibold text-purple-700 bg-purple-100 border border-purple-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-200"
                            disabled={timing.isClosed}
                          />
                        </div>

                        <div className="flex items-center mt-6 sm:mt-0">
                          <label className="label cursor-pointer gap-2">
                            <input
                              type="checkbox"
                              name="isClosed"
                              checked={timing.isClosed}
                              onChange={(e) => handleChange(e, 'timings', index)}
                              className="checkbox checkbox-primary"
                            />
                            <span className="label-text text-purple-900">Closed</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-purple-600 rounded-2xl pb-5 overflow-hidden">
              <div
                className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                onClick={() => toggleSection('services')}
              >
                <h3 className="text-lg font-medium">Services</h3>
                {expandedSections.services ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections.services && (
                <div className="space-y-4 p-3">
                  {formData.services.map((service, serviceIndex) => (
                    <div key={serviceIndex} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="label">
                              <span className="label-text">Service Name</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={service.name}
                              onChange={(e) => handleChange(e, 'services', serviceIndex)}
                              className="input input-bordered w-full font-semibold text-purple-700 bg-purple-100 border-1 border-purple-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                              required
                              placeholder="e.g. Hair Styling"
                            />
                          </div>

                          <div>
                            <label className="label">
                              <span className="label-text">Category</span>
                            </label>
                            <input
                              type="text"
                              name="category"
                              value={service.category}
                              onChange={(e) => handleChange(e, 'services', serviceIndex)}
                              className="input input-bordered w-full font-semibold text-purple-700 bg-purple-100 border-1 border-purple-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                              required
                              placeholder="e.g. Hair Services"
                            />
                          </div>
                        </div>

                        {formData.services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeService(serviceIndex)}
                            className="btn btn-sm btn-circle btn-error btn-outline ml-2"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Sub-Services</h4>
                        <div className="space-y-3">
                          {service.subServices.map((subService, subIndex) => (
                            <div key={subIndex} className="flex items-center gap-2">
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1">
                                <input
                                  type="text"
                                  name="name"
                                  value={subService.name}
                                  onChange={(e) =>
                                    handleChange(e, 'services', serviceIndex, 'subServices', subIndex)
                                  }
                                  placeholder="Name"
                                  className="input input-bordered w-full font-semibold text-purple-700 bg-purple-100 border-1 border-purple-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                  required
                                />
                                <input
                                  type="text"
                                  name="duration"
                                  value={subService.duration}
                                  onChange={(e) =>
                                    handleChange(e, 'services', serviceIndex, 'subServices', subIndex)
                                  }
                                  placeholder="Duration (e.g., 30min)"
                                  className="input input-bordered w-full font-semibold text-purple-700 bg-purple-100 border-1 border-purple-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                  required
                                />
                                <input
                                  type="number"
                                  name="price"
                                  value={subService.price}
                                  onChange={(e) =>
                                    handleChange(e, 'services', serviceIndex, 'subServices', subIndex)
                                  }
                                  placeholder="Price"
                                  className="input input-bordered w-full font-semibold text-purple-700 bg-purple-100 border-1 border-purple-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                  required
                                  min="0"
                                  step="0.01"
                                />
                                <div>
                                  <div className="flex gap-2 flex-wrap justify-start">
                                    <input
                                      type="text"
                                      value={
                                        subService.serviceImage instanceof File
                                          ? subService.serviceImage.name
                                          : ''
                                      }
                                      placeholder="Upload an image"
                                      className="input input-bordered w-full font-semibold text-purple-700 bg-purple-100 border-1 border-purple-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                                      readOnly
                                    />
                                    <label className="btn btn-outline border-purple-300 text-purple-700 hover:bg-purple-100">
                                      <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, serviceIndex, subIndex)}
                                        disabled={isUploading}
                                      />
                                      {isUploading ? 'Uploading...' : 'Upload'}
                                    </label>
                                  </div>
                                  {imagePreviews.services[serviceIndex]?.subServices[subIndex] && (
                                    <div className="mt-2">
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={imagePreviews.services[serviceIndex].subServices[subIndex]}
                                          alt="Sub-service preview"
                                          className="h-12 w-12 object-cover rounded"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeImage(serviceIndex, subIndex)}
                                          className="btn btn-xs btn-error"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {service.subServices.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSubService(serviceIndex, subIndex)}
                                  className="btn btn-sm btn-circle btn-error btn-outline"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => addSubService(serviceIndex)}
                          className="btn btn-sm btn-outline mt-2 border-0 text-white bg-purple-500 hover:bg-purple-700"
                        >
                          <Plus size={16} className="mr-1" />
                          Add Sub-Service
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addService}
                    className="btn btn-outline w-full mt-2 border-0 text-white bg-purple-500 hover:bg-purple-700"
                  >
                    <Plus size={16} className="mr-1" />
                    Add Service
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || isUploading || locationLoading}
                className={`btn border-0 bg-pink-500 text-white hover:bg-pink-600 ${
                  loading || isUploading ? 'loading' : ''
                }`}
              >
                Create Shop
              </button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CreateShop;