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

  const placeMarkersRef = useRef<any[]>([]);

  const infoWindowRef = useRef<any>(null);

  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(true);

  const advancedMarkerRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const loadGoogleMaps = async () => {
      try {
        if (window.google?.maps) {
          await initMap();
          return;
        }

        const existing = document.querySelector('script[data-maps-script]') as HTMLScriptElement | null;
        if (existing) {
          existing.addEventListener("load", () => { 
            if (mounted) {
              initMap();
            }
          });
          return;
        }

        const script = document.createElement("script");
        script.setAttribute("data-maps-script", "true");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${
          import.meta.env.VITE_GOOGLE_MAPS_KEY
        }&v=weekly&libraries=places,geocoding,marker,geometry,core`;
        script.async = true;

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

        const { Place } = await google.maps.importLibrary("places");

        const { InfoWindow } = await google.maps.importLibrary("maps");

        const { event } = await google.maps.importLibrary("core");

        advancedMarkerRef.current = (await google.maps.importLibrary("marker")).AdvancedMarkerElement;

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

        event.addListenerOnce(mapRef.current, "idle", () => {
          filterPlaces();
        });

        infoWindowRef.current = new InfoWindow();

        markerRef.current =
          new advancedMarkerRef.current({
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
      filterPlaces();
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

  const filterPlaces = async () => {
    const [{ Place, SearchNearbyRankPreference }, { spherical }] =
      await Promise.all([
        window.google.maps.importLibrary("places"),
        window.google.maps.importLibrary("geometry"),
      ]);

    const center = mapRef.current.center;
    const northEast = mapRef.current.getBounds().getNorthEast();
    const southWest = mapRef.current.getBounds().getSouthWest();
    const diameter = spherical.computeDistanceBetween(northEast, southWest);
    const radius = Math.min(diameter / 2, 50000);

    const request = {
      fields: [
        "displayName",
        "location",
        "formattedAddress",
        "googleMapsURI",
        "priceRange",
      ],
      locationRestriction: { center, radius },
      includedPrimaryTypes: ["grocery_store"],
      maxResultCount: 10,
      rankPreference: SearchNearbyRankPreference.RELAVANCE,
    };

    const { places } = await Place.searchNearby(request);

    if (places.length > 0) {
      const { LatLngBounds } = await window.google.maps.importLibrary("core");
      const bounds = new LatLngBounds();

      for (const marker of placeMarkersRef.current) {
        marker.map = null;
      }
      placeMarkersRef.current = [];

      places.forEach((place) => {
        if (!place.location) return;
        bounds.extend(place.location);

        const marker = new advancedMarkerRef.current({
          map: mapRef.current,
          position: place.location,
          title: place.displayName,
        });

        placeMarkersRef.current.push(marker);

        const content = document.createElement("div");
        const address = document.createElement("div");
        address.textContent = place.formattedAddress || "";
        const placeId = document.createElement("div");
        placeId.textContent = place.id;
        content.append(address, placeId);

        if (place.googleMapsURI) {
          const link = document.createElement("a");
          link.href = place.googleMapsURI;
          link.target = "_blank";
          link.textContent = `Price level: ${place.priceLevel}`;
          content.appendChild(link);
        }

        marker.addListener("gmp-click", () => {
          mapRef.current.panTo(place.location);
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.setHeaderContent(
            place.displayName + " Price level: " + place.priceLevel,
          );
          infoWindowRef.current.open({
            map: mapRef.current,
            anchor: marker,
          });
        });
      });

      mapRef.current.fitBounds(bounds, 100);
    } else {
      console.log("No nearby places");
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

export default Maps;