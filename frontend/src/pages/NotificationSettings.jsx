import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Phone, Mail, Save, AlertCircle, CheckCircle } from 'lucide-react';
import NotificationService from '../services/NotificationService';
import toast from 'react-hot-toast';

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    mobile: ''
  });
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    expiredItemsAlert: true,
    expiringItemsAlert: true,
    lowStockAlert: false,
    dailyDigest: false
  });

  // Fetch notification preferences on component mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user profile to get mobile number and email
        const userResponse = await fetch('http://localhost:3002/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const userData = await userResponse.json();
        
        setUserProfile({
          name: userData.name || '',
          email: userData.email || '',
          mobile: userData.mobile || ''
        });

        // Fetch notification preferences
        const preferencesData = await NotificationService.getUserNotificationPreferences();
        
        // If preferences exist, update state
        if (preferencesData) {
          setPreferences(preferencesData);
        }
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [navigate]);

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({ ...prev, [name]: checked }));
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Disable SMS notifications if no mobile number is provided
      const updatedPreferences = {
        ...preferences,
        smsNotifications: userProfile.mobile ? preferences.smsNotifications : false
      };
      
      await NotificationService.updateUserNotificationPreferences(updatedPreferences);
      toast.success('Notification preferences updated successfully');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      
    } finally {
      setSaving(false);
    }
  };

  const handleTestSms = async () => {
    if (!userProfile.mobile) {
      toast.error('Please add your mobile number in your profile first');
      return;
    }
    
    setTesting(true);
    try {
      await NotificationService.testSmsDelivery(userProfile.mobile);
      toast.success('Test SMS sent successfully to your mobile number');
    } catch (error) {
      console.error('Error sending test SMS:', error);
    
    } finally {
      setTesting(false);
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <Bell size={24} className="text-primary mr-3 dark:text-white" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
        </div>

        {!userProfile.mobile && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start dark:bg-yellow-900/30 dark:border-yellow-800">
            <AlertCircle size={20} className="text-yellow-600 mr-3 mt-0.5 flex-shrink-0 dark:text-yellow-500" />
            <div>
              <p className="text-yellow-800 font-medium dark:text-yellow-400">No Mobile Number Added</p>
              <p className="text-yellow-700 text-sm mt-1 dark:text-yellow-500">
                To receive SMS notifications, please add your mobile number in your profile.
                <button
                  onClick={() => navigate('/profile')}
                  className="ml-2 text-primary underline hover:text-primary-dark dark:text-blue-400"
                >
                  Update Profile
                </button>
              </p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Contact Information</h2>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
            <div className="flex items-center mb-3">
              <Mail size={18} className="text-gray-500 mr-2 dark:text-gray-300" />
              <p className="dark:text-white">{userProfile.email || 'No email address available'}</p>
            </div>
            <div className="flex items-center">
              <Phone size={18} className="text-gray-500 mr-2 dark:text-gray-300" />
              <p className="dark:text-white">
                {userProfile.mobile || 'No mobile number available'} 
                {!userProfile.mobile && (
                  <span className="text-sm text-gray-500 ml-2 dark:text-gray-400">(Required for SMS notifications)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSavePreferences}>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Notification Channels</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                <div className="flex items-center">
                  <Mail size={20} className="text-gray-600 mr-3 dark:text-gray-300" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={preferences.emailNotifications}
                    onChange={handleToggleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:bg-gray-600 dark:peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                <div className="flex items-center">
                  <Phone size={20} className="text-gray-600 mr-3 dark:text-gray-300" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">SMS Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via SMS to your mobile</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {userProfile.mobile && (
                    <button
                      type="button"
                      onClick={handleTestSms}
                      disabled={testing || !userProfile.mobile}
                      className="mr-4 text-sm text-primary hover:text-primary-dark dark:text-blue-400"
                    >
                      {testing ? 'Sending...' : 'Send Test SMS'}
                    </button>
                  )}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="smsNotifications"
                      checked={preferences.smsNotifications && !!userProfile.mobile}
                      onChange={handleToggleChange}
                      disabled={!userProfile.mobile}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:bg-gray-600 dark:peer-checked:bg-primary disabled:opacity-50"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Notification Types</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Expired Items Alerts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when items have expired</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="expiredItemsAlert"
                    checked={preferences.expiredItemsAlert}
                    onChange={handleToggleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:bg-gray-600 dark:peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Expiring Soon Alerts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about items expiring in the next 3 days</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="expiringItemsAlert"
                    checked={preferences.expiringItemsAlert}
                    onChange={handleToggleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:bg-gray-600 dark:peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Low Stock Alerts</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when inventory is running low</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="lowStockAlert"
                    checked={preferences.lowStockAlert}
                    onChange={handleToggleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:bg-gray-600 dark:peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-700 dark:border-gray-600">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Daily Digest</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive a daily summary of your inventory status</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="dailyDigest"
                    checked={preferences.dailyDigest}
                    onChange={handleToggleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:bg-gray-600 dark:peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center bg-primary text-white py-2 px-6 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationSettings;