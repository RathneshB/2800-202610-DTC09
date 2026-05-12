import { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        google: any;
    }
}

const Maps = () => {
    const mapContainerRef =
        useRef<HTMLDivElement | null>(null);

    const mapRef = useRef<any>(null);

    const markerRef = useRef<any>(null);

    const geocoderRef = useRef<any>(null);

    const [address, setAddress] = useState('');

    const [responseData, setResponseData] =
        useState<any>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadGoogleMaps = async () => {
            try {
                // Already loaded
                if (window.google?.maps) {
                    await initMap();
                    return;
                }

                const script =
                    document.createElement('script');

                script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env
                    .VITE_GOOGLE_MAPS_API_KEY
                    }&v=weekly`;

                script.async = true;
                script.defer = true;

                script.onload = async () => {
                    if (!mounted) return;

                    await initMap();
                };

                script.onerror = () => {
                    console.error(
                        'Failed to load Google Maps'
                    );
                };

                document.head.appendChild(script);
            } catch (error) {
                console.error(
                    'Google Maps load error:',
                    error
                );
            }
        };

        const initMap = async () => {
            if (!mapContainerRef.current) return;

            try {
                const google = window.google;

                const { Geocoder } =
                    await google.maps.importLibrary(
                        'geocoding'
                    );

                const { AdvancedMarkerElement } =
                    await google.maps.importLibrary(
                        'marker'
                    );

                geocoderRef.current =
                    new Geocoder();

                mapRef.current =
                    new google.maps.Map(
                        mapContainerRef.current,
                        {
                            center: {
                                lat: 37.7749,
                                lng: -122.4194,
                            },

                            zoom: 10,
                            mapTypeControl: false,
                            fullscreenControl: false,
                            // mapId: 'c0e0fa051cca30ea4942062a',
                        }
                    );

                markerRef.current =
                    new AdvancedMarkerElement({
                        map: mapRef.current,
                    });

                mapRef.current.addListener(
                    'click',
                    async (e: any) => {
                        if (e.latLng) {
                            await geocode({
                                location: e.latLng,
                            });
                        }
                    }
                );

                setLoading(false);
            } catch (error) {
                console.error(
                    'Map initialization error:',
                    error
                );
            }
        };

        loadGoogleMaps();

        return () => {
            mounted = false;

            if (markerRef.current) {
                markerRef.current.map = null;
            }
        };
    }, []);

    const clear = () => {
        if (markerRef.current) {
            markerRef.current.map = null;
        }

        setResponseData(null);
    };

    const geocode = async (request: any) => {
        try {
            clear();

            if (
                !geocoderRef.current ||
                !mapRef.current
            ) {
                return;
            }

            const response =
                await geocoderRef.current.geocode(
                    request
                );

            if (!response.results.length) {
                alert('No results found');
                return;
            }

            const result = response.results[0];

            mapRef.current.setCenter(
                result.geometry.location
            );

            markerRef.current.position =
                result.geometry.location;

            markerRef.current.map =
                mapRef.current;

            setResponseData(response);
        } catch (error) {
            console.error(
                'Geocoding failed:',
                error
            );

            alert(
                'Geocoding failed: ' + String(error)
            );
        }
    };

    const handleSubmit = async () => {
        if (!address.trim()) return;

        await geocode({
            address,
        });
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                width: '100%',
                padding: '1rem',
            }}
        >
            {/* Controls */}
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                }}
            >
                <input
                    type="text"
                    placeholder="Enter address..."
                    value={address}
                    onChange={(e) =>
                        setAddress(e.target.value)
                    }
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            void handleSubmit();
                        }
                    }}
                    style={{
                        flex: 1,
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: '1px solid #ccc',
                        fontSize: '1rem',
                    }}
                />

                <button
                    onClick={() =>
                        void handleSubmit()
                    }
                    style={{
                        padding: '1rem',
                        cursor: 'pointer',
                    }}
                >
                    Geocode
                </button>

                <button
                    onClick={clear}
                    style={{
                        padding: '1rem',
                        cursor: 'pointer',
                    }}
                >
                    Clear
                </button>
            </div>

            {/* JSON Response */}
            {responseData && (
                <div
                    style={{
                        background: '#111',
                        color: '#fff',
                        padding: '1rem',
                        borderRadius: '1rem',
                        overflow: 'auto',
                        maxHeight: '300px',
                    }}
                >
                    <pre>
                        {JSON.stringify(
                            responseData,
                            null,
                            2
                        )}
                    </pre>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div>
                    Loading Google Maps...
                </div>
            )}

            {/* Map */}
            <div
                ref={mapContainerRef}
                style={{
                    width: '100%',
                    height: '600px',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                }}
            />
        </div>
    );
};

export default Maps;