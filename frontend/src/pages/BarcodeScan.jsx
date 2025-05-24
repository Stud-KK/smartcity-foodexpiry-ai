'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function BarcodeAndExpiryDateScan() {
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState('');
  const [success, setSuccess] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState({
    barcode: '',
    expiryDate: '',
    productName: '',
    category: '',
    quantity: 1,
    unit: 'item'
  });
  const [isReadyToSave, setIsReadyToSave] = useState(false);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  // Auto-save when extraction is complete and valid data is available
  useEffect(() => {
    if (isReadyToSave && extractedInfo.productName && extractedInfo.expiryDate) {
      saveToDatabase();
    }
  }, [isReadyToSave]);

  const handleCapture = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Reset states for new scan
      setIsReadyToSave(false);
      setSuccess(false);
      setStatus('');
      
      // Create preview of the image
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
        processImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (file) => {
    setScanning(true);
    setStatus('🔍 Scanning image for product information and expiry date...');

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      
      // Send image to backend for processing
      const res = await axios.post('http://localhost:3002/api/scan/extract-info', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data) {
        const { 
          barcode, 
          expiry_date, 
          product_name, 
          category = 'Uncategorized', 
          quantity = 1, 
          unit = 'item' 
        } = res.data;
        
        // Update extracted info with all data from image
        setExtractedInfo({
          barcode: barcode || '',
          expiryDate: expiry_date || '',
          productName: product_name || '',
          category: category || 'Uncategorized',
          quantity: quantity || 1,
          unit: unit || 'item'
        });

        // Validate if we have the minimum required information
        if (product_name && expiry_date) {
          setStatus('✅ Information extracted successfully! Ready to save');
          setIsReadyToSave(true);
        } else {
          setStatus('⚠️ Some required information could not be extracted. You can retry or save anyway.');
        }
      } else {
        throw new Error('Invalid response format from scanning API');
      }
    } catch (error) {
      console.error('Scanning error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setStatus(`❌ Error extracting information: ${errorMessage}`);
    } finally {
      setScanning(false);
    }
  };

  const saveToDatabase = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Create a new item object from extracted info
      const newItem = {
        name: extractedInfo.productName,
        category: extractedInfo.category,
        purchaseDate: new Date().toISOString().split('T')[0],
        expiryDate: extractedInfo.expiryDate,
        quantity: extractedInfo.quantity,
        unit: extractedInfo.unit,
        notes: extractedInfo.barcode ? `Barcode: ${extractedInfo.barcode}` : '',
      };

      const res = await axios.post('http://localhost:3002/api/items', newItem, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      setSuccess(true);
      setStatus('✅ Item saved successfully!');
      setTimeout(() => {
        navigate('/dashboard/home');
      }, 2000);
    } catch (error) {
      setStatus('❌ Error saving item: ' + (error.response?.data?.message || error.message));
      setIsReadyToSave(false);
    }
  };

  const handleCancel = () => {
    setImagePreview(null);
    setExtractedInfo({
      barcode: '',
      expiryDate: '',
      productName: '',
      category: '',
      quantity: 1,
      unit: 'item'
    });
    setIsReadyToSave(false);
    setStatus('❌ Canceled');
    navigate('/dashboard/home');
  };

  const handleRetry = () => {
    setImagePreview(null);
    setExtractedInfo({
      barcode: '',
      expiryDate: '',
      productName: '',
      category: '',
      quantity: 1,
      unit: 'item'
    });
    setIsReadyToSave(false);
    setStatus('🔄 Ready for new scan');
    fileInputRef.current.value = null;
  };

  // Calculate expiry status
  const getExpiryStatus = () => {
    if (!extractedInfo.expiryDate) return { status: 'unknown', text: 'Unknown' };
    
    const today = new Date();
    const expiryDate = new Date(extractedInfo.expiryDate);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', text: 'Expired' };
    if (diffDays <= 3) return { status: 'critical', text: 'Critical' };
    if (diffDays <= 7) return { status: 'warning', text: 'Warning' };
    return { status: 'good', text: 'Good' };
  };
  
  const expiryStatus = getExpiryStatus();

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded-xl shadow-md space-y-6 relative">
      <button
        className="absolute top-4 right-4 bg-gray-300 text-sm text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
        onClick={() => navigate('/dashboard/home')}
      >
        ← Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold text-gray-800">📷 Auto Scan & Save</h2>
      
      <div className="flex flex-col items-center space-y-4">
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
          capture="environment"
        />
        
        {/* Camera button */}
        <button
          onClick={handleCapture}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
          disabled={scanning}
        >
          <span className="mr-2">📷</span>
          {scanning ? 'Processing...' : 'Take Photo of Product'}
        </button>
        
        {/* Image preview area */}
        {imagePreview && (
          <div className="mt-4 border rounded-md overflow-hidden">
            <img 
              src={imagePreview} 
              alt="Captured" 
              className="w-full h-48 object-contain"
            />
          </div>
        )}
        
        {/* Extracted info display */}
        {(extractedInfo.productName || extractedInfo.expiryDate || extractedInfo.barcode) && (
          <div className="mt-4 w-full bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 text-lg mb-2">Extracted Information:</h3>
            
            <div className="space-y-3">
              {extractedInfo.productName && (
                <div className="bg-white p-3 rounded shadow-sm">
                  <span className="font-semibold">Product:</span> {extractedInfo.productName}
                </div>
              )}
              
              {extractedInfo.category && (
                <div className="bg-white p-3 rounded shadow-sm">
                  <span className="font-semibold">Category:</span> {extractedInfo.category}
                </div>
              )}
              
              {extractedInfo.expiryDate && (
                <div className={`bg-white p-3 rounded shadow-sm border-l-4 ${
                  expiryStatus.status === 'expired' ? 'border-red-500' :
                  expiryStatus.status === 'critical' ? 'border-orange-500' :
                  expiryStatus.status === 'warning' ? 'border-yellow-500' :
                  'border-green-500'
                }`}>
                  <div className="flex justify-between items-center">
                    <span><span className="font-semibold">Expires:</span> {extractedInfo.expiryDate}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      expiryStatus.status === 'expired' ? 'bg-red-100 text-red-800' :
                      expiryStatus.status === 'critical' ? 'bg-orange-100 text-orange-800' :
                      expiryStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {expiryStatus.text}
                    </span>
                  </div>
                </div>
              )}
              
              {extractedInfo.quantity && extractedInfo.unit && (
                <div className="bg-white p-3 rounded shadow-sm">
                  <span className="font-semibold">Quantity:</span> {extractedInfo.quantity} {extractedInfo.unit}
                </div>
              )}
              
              {extractedInfo.barcode && (
                <div className="bg-white p-3 rounded shadow-sm">
                  <span className="font-semibold">Barcode:</span> {extractedInfo.barcode}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {status && (
        <div className={`text-sm p-3 rounded ${
          status.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
          status.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
          status.includes('⚠️') ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>{status}</div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          ✅ Item saved successfully! Redirecting to dashboard...
        </div>
      )}

      {imagePreview && !success && (
        <div className="flex justify-between pt-4">
          <button
            onClick={handleCancel}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cancel
          </button>
          <button
            onClick={handleRetry}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            New Scan
          </button>
          <button
            onClick={saveToDatabase}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={!extractedInfo.productName || scanning}
          >
            Save Now
          </button>
        </div>
      )}
    </div>
  );
}