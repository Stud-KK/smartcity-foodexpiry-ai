import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Phone, Mail, Home, Utensils, Camera, Save, Bell } from 'lucide-react';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    role: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();
  
  // Base API URL constant to ensure consistency
  const API_BASE_URL = 'http://localhost:3002';

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserData({
          name: response.data.name || '',
          email: response.data.email || '',
          mobile: response.data.mobile || '',
          address: response.data.address || '',
          role: response.data.role || '',
          bio: response.data.bio || ''
        });

        // Properly handle the profile image path
        if (response.data.profileImage) {
          // Check if the image path is already a full URL or just a relative path
          const imageUrl = response.data.profileImage.startsWith('http') 
            ? response.data.profileImage 
            : `${API_BASE_URL}/${response.data.profileImage.replace(/^\//, '')}`;
          
          console.log("Original image path:", response.data.profileImage);
          console.log("Constructed image URL:", imageUrl);
          
          setImagePreview(imageUrl);
        }
      } catch (error) {
        setError('Failed to load profile. Please try again.');
        console.error('Error fetching profile:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  // Upload profile image immediately when selected
  const uploadProfileImage = async (file) => {
    setUploadingImage(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/users/profile/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Update the image preview with the path returned from server
      if (response.data.profileImage) {
        // Ensure proper URL construction
        const imageUrl = response.data.profileImage.startsWith('http') 
          ? response.data.profileImage 
          : `${API_BASE_URL}/${response.data.profileImage.replace(/^\//, '')}`;
        
        console.log("Updated image path:", response.data.profileImage);
        console.log("Updated image URL:", imageUrl);
        
        setImagePreview(imageUrl);
      }
      
      setSuccess('Profile image updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload profile image. Please try again.');
      console.error('Error uploading profile image:', error);
      // Reset preview on error
      if (imagePreview && imagePreview.startsWith('data:')) {
        fetchCurrentProfileImage();
      }
    } finally {
      setUploadingImage(false);
      setProfileImage(null); // Clear the file input state
    }
  };

  // Fetch current profile image from server
  const fetchCurrentProfileImage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.profileImage) {
        // Ensure proper URL construction
        const imageUrl = response.data.profileImage.startsWith('http') 
          ? response.data.profileImage 
          : `${API_BASE_URL}/${response.data.profileImage.replace(/^\//, '')}`;
        
        setImagePreview(imageUrl);
      } else {
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error fetching current profile image:', error);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Upload to server immediately
      await uploadProfileImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('email', userData.email);
      formData.append('mobile', userData.mobile);
      formData.append('address', userData.address);
      formData.append('bio', userData.bio);
      
      // No need to append profile image here as it's uploaded separately

      const response = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
      console.error('Error updating profile:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-primary mb-8">My Profile</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Notification Settings Link */}
        <div className="mb-8 flex justify-end">
          <Link 
            to="/notifications" 
            className="flex items-center text-primary hover:text-primary-dark"
          >
            <Bell size={18} className="mr-2" />
            Manage Notification Settings
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 mb-4">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover border-4 border-primary"
                  onError={(e) => {
                    console.error("Image failed to load:", imagePreview);
                    e.target.onerror = null;
                    e.target.src = ""; // Set to a default image path if needed
                    setImagePreview(null);
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center border-4 border-primary">
                  <User size={64} className="text-gray-400" />
                </div>
              )}
              <label htmlFor="profileImage" className={`absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary-dark ${uploadingImage ? 'opacity-50' : ''}`}>
                {uploadingImage ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera size={18} />
                )}
                <input 
                  type="file" 
                  id="profileImage" 
                  onChange={handleImageChange} 
                  accept="image/jpeg,image/jpg,image/png" 
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">
              {uploadingImage ? 'Uploading image...' : 'Click the camera icon to update your profile picture'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="relative">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  className="w-full pl-10 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="w-full pl-10 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-gray-100"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Mobile Field */}
            <div>
              <label htmlFor="mobile" className="block text-gray-700 font-medium mb-2">Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={userData.mobile}
                  onChange={handleChange}
                  className="w-full pl-10 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your mobile number"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Add your mobile number to receive SMS notifications</p>
            </div>

            {/* Address Field */}
            <div>
              <label htmlFor="address" className="block text-gray-700 font-medium mb-2">Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Home size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={userData.address}
                  onChange={handleChange}
                  className="w-full pl-10 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your address"
                />
              </div>
            </div>
          </div>

          {/* Role Indicator */}
          <div>
          <label className="block text-gray-700 font-medium mb-2">Account Type</label>
            <div className="flex items-center px-4 py-2 border rounded-xl bg-gray-50">
              {userData.role === 'restaurant' ? (
                <>
                  <Utensils size={18} className="text-primary mr-2" />
                  <span>Restaurant Account</span>
                </>
              ) : (
                <>
                  <Home size={18} className="text-primary mr-2" />
                  <span>Home Account</span>
                </>
              )}
            </div>
          </div>

          {/* Bio Field */}
          <div>
            <label htmlFor="bio" className="block text-gray-700 font-medium mb-2">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={userData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Tell us a bit about yourself..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={updating}
            className={`w-full md:w-auto flex items-center justify-center bg-primary text-white py-3 px-6 rounded-xl font-semibold transition-colors hover:bg-primary-dark ${updating ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Save size={18} className="mr-2" />
            {updating ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;