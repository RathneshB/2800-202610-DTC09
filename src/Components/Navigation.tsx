
import { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        google: any;
    }
}

const Navigation = () => {
    const mapContainerRef =
        useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const geocoderRef = useRef<any>(null);
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number} | null>(null);
    useEffect(() => {
        let mounted = true;

        const loadGoogleMaps = async () => {
            try {
                if (window.google?.maps) {
                    await initMap();
                    return;
                }

                const script =
                    document.createElement('script');

                script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY
                    }&v=weekly`;

                script.async = true;
                script.defer = true;

                script.onload = async () => {
                    if (!mounted) return;

                    await initMap();
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
                            mapId: 'c0e0fa051cca30ea4942062a',
                            zoom: 10,
                            mapTypeControl: false,
                            fullscreenControl: false,
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
        setAddress('');
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

    const goToMylocation = () => {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported on your browser');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async(position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setUserLocation({ lat, lng});

          if(mapRef.current) {
            mapRef.current.setCenter({lat, lng});
            mapRef.current.setZoom(10);
            if (markerRef.current) {
              markerRef.current.position = { lat ,lng};
              markerRef.current.map = mapRef.current;
            }
          }
        }
      )
    }
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
                <div style={{ display: 'flex', flexDirection: 'row', padding: '0 0.5rem' }}>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) =>
                            setAddress(e.target.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                void handleSubmit();
                            }
                        }}
                        placeholder="Find stores near you..."
                        required
                        style={{
                            flex: 1,
                            color: '#0D0A0B',
                            backgroundColor: '#F3EFF5',
                            fontSize: '1rem',
                            fontWeight: 600,
                            padding: '0 0.5rem',
                            maxWidth: '130%',
                            outline: 'none',
                            border: 'none',
                            borderRadius: '1rem'
                        }}
                    />
                    <button onClick={clear} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <svg id="svgX" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0D0A0B" strokeWidth="2" strokeLinecap="round"
                            strokeLinejoin="round" >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M18 6l-12 12" />
                            <path d="M6 6l12 12" />
                        </svg>
                    </button>
                    <button onClick={goToMylocation} style ={{border: 'none', background: 'none', cursor: 'pointer' }}> 
                      Use current location
                    </button>
                </div>
            </div>
            {loading && (
                <div>
                    Loading Google Maps...
                </div>
            )}
            <div
                ref={mapContainerRef}
                style={{
                    width: '100%',
                    height: '600px',
                    borderRadius: '1rem',
                    overflow: 'hidden',
                }} />
        </div>
    );
};

export default Navigation;