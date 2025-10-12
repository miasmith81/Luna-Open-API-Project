    document.addEventListener("DOMContentLoaded", function() {
        // Navigation functionality
        const navLinks = document.querySelectorAll("nav ul li a");
        navLinks.forEach(link => {
            link.addEventListener("click", function(event) {
                event.preventDefault();
                const targetId = this.getAttribute("href");
                const targetSection = document.querySelector(targetId);
                targetSection.scrollIntoView({ behavior: "smooth" });
            });
        });

        // Load featured artworks on page load
        loadFeaturedArtworks();

        // Search functionality event listeners
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    performSearch();
                }
            });
        }

        // Random artwork functionality
        const randomBtn = document.getElementById('random-btn');
        if (randomBtn) {
            randomBtn.addEventListener('click', loadRandomArtwork);
        }
    });

    /**
     * Load and display featured artworks
     */
    async function loadFeaturedArtworks() {
        try {
            console.log('Loading featured artworks...');
            const data = await fetchArtworks(12);
            
            const gallery = document.getElementById('featured-gallery');
            const loadingMessage = document.getElementById('loading-featured');
            
            if (!gallery || !loadingMessage) {
                console.error('Gallery or loading message element not found');
                return;
            }

            // Clear gallery
            gallery.innerHTML = '';
            
            if (data.data && data.data.length > 0) {
                // Filter artworks that have images
                const artworksWithImages = data.data.filter(artwork => artwork.image_id);
                
                artworksWithImages.forEach(artwork => {
                    const card = createArtworkCard(artwork);
                    gallery.appendChild(card);
                });

                // If we have fewer artworks with images, try to get more
                if (artworksWithImages.length < 8) {
                    console.log('Getting additional artworks with images...');
                    const additionalData = await fetchArtworks(20, 2);
                    if (additionalData.data) {
                        const moreArtworks = additionalData.data
                            .filter(artwork => artwork.image_id)
                            .slice(0, 12 - artworksWithImages.length);
                        
                        moreArtworks.forEach(artwork => {
                            const card = createArtworkCard(artwork);
                            gallery.appendChild(card);
                        });
                    }
                }
            } else {
                gallery.innerHTML = '<p>No artworks found. Please try again later.</p>';
            }
            
            // Hide loading message
            loadingMessage.style.display = 'none';
            
        } catch (error) {
            console.error('Error loading featured artworks:', error);
            const gallery = document.getElementById('featured-gallery');
            const loadingMessage = document.getElementById('loading-featured');
            
            if (gallery) {
                gallery.innerHTML = '<p>Error loading artworks. Please try again later.</p>';
            }
            if (loadingMessage) {
                loadingMessage.style.display = 'none';
            }
        }
    }

    /**
     * Create an artwork card element
     */
    function createArtworkCard(artwork) {
        const card = document.createElement('div');
        card.className = 'artwork-card';
        
        const imageUrl = artwork.image_id ? getImageUrl(artwork.image_id, '400') : null;
        const title = artwork.title || 'Untitled';
        const artist = artwork.artist_display || 'Unknown Artist';
        
        if (imageUrl) {
            card.innerHTML = `
                <img src="${imageUrl}" alt="${title}" onerror="this.style.display='none'">
                <div class="artwork-title">${title}</div>
                <div class="artwork-artist">${artist}</div>
            `;
        } else {
            // Skip artworks without images for featured gallery
            card.innerHTML = `
                <div class="artwork-title">${title}</div>
                <div class="artwork-artist">${artist}</div>
                <p style="font-style: italic; color: #999;">Image not available</p>
            `;
        }
        
        return card;
    }

    /**
     * Perform search functionality
     */
    async function performSearch() {
        try {
            const searchInput = document.getElementById('search-input');
            const searchResults = document.getElementById('search-results');
            const noResults = document.getElementById('no-results');
            
            if (!searchInput || !searchResults || !noResults) {
                console.error('Search elements not found');
                return;
            }

            const query = searchInput.value.trim();
            
            if (!query) {
                alert('Please enter a search term');
                return;
            }

            // Show loading state
            searchResults.innerHTML = '<p>Searching...</p>';
            noResults.style.display = 'none';
            
            console.log(`Searching for: ${query}`);
            const data = await searchArtworks(query, 20);
            
            // Clear search results
            searchResults.innerHTML = '';
            
            if (data.data && data.data.length > 0) {
                // Get full artwork details for search results since search API returns limited info
                const artworkPromises = data.data.slice(0, 12).map(async (result) => {
                    try {
                        const fullArtwork = await fetchArtworkById(result.id);
                        return fullArtwork.data;
                    } catch (error) {
                        console.error(`Error fetching artwork ${result.id}:`, error);
                        return null;
                    }
                });

                const artworks = await Promise.all(artworkPromises);
                const validArtworks = artworks.filter(artwork => artwork !== null);

                if (validArtworks.length > 0) {
                    validArtworks.forEach(artwork => {
                        const card = createArtworkCard(artwork);
                        searchResults.appendChild(card);
                    });
                } else {
                    noResults.style.display = 'block';
                }
            } else {
                noResults.style.display = 'block';
            }
            
        } catch (error) {
            console.error('Error performing search:', error);
            const searchResults = document.getElementById('search-results');
            if (searchResults) {
                searchResults.innerHTML = '<p>Error performing search. Please try again.</p>';
            }
        }
    }

    /**
     * Load and display a random artwork
     */
    async function loadRandomArtwork() {
        try {
            const randomArtworkDiv = document.getElementById('random-artwork');
            const randomBtn = document.getElementById('random-btn');
            
            if (!randomArtworkDiv || !randomBtn) {
                console.error('Random artwork elements not found');
                return;
            }

            // Show loading state
            randomBtn.textContent = 'Loading...';
            randomBtn.disabled = true;
            randomArtworkDiv.innerHTML = '<p>Loading random artwork...</p>';
            
            // Generate random page number between 1 and 100
            const randomPage = Math.floor(Math.random() * 100) + 1;
            console.log(`Getting random artwork from page ${randomPage}`);
            
            const data = await fetchArtworks(1, randomPage);
            
            if (data.data && data.data.length > 0) {
                const artwork = data.data[0];
                
                // Get full artwork details
                const fullArtworkData = await fetchArtworkById(artwork.id);
                const fullArtwork = fullArtworkData.data;
                
                displayRandomArtwork(fullArtwork, randomArtworkDiv);
            } else {
                randomArtworkDiv.innerHTML = '<p>No artwork found. Please try again.</p>';
            }
            
        } catch (error) {
            console.error('Error loading random artwork:', error);
            const randomArtworkDiv = document.getElementById('random-artwork');
            if (randomArtworkDiv) {
                randomArtworkDiv.innerHTML = '<p>Error loading random artwork. Please try again.</p>';
            }
        } finally {
            // Reset button
            const randomBtn = document.getElementById('random-btn');
            if (randomBtn) {
                randomBtn.textContent = 'Show Me Art!';
                randomBtn.disabled = false;
            }
        }
    }

    /**
     * Display a random artwork in the single artwork container
     */
    function displayRandomArtwork(artwork, container) {
        const title = artwork.title || 'Untitled';
        const artist = artwork.artist_display || 'Unknown Artist';
        const date = artwork.date_display || 'Date unknown';
        const description = artwork.description || artwork.short_description || '';
        
        let imageHtml = '';
        if (artwork.image_id) {
            const imageUrl = getImageUrl(artwork.image_id, '1686');
            imageHtml = `<img src="${imageUrl}" alt="${title}" onerror="this.style.display='none'">`;
        }
        
        // Clean up description HTML tags if present
        const cleanDescription = description.replace(/<[^>]*>/g, '').substring(0, 500);
        
        container.innerHTML = `
            ${imageHtml}
            <div class="artwork-details">
                <h3>${title}</h3>
                <p class="artist">${artist}</p>
                <p class="date">${date}</p>
                ${cleanDescription ? `<p class="description">${cleanDescription}${cleanDescription.length === 500 ? '...' : ''}</p>` : ''}
            </div>
        `;
    }