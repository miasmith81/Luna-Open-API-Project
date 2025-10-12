/**
 * Art Institute of Chicago API Functions
 * 
 * API Documentation: https://api.artic.edu/docs/
 * 
 * RATE LIMITING NOTE:
 * Please throttle API requests to no more than 1 request per second
 * as recommended by the API documentation to be respectful of their servers.
 */

// Base URL for the Art Institute of Chicago API
const ARTIC_API_BASE = 'https://api.artic.edu/api/v1';

// IIIF Image API base URL
const IIIF_BASE = 'https://www.artic.edu/iiif/2';

/**
 * Tests connectivity to the Art Institute API
 * @returns {Promise<boolean>} Promise that resolves to true if API is accessible
 */
async function testAPIConnection() {
    try {
        console.log('🔍 Testing API connectivity...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for test
        
        const response = await fetch(`${ARTIC_API_BASE}/artworks?limit=1`, {
            method: 'GET', // Changed from HEAD to GET since API doesn't support HEAD
            headers: {
                'Accept': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            console.log('✅ API connection successful');
            return true;
        } else {
            console.log(`❌ API returned status: ${response.status}`);
            return false;
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('❌ API connection timed out');
        } else {
            console.log('❌ API connection failed:', error.message);
        }
        return false;
    }
}

/**
 * Fetches artworks from the Art Institute of Chicago API
 * @param {number} limit - Number of artworks to return (default: 10)
 * @param {number} page - Page number for pagination (default: 1)
 * @param {string} fields - Comma-separated string of specific fields to return (optional)
 * @returns {Promise<Object>} Promise that resolves to the API response
 * @example
 * // Basic usage
 * const artworks = await fetchArtworks();
 * 
 * // With parameters
 * const artworks = await fetchArtworks(20, 2, 'id,title,artist_display,image_id');
 */
async function fetchArtworks(limit = 10, page = 1, fields = null) {
    try {
        // Build URL with parameters
        let url = `${ARTIC_API_BASE}/artworks?limit=${limit}&page=${page}`;
        
        if (fields) {
            url += `&fields=${encodeURIComponent(fields)}`;
        }
        
        console.log(`Fetching from: ${url}`);
        
        // Add timeout and better error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('Response received:', data);
        console.log('Data structure:', Object.keys(data));
        
        if (data.data) {
            console.log(`Retrieved ${data.data.length} artworks`);
            console.log('Pagination info:', data.pagination);
        }
        
        return data;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Request timed out after 10 seconds');
            throw new Error('API request timed out. Please check your internet connection and try again.');
        } else if (error.message.includes('ERR_TIMED_OUT')) {
            console.error('Network timeout error');
            throw new Error('Network timeout. The Art Institute API may be temporarily unavailable.');
        } else if (error.message.includes('CORS')) {
            console.error('CORS error detected');
            throw new Error('Cross-origin request blocked. You may need to serve this from a web server.');
        } else {
            console.error('Error fetching artworks:', error);
            throw new Error(`Failed to fetch artworks: ${error.message}`);
        }
    }
}

/**
 * Fetches a single artwork by its ID from the Art Institute of Chicago API
 * @param {number} id - The artwork ID to fetch
 * @returns {Promise<Object>} Promise that resolves to the artwork data
 * @example
 * // Fetch Starry Night and the Astronauts
 * const artwork = await fetchArtworkById(129884);
 */
async function fetchArtworkById(id) {
    try {
        const url = `${ARTIC_API_BASE}/artworks/${id}`;
        
        console.log(`Fetching from: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('Response received:', data);
        console.log('Data structure:', Object.keys(data));
        
        if (data.data) {
            console.log(`Retrieved artwork: ${data.data.title || 'Unknown Title'}`);
            console.log(`Artist: ${data.data.artist_display || 'Unknown Artist'}`);
        }
        
        return data;
        
    } catch (error) {
        console.error(`Error fetching artwork ${id}:`, error);
        throw error;
    }
}

/**
 * Generates a IIIF image URL for an artwork
 * @param {string} imageId - The image_id from the artwork data
 * @param {string} size - Image size ('200', '400', '843', '1686', or 'full') (default: '843')
 * @returns {string} The complete IIIF image URL
 * @example
 * // Standard size
 * const imageUrl = getImageUrl('b272df73-a965-ac37-4172-be4e99483637');
 * 
 * // Large size
 * const largeImageUrl = getImageUrl('b272df73-a965-ac37-4172-be4e99483637', '1686');
 * 
 * // Full resolution
 * const fullImageUrl = getImageUrl('b272df73-a965-ac37-4172-be4e99483637', 'full');
 */
function getImageUrl(imageId, size = '843') {
    if (!imageId) {
        console.warn('No image_id provided to getImageUrl');
        return null;
    }
    
    const url = `${IIIF_BASE}/${imageId}/full/${size},/0/default.jpg`;
    console.log(`Generated image URL: ${url}`);
    
    return url;
}

/**
 * Searches for artworks using the Art Institute of Chicago API search endpoint
 * @param {string} query - Search query string
 * @param {number} limit - Number of results to return (default: 10)
 * @returns {Promise<Object>} Promise that resolves to the search results
 * @example
 * // Search for Monet artworks
 * const results = await searchArtworks('monet');
 * 
 * // Search with custom limit
 * const results = await searchArtworks('impressionist', 20);
 */
async function searchArtworks(query, limit = 10) {
    try {
        const url = `${ARTIC_API_BASE}/artworks/search?q=${encodeURIComponent(query)}&limit=${limit}`;
        
        console.log(`Fetching from: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('Response received:', data);
        console.log('Data structure:', Object.keys(data));
        
        if (data.data) {
            console.log(`Found ${data.data.length} search results for "${query}"`);
            console.log('Pagination info:', data.pagination);
        }
        
        return data;
        
    } catch (error) {
        console.error(`Error searching for "${query}":`, error);
        throw error;
    }
}

/**
 * Test function to demonstrate all API functionality
 * @example
 * // Run all tests
 * testAPI();
 */
async function testAPI() {
    console.log('🎨 Starting Art Institute of Chicago API Tests...\n');
    
    // First test connectivity
    const isConnected = await testAPIConnection();
    if (!isConnected) {
        console.log('⚠️  API connectivity issues detected. You may experience errors.');
        console.log('💡 Troubleshooting tips:');
        console.log('   • Check your internet connection');
        console.log('   • Try serving this page from a local web server (e.g., python -m http.server)');
        console.log('   • The Art Institute API may be temporarily unavailable');
        console.log('\n' + '='.repeat(50) + '\n');
    }
    
    try {
        // Test 1: Fetch general artworks
        console.log('📋 Test 1: Fetching 10 artworks...');
        const artworks = await fetchArtworks();
        
        if (artworks.data && artworks.data.length > 0) {
            console.log(`✅ Successfully fetched ${artworks.data.length} artworks`);
            
            // Show first artwork details
            const firstArtwork = artworks.data[0];
            console.log(`   First artwork: "${firstArtwork.title}" by ${firstArtwork.artist_display}`);
            
            // Test image URL generation for first artwork
            if (firstArtwork.image_id) {
                const imageUrl = getImageUrl(firstArtwork.image_id);
                console.log(`   Image URL: ${imageUrl}`);
            }
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Add delay to respect rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test 2: Fetch specific artwork by ID
        console.log('🖼️  Test 2: Fetching artwork by ID (129884 - Starry Night and the Astronauts)...');
        const specificArtwork = await fetchArtworkById(129884);
        
        if (specificArtwork.data) {
            console.log(`✅ Successfully fetched: "${specificArtwork.data.title}"`);
            console.log(`   Artist: ${specificArtwork.data.artist_display}`);
            console.log(`   Date: ${specificArtwork.data.date_display}`);
            
            if (specificArtwork.data.image_id) {
                const largeImageUrl = getImageUrl(specificArtwork.data.image_id, '1686');
                console.log(`   Large image URL: ${largeImageUrl}`);
            }
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Add delay to respect rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test 3: Search for Monet artworks
        console.log('🔍 Test 3: Searching for "monet" artworks...');
        const searchResults = await searchArtworks('monet');
        
        if (searchResults.data && searchResults.data.length > 0) {
            console.log(`✅ Found ${searchResults.data.length} results for "monet"`);
            
            // Show first few search results
            searchResults.data.slice(0, 3).forEach((artwork, index) => {
                console.log(`   ${index + 1}. "${artwork.title}" (ID: ${artwork.id})`);
            });
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        console.log('🎉 All API tests completed successfully!');
        
        // Display summary
        console.log('\n📊 Test Summary:');
        console.log(`   • General artworks: ${artworks.data ? artworks.data.length : 0} retrieved`);
        console.log(`   • Specific artwork: ${specificArtwork.data ? 'Retrieved' : 'Failed'}`);
        console.log(`   • Search results: ${searchResults.data ? searchResults.data.length : 0} found`);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// Make functions globally accessible
window.fetchArtworks = fetchArtworks;
window.fetchArtworkById = fetchArtworkById;
window.getImageUrl = getImageUrl;
window.searchArtworks = searchArtworks;
window.testAPI = testAPI;
window.testAPIConnection = testAPIConnection;

console.log('🎨 Art Institute of Chicago API functions loaded!');
console.log('Available functions: fetchArtworks, fetchArtworkById, getImageUrl, searchArtworks, testAPI, testAPIConnection');
console.log('💡 If you\'re experiencing timeout errors:');
console.log('   1. Run testAPIConnection() to check connectivity');
console.log('   2. Make sure you\'re serving from a web server (not file://)');
console.log('   3. Check your internet connection');
console.log('Run testAPI() to test all functions.');