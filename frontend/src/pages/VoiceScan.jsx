'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function VoiceScan() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('');
  const [success, setSuccess] = useState(false);
  const [predictedDays, setPredictedDays] = useState(null);
  const [predictedExpiryDate, setPredictedExpiryDate] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    storage: '',
    category: '',
    condition: '',
  });
  const [apiError, setApiError] = useState(null);
  
  // Use ref to track the latest form data
  const formDataRef = useRef(formData);

  // Update ref whenever state changes
  React.useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const navigate = useNavigate();

  const questions = [
    'What is the name of the product?',
    'What is the storage condition? Say Freeze, Room Temperature or Fridge.',
    'What is the category? Say Uncategorized, Dairy and Eggs, Fruits and Vegetables, Bakery, Meat and Seafood or Pantry.',
    'What is the item condition? Say Fresh, Sealed & Intact, Minor Defect, Overripe, Leaky Pack, Discolored, Damaged Pack, Slightly Bruised, Spoiled or Near Expiry.'
  ];

  const speakQuestion = (text, callback) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.onend = () => setTimeout(callback, 500);
    synth.speak(utter);
  };

  const startVoiceFlow = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech Recognition not supported in this browser.');
      return;
    }

    // Reset form data when starting a new flow
    const initialFormData = {
      name: '',
      storage: '',
      category: '',
      condition: '',
    };
    setFormData(initialFormData);
    formDataRef.current = initialFormData; // Also update the ref
    
    setPredictedDays(null);
    setPredictedExpiryDate('');
    setCurrentQuestion(0);
    setApiError(null);

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    const askAndListen = (stepIndex) => {
      setCurrentQuestion(stepIndex);
      
      if (stepIndex >= questions.length) {
        setStatus('✅ All answers received!');
        
        // Directly use the ref data which is always up-to-date
        const finalData = { ...formDataRef.current };
        console.log("Final form data before API call:", finalData);
        
        // Log the product name specifically
        console.log("Product name before API call:", finalData.name);
        
        // Manual check for product name
        if (!finalData.name || finalData.name.trim() === '') {
          setStatus('❌ Error: Product name is missing. Please retry.');
          setApiError('Product name is required');
          return;
        }
        
        // Wait a bit before making the API call
        setTimeout(() => {
          getPredictionFromAPI(finalData);
        }, 800);
        return;
      }

      speakQuestion(questions[stepIndex], () => {
        recognition.start();

        recognition.onstart = () => {
          setIsListening(true);
          setStatus(`🎤 Listening: ${questions[stepIndex]}`);
        };

        recognition.onresult = (event) => {
          const result = event.results[0][0].transcript.trim().toLowerCase();
          console.log(`Question ${stepIndex} result:`, result);
          
          // Update the form data based on the current step
          setFormData(prevData => {
            const newData = { ...prevData };
            
            if (stepIndex === 0) {
              newData.name = result;
              console.log("Setting product name to:", result);
            }
            if (stepIndex === 1) {
              // Normalize storage conditions
              if (result.includes('room') || result.includes('temp')) {
                newData.storage = 'Room Temperature';
              } else if (result.includes('fridge') || result.includes('refrigerator')) {
                newData.storage = 'Fridge';
              } else if (result.includes('freeze')) {
                newData.storage = 'Freeze';
              } else {
                newData.storage = result;
              }
            }
            if (stepIndex === 2) {
              // Normalize category names
              if (result.includes('dairy') || result.includes('egg')) {
                newData.category = 'Dairy and Eggs';
              } else if (result.includes('fruit') || result.includes('vegetable')) {
                newData.category = 'Fruits and Vegetables';
              } else if (result.includes('bakery')) {
                newData.category = 'Bakery';
              } else if (result.includes('meat') || result.includes('seafood')) {
                newData.category = 'Meat and Seafood';
              } else if (result.includes('pantry')) {
                newData.category = 'Pantry';
              } else {
                newData.category = 'Uncategorized';
              }
            }
            if (stepIndex === 3) {
              // Normalize condition
              if (result.includes('sealed') || result.includes('intact')) {
                newData.condition = 'Sealed & Intact';
              } else if (result.includes('fresh')) {
                newData.condition = 'Fresh';
              } else if (result.includes('minor') || result.includes('defect')) {
                newData.condition = 'Minor Defect';
              } else if (result.includes('overripe')) {
                newData.condition = 'Overripe';
              } else if (result.includes('leaky')) {
                newData.condition = 'Leaky Pack';
              } else if (result.includes('discolor')) {
                newData.condition = 'Discolored';
              } else if (result.includes('damaged')) {
                newData.condition = 'Damaged Pack';
              } else if (result.includes('bruised')) {
                newData.condition = 'Slightly Bruised';
              } else if (result.includes('spoiled')) {
                newData.condition = 'Spoiled';
              } else if (result.includes('expiry') || result.includes('near')) {
                newData.condition = 'Near Expiry';
              } else {
                newData.condition = result;
              }
            }
            
            // Update ref right away too
            formDataRef.current = newData;
            return newData;
          });

          setIsListening(false);
          recognition.stop();
          
          // Show feedback about what was captured
          setStatus(`✓ Recorded: "${result}"`);
          
          // Delay before moving to the next question to allow user to see what was captured
          setTimeout(() => {
            askAndListen(stepIndex + 1);
          }, 1800); // Longer delay so user can see what was captured
        };

        recognition.onerror = (event) => {
          setStatus(`❌ Error: ${event.error}`);
          setIsListening(false);
          recognition.stop();
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      });
    };

    askAndListen(0);
  };

  const getPredictionFromAPI = async (data) => {
    setStatus('🔮 Getting expiry prediction...');
    setApiError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Make sure we have a product name before sending
      if (!data.name || data.name.trim() === '') {
        console.error("Product name is missing in API call");
        throw new Error('Product name is required');
      }

      // Prepare the data for the API - ensure all required fields have values
      const requestData = {
        product_name: data.name.trim(),
        storage_condition: data.storage || 'Room Temperature',
        item_condition_on_purchase: data.condition || 'Fresh'
      };

      // Log the data being sent to API for debugging
      console.log('Sending prediction request with data:', JSON.stringify(requestData, null, 2));
      setStatus(`🔮 Getting prediction for: "${requestData.product_name}"`);

      const res = await axios.post('http://localhost:3002/api/items/predict-expiry', requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Prediction response:', res.data);

      if (res.data && res.data.predicted_days) {
        setPredictedDays(res.data.predicted_days);
        setPredictedExpiryDate(res.data.predicted_expiry_date);
        setStatus('✅ Prediction complete!');
      } else {
        // Handle case where API returns a response but without predicted_days
        const errorMsg = 'API response missing prediction data';
        setApiError(errorMsg);
        setStatus(`❌ Error: ${errorMsg}`);
        console.error(errorMsg, res.data);
      }
    } catch (error) {
      console.error('Prediction error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setApiError(errorMessage);
      setStatus(`❌ Error getting prediction: ${errorMessage}`);
      
      // If the token is invalid, redirect to login
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  // Added for manual testing when speech recognition fails
  const manualTest = () => {
    const testData = {
      name: "Test Apple",
      storage: "Fridge",
      category: "Fruits and Vegetables",
      condition: "Fresh"
    };
    
    setFormData(testData);
    formDataRef.current = testData;
    setCurrentQuestion(questions.length); // Mark all questions as completed
    
    console.log("Manual test with data:", testData);
    getPredictionFromAPI(testData);
  };

  const testAPI = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      // Simple test data
      const testData = {
        product_name: "Test Apple",
        storage_condition: "Fridge",
        item_condition_on_purchase: "Fresh"
      };
      
      console.log('Testing API with data:', testData);
      setStatus('🔬 Testing API connection...');
      
      const response = await axios.post('http://localhost:3002/api/items/predict-expiry', 
        testData, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('API Test Response:', response.data);
      setStatus('✅ API test successful! Check console for details.');
    } catch (error) {
      console.error('API Test Error:', error);
      setStatus(`❌ API test failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const saveToDatabase = async () => {
    setStatus('💾 Saving item to database...');
    
    // Only allow saving if we have a valid prediction
    if (!predictedDays || !predictedExpiryDate) {
      setStatus('❌ Cannot save without a valid expiry prediction');
      return;
    }
    
    // Use the current form data from ref
    const currentFormData = formDataRef.current;
    
    const newItem = {
      name: currentFormData.name,
      category: currentFormData.category,
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: predictedExpiryDate,
      quantity: 1,
      unit: 'item',
      notes: `Storage: ${currentFormData.storage}, Condition: ${currentFormData.condition}`,
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      console.log('Saving item with data:', newItem);
      
      const res = await axios.post('http://localhost:3002/api/items', newItem, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Save response:', res.data);
      
      setSuccess(true);
      setStatus('✅ Item saved successfully!');
      setTimeout(() => {
        setSuccess(false);
        navigate('/dashboard/home');
      }, 2000);
    } catch (error) {
      console.error('Save error:', error);
      setStatus(`❌ Error saving item: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      
      // If the token is invalid, redirect to login
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleCancel = (destination) => {
    setFormData({ name: '', storage: '', category: '', condition: '' });
    formDataRef.current = { name: '', storage: '', category: '', condition: '' };
    setPredictedDays(null);
    setPredictedExpiryDate('');
    setApiError(null);
    setStatus('❌ Canceled');
    navigate(destination);
  };

  const handleRetry = () => {
    setFormData({ name: '', storage: '', category: '', condition: '' });
    formDataRef.current = { name: '', storage: '', category: '', condition: '' };
    setPredictedDays(null);
    setPredictedExpiryDate('');
    setApiError(null);
    setStatus('🔄 Retrying...');
    startVoiceFlow();
  };

  const handleBackToDashboard = (destination) => {
    navigate(destination);
  };

  // Determine the active question
  const getQuestionStatus = (index) => {
    if (index < currentQuestion) return "completed";
    if (index === currentQuestion) return "active";
    return "pending";
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded-xl shadow-md space-y-6 relative">
      <button
        className="absolute top-4 right-4 bg-gray-300 text-sm text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
        onClick={() => handleBackToDashboard('/dashboard/home')}
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold text-gray-800">🎤 Voice Scan Page</h2>

      <button
        onClick={startVoiceFlow}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={isListening}
      >
        {isListening ? 'Listening...' : 'Start Voice Scan'}
      </button>


      {/* Current Form Data Debug - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-2 rounded border border-gray-300 mt-2 text-xs">
          <div className="font-bold mb-1">Current Form Data:</div>
          <div>Name: {formData.name || '(empty)'}</div>
          <div>Storage: {formData.storage || '(empty)'}</div>
          <div>Category: {formData.category || '(empty)'}</div>
          <div>Condition: {formData.condition || '(empty)'}</div>
        </div>
      )}

      {/* Voice Input Progress Indicator */}
      <div className="space-y-3 mt-4">
        {questions.map((question, idx) => (
          <div 
            key={idx} 
            className={`p-3 rounded-md ${
              getQuestionStatus(idx) === "completed" ? "bg-green-50 border border-green-200" : 
              getQuestionStatus(idx) === "active" ? "bg-blue-50 border border-blue-200 shadow-sm" : 
              "bg-gray-50 border border-gray-200 opacity-70"
            }`}
          >
            <div className="text-sm font-medium mb-1 flex items-center">
              {getQuestionStatus(idx) === "completed" && <span className="mr-1 text-green-500">✓</span>}
              {getQuestionStatus(idx) === "active" && <span className="mr-1 text-blue-500">●</span>}
              {getQuestionStatus(idx) === "pending" && <span className="mr-1 text-gray-400">○</span>}
              {question}
            </div>
            
            {idx === 0 && formData.name && (
              <div className="text-gray-800 font-medium pl-5">"{formData.name}"</div>
            )}
            {idx === 1 && formData.storage && (
              <div className="text-gray-800 font-medium pl-5">"{formData.storage}"</div>
            )}
            {idx === 2 && formData.category && (
              <div className="text-gray-800 font-medium pl-5">"{formData.category}"</div>
            )}
            {idx === 3 && formData.condition && (
              <div className="text-gray-800 font-medium pl-5">"{formData.condition}"</div>
            )}
          </div>
        ))}
      </div>

      {predictedDays !== null && (
        <div className="mt-4 text-blue-700 text-sm bg-blue-100 p-3 rounded border border-blue-300">
          🧠 <strong>Predicted Expiry:</strong> {predictedDays} days from today ({predictedExpiryDate})
        </div>
      )}

      {apiError && (
        <div className="mt-4 text-red-700 text-sm bg-red-100 p-3 rounded border border-red-300">
          ⚠️ <strong>API Error:</strong> {apiError}. Please retry or check API connection.
        </div>
      )}

      {status && <div className="text-sm p-2 rounded bg-gray-50 text-gray-700">{status}</div>}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          ✅ Item saved successfully!
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={() => handleCancel('/dashboard/home')}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cancel
        </button>
        <button
          onClick={handleRetry}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Retry
        </button>
        <button
          onClick={saveToDatabase}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={!formData.name || currentQuestion < questions.length || !predictedDays}
        >
          Save
        </button>
      </div>
    </div>
  );
} 