// services/imageProcessor.js - Image processing and information extraction
const { createWorker } = require('tesseract.js');
const Quagga = require('quagga').default; // Open source barcode scanner
const fs = require('fs');

/**
 * Extract expiry date from text using regex patterns
 * @param {string} text - Text extracted from image
 * @returns {string|null} - Formatted expiry date or null
 */
function extractExpiryDate(text) {
  // Common expiry date formats
  const patterns = [
    /(?:expiry|exp|exp date|best before|bb|use by|expiration)(?:\s|:)+(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
    /(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})(?:\s|:)*(?:expiry|exp|exp date|best before|bb|use by|expiration)/i,
    /(?:expiry|exp|best before|bb|use by):?\s*(\w+\s+\d{1,2}\s*,?\s*\d{4})/i,
    /(\d{2}[\/\.\-]\d{2}[\/\.\-]\d{2,4})/,
    /(\d{2}[\/\.\-]\w{3}[\/\.\-]\d{2,4})/
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Attempt to parse and standardize the date
      try {
        const dateStr = match[1].trim();
        const dateParts = dateStr.split(/[\/\.\-]/);
        
        // Handle different date formats
        let day, month, year;
        if (dateParts.length === 3) {
          // Try to determine format (DD/MM/YYYY or MM/DD/YYYY)
          if (dateParts[0].length === 4) { // YYYY/MM/DD format
            year = dateParts[0];
            month = dateParts[1];
            day = dateParts[2];
          } else if (parseInt(dateParts[0]) > 12) { // DD/MM/YYYY format (day > 12)
            day = dateParts[0];
            month = dateParts[1];
            year = dateParts[2];
          } else if (parseInt(dateParts[1]) > 12) { // MM/DD/YYYY format (month > 12)
            month = dateParts[0];
            day = dateParts[1];
            year = dateParts[2];
          } else {
            // Default to DD/MM/YYYY for ambiguous cases
            day = dateParts[0];
            month = dateParts[1];
            year = dateParts[2];
          }
          
          // Handle 2-digit year
          if (year.length === 2) {
            year = '20' + year; // Assume 2000s
          }
          
          // Format as YYYY-MM-DD for ISO
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
      
      // If parsing failed, return the raw match
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract product name from text
 * @param {string} text - Text extracted from image
 * @returns {string|null} - Product name or null
 */
function extractProductName(text) {
  // Common product name patterns
  const lines = text.split('\n').filter(line => line.trim());
  
  // Filter out lines that look like they're not product names
  const potentialNames = lines.filter(line => {
    const lowerLine = line.toLowerCase();
    return (
      !lowerLine.includes('expiry') &&
      !lowerLine.includes('exp date') &&
      !lowerLine.includes('best before') &&
      !lowerLine.match(/\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}/) && // Exclude dates
      line.length > 3 &&
      line.length < 100 // Not too long
    );
  });
  
  // Return the first potential product name
  return potentialNames.length > 0 ? potentialNames[0].trim() : null;
}

/**
 * Determine product category based on product name and OCR text
 * @param {string} productName - Extracted product name
 * @param {string} text - Full text extracted from image
 * @returns {string} - Product category
 */
function determineCategory(productName, text) {
  if (!productName) return 'Uncategorized';
  
  const categories = {
    Dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'dairy'],
    Meat: ['beef', 'chicken', 'pork', 'lamb', 'meat', 'steak', 'sausage'],
    Produce: ['apple', 'banana', 'vegetable', 'fruit', 'salad', 'fresh'],
    Bakery: ['bread', 'cake', 'pastry', 'baked', 'muffin', 'croissant'],
    Beverages: ['water', 'soda', 'juice', 'drink', 'tea', 'coffee'],
    Frozen: ['frozen', 'ice cream', 'freezer'],
    Pantry: ['canned', 'pasta', 'rice', 'cereal', 'soup', 'sauce'],
    Snacks: ['chips', 'cookie', 'snack', 'chocolate', 'candy']
  };
  
  const nameLower = productName.toLowerCase();
  const textLower = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    for (const keyword of keywords) {
      if (nameLower.includes(keyword) || textLower.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'Uncategorized';
}

/**
 * Extract barcode information from an image using Quagga
 * @param {string} imagePath - Path to image file
 * @returns {Promise<string|null>} - Barcode value or null
 */
function extractBarcode(imagePath) {
  return new Promise((resolve) => {
    try {
      Quagga.decodeSingle({
        decoder: {
          readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader"]
        },
        locate: true,
        src: fs.readFileSync(imagePath).toString('base64')
      }, (result) => {
        if (result && result.codeResult) {
          resolve(result.codeResult.code);
        } else {
          resolve(null);
        }
      });
    } catch (error) {
      console.error('Barcode reading error:', error);
      resolve(null);
    }
  });
}
const jsQR = require('jsqr');
const { createCanvas, loadImage } = require('canvas');


/**
 * Extract barcode information from an image using jsQR
 * @param {string} imagePath - Path to image file
 * @returns {Promise<string|null>} - QR code or barcode value or null
 */
async function extractBarcodeWithJsQR(imagePath) {
  try {
    // Load image
    const image = await loadImage(imagePath);
    
    // Create canvas and draw image
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    
    // Detect QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      return code.data;
    }
    
    return null;
  } catch (error) {
    console.error('jsQR extraction error:', error);
    return null;
  }
}

// Then in your extractInfoFromImage function, you would use:
// extractedInfo.barcode = await extractBarcodeWithJsQR(imagePath);

/**
 * Extract text from image using OCR
 * @param {string} imagePath - Path to image file
 * @returns {string} - Extracted text
 */
async function performOCR(imagePath) {
  try {
    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data } = await worker.recognize(imagePath);
    await worker.terminate();
    
    return data.text;
  } catch (error) {
    console.error('OCR error:', error);
    return '';
  }
}

/**
 * Main function to extract all information from an image
 * @param {string} imagePath - Path to image file
 * @returns {Object} - Extracted information
 */
async function extractInfoFromImage(imagePath) {
  // Initialize with default values
  let extractedInfo = {
    barcode: null,
    expiry_date: null,
    product_name: null,
    category: 'Uncategorized',
    quantity: 1,
    unit: 'item'
  };

  try {
    // Extract barcode using Quagga
    extractedInfo.barcode = await extractBarcode(imagePath);
    
    // If Quagga fails, try using OCR as a fallback for barcode
    if (!extractedInfo.barcode) {
      extractedInfo.barcode = await extractBarcodeWithOCR(imagePath);
    }
    
    // Perform OCR and extract text-based information
    const extractedText = await performOCR(imagePath);
    if (extractedText) {
      // Extract expiry date
      extractedInfo.expiry_date = extractExpiryDate(extractedText);
      
      // Extract product name
      extractedInfo.product_name = extractProductName(extractedText);
      
      // Determine category
      if (extractedInfo.product_name) {
        extractedInfo.category = determineCategory(extractedInfo.product_name, extractedText);
      }
    }
  } catch (error) {
    console.error('Error processing image:', error);
    // Continue with whatever information we have
  }
  
  return extractedInfo;
}

module.exports = {
  extractInfoFromImage,
  // Export individual functions for testing
  extractExpiryDate,
  extractProductName,
  determineCategory,
  extractBarcode,
  performOCR
};