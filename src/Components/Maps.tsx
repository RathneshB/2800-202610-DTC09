import { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        google: any;
    }
}

const Maps = () => {
    const addressInputRef = useRef<HTMLInputElement>(null);
    const responseContainerRef = useRef<HTMLDivElement>(null);
    const responseCodeRef = useRef<HTMLElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [address, setAddress] = useState('');

    // Use refs to maintain state across renders
    const geocoderRef = useRef<any>(null);
    const innerMapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    useEffect(() => {
        const loadMapsAndInit = async () => {
            try {
                // Check if script already loaded
                if (window.google && window.google.maps) {
                    await init();
                    return;
                }

                // Load Google Maps script
                const scriptTag = document.createElement('script');
                scriptTag.type = 'text/javascript';
                scriptTag.async = true;
                scriptTag.defer = true;
                scriptTag.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDgN2cLXfleSohBEmifsxF0iLjiU_U6xCI`;

                scriptTag.onload = async () => {
                    // Wait a moment for Google Maps to fully initialize
                    setTimeout(async () => {
                        await init();
                    }, 100);
                };

                scriptTag.onerror = () => {
                    console.error('Failed to load Google Maps API');
                };

                document.head.appendChild(scriptTag);
            } catch (error) {
                console.error('Error loading maps:', error);
            }
        };

        loadMapsAndInit();
    }, []);

    const init = async () => {
        try {
            // Wait for map container to be available
            if (!mapContainerRef.current) {
                console.warn('Map container not available');
                return;
            }

            const { Geocoder } = await window.google.maps.importLibrary('geocoding');
            const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
            const { ControlPosition } = await window.google.maps.importLibrary('core');

            innerMapRef.current = new window.google.maps.Map(mapContainerRef.current, {
                mapTypeControl: false,
                fullscreenControl: false,
                cameraControlOptions: {
                    position: ControlPosition.INLINE_START_BLOCK_END,
                },
                draggableCursor: 'crosshair',
                center: { lat: -34.397, lng: 150.644 },
                zoom: 10,
            });

            geocoderRef.current = new Geocoder();
            markerRef.current = new AdvancedMarkerElement();

            // Add event listeners
            innerMapRef.current.addListener('click', (e: any) => {
                void geocode({ location: e.latLng });
            });

            clear();
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    };

    const geocode = async (request: any) => {
        clear();

        try {
            if (!geocoderRef.current || !innerMapRef.current) {
                console.error('Map not initialized');
                return;
            }

            const { LatLng } = await window.google.maps.importLibrary('core');
            const response = await geocoderRef.current.geocode(request);
            const { results } = response;

            if (results && results.length > 0) {
                innerMapRef.current.setCenter(results[0].geometry.location);
                markerRef.current.position = new LatLng(results[0].geometry.location);
                markerRef.current.map = innerMapRef.current;

                if (responseContainerRef.current && responseCodeRef.current) {
                    responseContainerRef.current.style.display = 'block';
                    responseCodeRef.current.innerText = JSON.stringify(response, null, 2);
                }
            }
            return results;
        } catch (e) {
            alert('Geocode was not successful for the following reason: ' + String(e));
        }
    };

    const clear = () => {
        if (markerRef.current) {
            markerRef.current.map = null;
        }
        if (responseContainerRef.current) {
            responseContainerRef.current.style.display = 'none';
        }
    };

    const handleSubmit = () => {
        if (addressInputRef.current && addressInputRef.current.value) {
            void geocode({ address: addressInputRef.current.value });
        }
    };

    return (
        <div style={{
            margin: '0.5rem 0',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '0.5rem',
            alignItems: 'center',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                border: '2px solid #5d866c',
                borderRadius: '1rem',
                backgroundColor: '#f5f3f1',
                fontSize: '1.125rem',
                maxHeight: 'min-content'
            }}>
                <input
                    ref={addressInputRef}
                    type="text"
                    id="address"
                    placeholder="Enter an address or click the map to reverse geocode."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{
                        flex: 1,
                        color: '#0D0A0B',
                        backgroundColor: '#F3EFF5',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        padding: '0 0.5rem',
                        maxWidth: '130%',
                        outline: 'none',
                        border: 'none',
                        borderRadius: '1rem'
                    }}
                />
                <button style={{ border: 'none', background: 'none' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
                        fill="none" stroke="#0D0A0B" strokeWidth="2" strokeLinecap="round"
                        strokeLinejoin="round">
                        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
                        <path d="M21 21l-6 -6" />
                    </svg>
                </button>
                <br />
                <input type="button" id="submit" value="Geocode" onClick={handleSubmit} />
                <input type="button" id="clear" value="Clear Results" onClick={clear} />
                <br />
            </div>
            <div ref={responseContainerRef} id="response-container" className="response-container">
                <code ref={responseCodeRef} id="response"></code>
            </div>
            <div ref={mapContainerRef} id="map" style={{ width: '100%', height: '600px' }}></div>
        </div>
    );
}
export default Maps;