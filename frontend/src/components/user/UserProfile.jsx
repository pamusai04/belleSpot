
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../hooks/useUser';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import { useFilter } from '../../hooks/useFilter';
import { MapContainer, TileLayer } from 'react-leaflet';
import { DraggableMarker, MapHandler } from '../../components/map/MapComponents';
import { searchLocation, reverseGeocode } from '../../components/map/MapUtils';
import 'leaflet/dist/leaflet.css';

const UserProfile = () => {
  const { activeButton } = useFilter();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    profile,
    loading,
    error,
    successMessage,
    fetchProfile,
    updateProfile,
    clearUserError,
    clearUserSuccess,
  } = useUser();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    profilePhoto: null,
    location: { type: 'Point', coordinates: [0, 0] },
    currentPassword: '',
    password: '',
  });
  const [previewImage, setPreviewImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapLoading, setIsMapLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!profile && !loading) {
      try {
       fetchProfile();
      } catch (error) {
        toast.error(error.message || 'Failed to load profile data. Please try again later.');
      }
    }
  }, [fetchProfile, profile, loading]);

  useEffect(() => {
    loadProfile();
    return () => {
      if (previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [loadProfile, previewImage]);

  useEffect(() => {
    if (profile) {
      try {
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          gender: profile.gender || '',
          profilePhoto: null,
          location: profile.location || { type: 'Point', coordinates: [0, 0] },
          currentPassword: '',
          password: '',
        });
        const photoUrl = profile.profilePhoto?.url
          ? `${profile.profilePhoto.url}?t=${new Date().getTime()}`
          : process.env.REACT_APP_DEFAULT_PROFILE_PHOTO || '/default-avatar.jpg';
        setPreviewImage(photoUrl);
      } catch (error) {
        toast.error('Error displaying profile data');
      }
    }
  }, [profile]);

  useEffect(() => {
    const fetchAddress = async () => {
      if (formData.location?.coordinates?.length === 2) {
        setIsMapLoading(true);
        try {
          const [lng, lat] = formData.location.coordinates;
          const result = await reverseGeocode(lat, lng);
          if (result.address) {
            const displayName =
              result.display_name ||
              `${result.address.road || ''} ${result.address.house_number || ''}, ${
                result.address.city || result.address.town || result.address.village || ''
              }`;
            setAddress(displayName);
          }
        } catch (error) {
          setAddress('Address not available');
        } finally {
          setIsMapLoading(false);
        }
      }
    };
    fetchAddress();
  }, [formData.location]);

  useEffect(() => {
    if (error) {
      const errorMessage =
        error.status === 429
          ? 'Too many requests, please try again later.'
          : error.message || 'An error occurred while processing your request';
      toast.error(errorMessage);
      clearUserError();
    }
    if (successMessage) {
      toast.success(successMessage);
      clearUserSuccess();
    }
  }, [error, successMessage, clearUserError, clearUserSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    try {
      const file = e.target.files[0];
      if (!file) {
        setFormData((prev) => ({ ...prev, profilePhoto: null }));
        setPreviewImage(profile?.profilePhoto?.url || process.env.REACT_APP_DEFAULT_PROFILE_PHOTO || '/default-avatar.jpg');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        setFormData((prev) => ({ ...prev, profilePhoto: null }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        setFormData((prev) => ({ ...prev, profilePhoto: null }));
        return;
      }
      setFormData((prev) => ({ ...prev, profilePhoto: file }));
      setPreviewImage(URL.createObjectURL(file));
    } catch (error) {
      toast.error('Failed to process the image');
      setFormData((prev) => ({ ...prev, profilePhoto: null }));
    }
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setIsMapLoading(true);
    try {
      const results = await searchLocation(searchQuery);
      if (results.length > 0) {
        const firstResult = results[0];
        const newLocation = {
          type: 'Point',
          coordinates: [parseFloat(firstResult.lon), parseFloat(firstResult.lat)],
        };
        setFormData((prev) => ({
          ...prev,
          location: newLocation,
        }));
        setAddress(firstResult.display_name);
        setSearchQuery('');
      } else {
        toast.error('Location not found');
      }
    } catch (error) {
      toast.error('Failed to search location');
    } finally {
      setIsMapLoading(false);
    }
  };

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    const newLocation = {
      type: 'Point',
      coordinates: [lng, lat],
    };
    setFormData((prev) => ({
      ...prev,
      location: newLocation,
    }));
  };

  const handleMarkerDrag = (pos) => {
    const newLocation = {
      type: 'Point',
      coordinates: [pos.lng, pos.lat],
    };
    setFormData((prev) => ({
      ...prev,
      location: newLocation,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!formData.firstName || !formData.lastName) {
        throw new Error('First name and last name are required');
      }
      const submissionData = new FormData();
      submissionData.append('firstName', formData.firstName);
      submissionData.append('lastName', formData.lastName);
      submissionData.append('gender', formData.gender || '');
      if (formData.location) {
        submissionData.append('location', JSON.stringify(formData.location));
      }
      if (formData.password) {
        if (!formData.currentPassword) {
          throw new Error('Current password is required to update password');
        }
        submissionData.append('password', formData.password);
        submissionData.append('currentPassword', formData.currentPassword);
      }
      if (formData.profilePhoto instanceof File) {
        submissionData.append('profilePhoto', formData.profilePhoto);
      }
       updateProfile(submissionData);
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        password: '',
        profilePhoto: null,
      }));
      setPreviewImage(profile?.profilePhoto?.url || process.env.REACT_APP_DEFAULT_PROFILE_PHOTO || '/default-avatar.jpg');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex-1 md:ml-64 py-3 pb-5 flex items-center justify-center">
        <span className="loading loading-spinner loading-xl border-purple-700"></span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 md:ml-64 py-3 pb-5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">No profile data available</p>
          <button
            onClick={loadProfile}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 md:ml-64 py-3 pb-5 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
        <div className="rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-1/3 flex flex-col items-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-gray-200 mb-4">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = process.env.REACT_APP_DEFAULT_PROFILE_PHOTO || '/default-avatar.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                </div>
                <label className="cursor-pointer font-semibold bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition">
                  Change Photo
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">JPEG or PNG, max 5MB</p>
              </div>
              <div className="w-full lg:w-2/3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border bg-purple-100 border-purple-300 text-purple-600 font-semibold  rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border bg-purple-100 border-purple-300 text-purple-600 font-semibold  rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <div className="dropdown dropdown-bottom w-full">
                    <div
                      tabIndex={0}
                      role="button"
                      className="w-full px-4 py-2 border bg-purple-100 border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 text-left flex justify-between items-center"
                    >
                      {formData.gender ? (
                        <span className="text-purple-600 font-semibold capitalize">{formData.gender}</span>
                      ) : (
                        <span className="text-gray-400">Select Gender</span>
                      )}
                      <span>⬇️</span>
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu bg-gray-100 rounded-lg z-10 w-full shadow-md mt-1 border border-gray-200"
                    >
                      <li>
                        <button
                          type="button"
                          className="px-4 py-2 text-left font-semibold hover:bg-purple-200 text-purple-600"
                          onClick={() => handleChange({ target: { name: 'gender', value: '' } })}
                        >
                          Select Gender
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="px-4 py-2 text-left hover:bg-purple-200 text-purple-600"
                          onClick={() => handleChange({ target: { name: 'gender', value: 'male' } })}
                        >
                          Male
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="px-4 py-2 text-left hover:bg-purple-200 text-purple-600"
                          onClick={() => handleChange({ target: { name: 'gender', value: 'female' } })}
                        >
                          Female
                        </button>
                      </li>
                      <li>
                        <button
                          type="button"
                          className="px-4 py-2 text-left hover:bg-purple-200 text-purple-600"
                          onClick={() => handleChange({ target: { name: 'gender', value: 'other' } })}
                        >
                          Other
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-purple-600 font-semibold bg-purple-100 border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 pr-10"
                    placeholder="Enter current password"
                    required={formData.password !== ''}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-gray-500 hover:text-purple-600"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">Required only if updating password</p>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border text-purple-600 font-semibold bg-purple-100 border-purple-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-gray-500 hover:text-purple-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 8 characters with uppercase, lowercase, number, and symbol
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="flex mb-2 flex-col gap-1 sm:flex-row sm:gap-0">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for a location..."
                      className="flex-1 px-4 py-2 border text-purple-600 font-semibold bg-purple-100 border-purple-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-purple-600"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
                    />
                    <button
                      onClick={handleSearchLocation}
                      className="bg-purple-500 text-white px-4 py-2 rounded-sm hover:bg-purple-600 transition"
                      disabled={isMapLoading}
                    >
                      {isMapLoading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                  <div className="h-64 bg-gray-100 rounded-lg overflow-hidden z-10 relative">
                    {isMapLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    ) : (
                      formData.location?.coordinates?.length === 2 && (
                        <MapContainer
                          center={[formData.location.coordinates[1], formData.location.coordinates[0]]}
                          zoom={13}
                          style={{ height: '100%', width: '100%' }}
                          onClick={handleMapClick}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <DraggableMarker
                            position={[formData.location.coordinates[1], formData.location.coordinates[0]]}
                            setPosition={handleMarkerDrag}
                          />
                          <MapHandler position={[formData.location.coordinates[1], formData.location.coordinates[0]]} />
                        </MapContainer>
                      )
                    )}
                  </div>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">{address || 'Location not set'}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-purple-500 font-semibold text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
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
                        Updating...
                      </span>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
