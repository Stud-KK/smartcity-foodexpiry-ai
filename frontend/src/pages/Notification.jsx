import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, BellOff, Smartphone, Mail, Save, AlertTriangle, Check, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const Notification = () => {
  const navigate = useNavigate();
  const { refreshNotifications } = useNotifications();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    expiryNotifications: true,
    lowStockNotifications: true,
    reminderTime: 3, // days before expiry
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userInfo, setUserInfo] = useState({
    mobile: '',
    email: ''
  });
  const [testStatus, setTestStatus] = useState({
    sending: false,
    success: false,
    error: null
  });

  // Fetch notification settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Get user notification settings
        const response = await axios.get('http://localhost:3002/api/users/notification-settings', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Get user profile to check mobile and email
        const profileResponse = await axios.get('http://localhost:3002/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserInfo({
          mobile: profileResponse.data.mobile || '',
          email: profileResponse.data.email || ''
        });

        if (response.data) {
          setSettings({
            emailNotifications: response.data.emailNotifications ?? true,
            smsNotifications: response.data.smsNotifications ?? false,
            expiryNotifications: response.data.expiryNotifications ?? true,
            lowStockNotifications: response.data.lowStockNotifications ?? true,
            reminderTime: response.data.reminderTime ?? 3,
          });
        }
      } catch (error) {
        setError('Failed to load notification settings. Please try again.');
        console.error('Error fetching notification settings:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Submit notification settings
      await axios.post(
        'http://localhost:3002/api/users/notification-settings',
        settings,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Notification settings updated successfully!');
      refreshNotifications(); // Refresh notification context
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update notification settings. Please try again.');
      console.error('Error updating notification settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async (type) => {
    setTestStatus({
      sending: true,
      success: false,
      error: null
    });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post(
        'http://localhost:3002/api/users/send-test-notification',
        { type },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTestStatus({
        sending: false,
        success: true,
        error: null
      });

      setTimeout(() => {
        setTestStatus({
          sending: false,
          success: false,
          error: null
        });
      }, 3000);
    } catch (error) {
      setTestStatus({
        sending: false,
        success: false,
        error: error.response?.data?.message || 'Failed to send test notification'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-primary mb-8">Notification Settings</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <Check size={20} className="mr-2" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notification Channels Section */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Notification Channels</h2>
            
            {/* Email Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div className="flex items-center">
                <Mail size={20} className="text-primary mr-3" />
                <div>
                  <h3 className="font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email: {userInfo.email}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            {/* SMS Notifications */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <Smartphone size={20} className="text-primary mr-3" />
                <div>
                  <h3 className="font-medium">SMS Notifications</h3>
                  {userInfo.mobile ? (
                    <p className="text-sm text-gray-500">
                      Receive notifications via SMS: {userInfo.mobile}
                    </p>
                  ) : (
                    <p className="text-sm text-red-500">
                      Please add a mobile number in your profile to enable SMS notifications
                    </p>
                  )}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={handleChange}
                  disabled={!userInfo.mobile}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 ${!userInfo.mobile ? 'bg-gray-300' : 'bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20'} rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary`}></div>
              </label>
            </div>

            {/* Test Notification Buttons */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => sendTestNotification('email')}
                disabled={!settings.emailNotifications || testStatus.sending}
                className={`px-4 py-2 text-sm rounded-lg flex items-center justify-center ${
                  settings.emailNotifications 
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {testStatus.sending ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Mail size={16} className="mr-2" />
                )}
                Test Email Notification
              </button>
              
              <button
                type="button"
                onClick={() => sendTestNotification('sms')}
                disabled={!settings.smsNotifications || !userInfo.mobile || testStatus.sending}
                className={`px-4 py-2 text-sm rounded-lg flex items-center justify-center ${
                  settings.smsNotifications && userInfo.mobile
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {testStatus.sending ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Smartphone size={16} className="mr-2" />
                )}
                Test SMS Notification
              </button>
            </div>
            
            {testStatus.success && (
              <div className="mt-3 p-2 bg-green-100 text-green-700 text-sm rounded flex items-center">
                <Check size={16} className="mr-2" />
                Test notification sent successfully!
              </div>
            )}
            
            {testStatus.error && (
              <div className="mt-3 p-2 bg-red-100 text-red-700 text-sm rounded flex items-center">
                <X size={16} className="mr-2" />
                {testStatus.error}
              </div>
            )}
          </div>

          {/* Notification Types Section */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Notification Types</h2>
            
            {/* Expiry Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="font-medium">Item Expiry Notifications</h3>
                <p className="text-sm text-gray-500">
                  Get notified about items that are about to expire
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="expiryNotifications"
                  checked={settings.expiryNotifications}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            {/* Low Stock Notifications */}
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium">Low Stock Notifications</h3>
                <p className="text-sm text-gray-500">
                  Get notified when items are running low in inventory
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="lowStockNotifications"
                  checked={settings.lowStockNotifications}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          {/* Notification Timing */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Notification Timing</h2>
            <div className="mb-4">
              <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-1">
                Send expiry notifications
              </label>
              <div className="flex items-center">
                <select
                  id="reminderTime"
                  name="reminderTime"
                  value={settings.reminderTime}
                  onChange={handleChange}
                  className="mt-1 block w-full md:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                >
                  <option value="1">1 day</option>
                  <option value="2">2 days</option>
                  <option value="3">3 days</option>
                  <option value="5">5 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                </select>
                <span className="ml-2 text-gray-600">before items expire</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full md:w-auto flex items-center justify-center bg-primary text-white py-3 px-6 rounded-xl font-semibold transition-colors hover:bg-primary-dark ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                Save Settings
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Notification;