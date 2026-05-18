import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../supabase";

declare global {
  interface Window {
    google: any;
  }
}

type TravelMode = "TRANSIT" | "WALKING" | "DRIVING" | "BICYCLING";

interface RouteInfo {
  duration: string;
  distance: string;
  steps: { instruction: string; distance: string }[];
}

interface SavedRoute {
  id: string;
  origin: string;
  destination: string;
  travel_mode: TravelMode;
  duration: string | null;
  distance: string | null;
  created_at: string;
}

const MODE_ICONS: Record<TravelMode, string> = {
  TRANSIT: "🚌",
  WALKING: "🚶",
  DRIVING: "🚗",
  BICYCLING: "🚲",
};

const MAX_ROUTES = 10;

const Maps = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const placeMarkersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const advancedMarkerRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const transitLayerRef = useRef<any>(null);
  const travelModeRef = useRef<TravelMode>("TRANSIT");

  const lastOriginRef = useRef<string>("");
  const lastDestRef = useRef<string>("");

  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [travelMode, setTravelMode] = useState<TravelMode>("TRANSIT");
  const [transitLayerOn, setTransitLayerOn] = useState(true);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [currentDest, setCurrentDest] = useState("");

  useEffect(() => {
    travelModeRef.current = travelMode;
  }, [travelMode]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  const fetchRoutes = useCallback(async () => {
    if (!userId) return;
    setRoutesLoading(true);
    const { data, error } = await supabase
      .from("recent_routes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(MAX_ROUTES);
    if (!error && data) setSavedRoutes(data as SavedRoute[]);
    setRoutesLoading(false);
  }, [userId]);

  useEffect(() => {
    if (showHistory) fetchRoutes();
  }, [showHistory, fetchRoutes]);

  const saveRoute = async (origin: string, dest: string, info: RouteInfo) => {
    if (!userId) return;
    setSaveLoading(true);
    setSaveSuccess(false);

    const { count } = await supabase
      .from("recent_routes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if ((count ?? 0) >= MAX_ROUTES) {
      const { data: oldest } = await supabase
        .from("recent_routes")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1);
      if (oldest && oldest.length > 0) {
        await supabase.from("recent_routes").delete().eq("id", oldest[0].id);
      }
    }

    const { error } = await supabase.from("recent_routes").insert({
      user_id: userId,
      origin: origin.trim(),
      destination: dest.trim(),
      travel_mode: travelModeRef.current,
      duration: info.duration,
      distance: info.distance,
    });

    setSaveLoading(false);
    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (showHistory) fetchRoutes();
    }
  };

  const deleteRoute = async (id: string) => {
    await supabase.from("recent_routes").delete().eq("id", id);
    setSavedRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  const loadRoute = (route: SavedRoute) => {
    setTravelMode(route.travel_mode);
    travelModeRef.current = route.travel_mode;
    setShowHistory(false);
    geocoderRef.current?.geocode(
      { address: route.origin },
      (results: any[], status: string) => {
        if (status === "OK" && results[0]) {
          mapRef.current?.setCenter(results[0].geometry.location);
        }
      },
    );
    runDirections(route.origin, route.destination);
  };

  const runDirections = useCallback((origin: string, dest: string) => {
    if (!directionsServiceRef.current) return;
    setRouteLoading(true);
    setRouteError("");
    setRouteInfo(null);

    lastOriginRef.current = origin;
    lastDestRef.current = dest;

    const google = window.google;
    const mode = travelModeRef.current;

    const request: any = {
      origin,
      destination: dest,
      travelMode: google.maps.TravelMode[mode],
    };

    if (mode === "TRANSIT") {
      request.transitOptions = {
        departureTime: new Date(),
        modes: [
          google.maps.TransitMode.BUS,
          google.maps.TransitMode.RAIL,
          google.maps.TransitMode.SUBWAY,
        ],
        routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS,
      };
    }

    directionsServiceRef.current.route(
      request,
      (result: any, status: string) => {
        setRouteLoading(false);
        if (status !== "OK") {
          setRouteError(
            status === "ZERO_RESULTS"
              ? "No route found."
              : `Directions failed: ${status}`,
          );
          return;
        }
        directionsRendererRef.current.setDirections(result);
        const leg = result.routes[0].legs[0];
        const info: RouteInfo = {
          duration: leg.duration?.text || "N/A",
          distance: leg.distance?.text || "N/A",
          steps: leg.steps.map((step: any) => ({
            instruction: step.instructions.replace(/<[^>]*>/g, ""),
            distance: step.distance?.text || "",
          })),
        };
        setRouteInfo(info);
        setCurrentDest(dest);
        saveRoute(origin, dest, info);
      },
    );
  }, []);

  const handleModeChange = (m: TravelMode) => {
    setTravelMode(m);
    travelModeRef.current = m;
    if (lastOriginRef.current && lastDestRef.current) {
      // small delay so ref is updated before runDirections reads it
      setTimeout(
        () => runDirections(lastOriginRef.current, lastDestRef.current),
        50,
      );
    }
  };

  const handleGetDirectionsHere = useCallback(
    (dest: string) => {
      infoWindowRef.current?.close();

      if (!navigator.geolocation) {
        setRouteError("Geolocation not supported.");
        return;
      }

      setRouteLoading(true);
      setRouteError("");

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const latLng = `${pos.coords.latitude},${pos.coords.longitude}`;
          try {
            const resp = await geocoderRef.current.geocode({
              location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            });
            const readable = resp.results[0]?.formatted_address || latLng;
            setAddress(readable);
          } catch {
            setAddress(latLng);
          }
          runDirections(latLng, dest);
        },
        () => {
          setRouteLoading(false);
          setRouteError("Location access denied.");
        },
      );
    },
    [runDirections],
  );

  useEffect(() => {
    let mounted = true;

    const loadGoogleMaps = async () => {
      try {
        if (window.google?.maps) {
          await initMap();
          return;
        }

        const existing = document.querySelector(
          "script[data-maps-script]",
        ) as HTMLScriptElement | null;
        if (existing) {
          existing.addEventListener("load", () => {
            if (mounted) initMap();
          });
          return;
        }
        const script = document.createElement("script");
        script.setAttribute("data-maps-script", "true");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}&v=weekly&libraries=places,geocoding,marker,geometry,core`;
        script.async = true;
        script.onload = async () => {
          if (!mounted) return;
          await initMap();
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error("Google Maps load error:", error);
      }
    };

    const initMap = async () => {
      if (!mapContainerRef.current) return;
      try {
        const google = window.google;
        const { Geocoder } = await google.maps.importLibrary("geocoding");
        await google.maps.importLibrary("places");
        const { InfoWindow } = await google.maps.importLibrary("maps");
        const { event } = await google.maps.importLibrary("core");
        advancedMarkerRef.current = (
          await google.maps.importLibrary("marker")
        ).AdvancedMarkerElement;

        geocoderRef.current = new Geocoder();

        mapRef.current = new google.maps.Map(mapContainerRef.current, {
          center: { lat: 37.7749, lng: -122.4194 },
          mapId: "c0e0fa051cca30ea4942062a",
          zoom: 10,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        transitLayerRef.current = new google.maps.TransitLayer();
        transitLayerRef.current.setMap(mapRef.current);

        directionsServiceRef.current = new google.maps.DirectionsService();
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#3F7D20",
            strokeWeight: 5,
            strokeOpacity: 0.85,
          },
        });
        directionsRendererRef.current.setMap(mapRef.current);

        event.addListenerOnce(mapRef.current, "idle", () => {
          filterPlaces();
        });
        infoWindowRef.current = new InfoWindow();
        markerRef.current = new advancedMarkerRef.current({
          map: mapRef.current,
        });

        mapRef.current.addListener("click", async (e: any) => {
          if (e.latLng) await geocode({ location: e.latLng });
        });

        setLoading(false);
      } catch (error) {
        console.error("Map initialization error:", error);
      }
    };

    loadGoogleMaps();
    return () => {
      mounted = false;
      if (markerRef.current) markerRef.current.map = null;
    };
  }, []);

  useEffect(() => {
    if (!transitLayerRef.current || !mapRef.current) return;
    transitLayerRef.current.setMap(transitLayerOn ? mapRef.current : null);
  }, [transitLayerOn]);

  const clear = () => setAddress("");

  const geocode = async (request: any) => {
    try {
      clear();
      if (!geocoderRef.current || !mapRef.current) return;
      const response = await geocoderRef.current.geocode(request);
      if (!response.results.length) {
        alert("No results found");
        return;
      }
      mapRef.current.setCenter(response.results[0].geometry.location);
      filterPlaces();
    } catch (error) {
      console.error("Geocoding failed:", error);
      alert("Geocoding failed: " + String(error));
    }
  };

  const handleSubmit = async () => {
    if (!address.trim()) return;
    await geocode({ address });
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

    const { places } = await Place.searchNearby({
      fields: [
        "displayName",
        "location",
        "formattedAddress",
        "googleMapsURI",
        "priceLevel",
      ],
      locationRestriction: { center, radius },
      includedPrimaryTypes: ["grocery_store"],
      maxResultCount: 10,
      rankPreference: SearchNearbyRankPreference.RELAVANCE,
    });

    if (places.length > 0) {
      const { LatLngBounds } = await window.google.maps.importLibrary("core");
      const bounds = new LatLngBounds();
      for (const marker of placeMarkersRef.current) marker.map = null;
      placeMarkersRef.current = [];

      places.forEach((place: any) => {
        if (!place.location) return;
        bounds.extend(place.location);

        const marker = new advancedMarkerRef.current({
          map: mapRef.current,
          position: place.location,
          title: place.displayName,
        });
        placeMarkersRef.current.push(marker);

        const content = document.createElement("div");
        const addrEl = document.createElement("div");
        addrEl.textContent = place.formattedAddress || "";
        const placeId = document.createElement("div");
        placeId.textContent = place.id;
        content.append(addrEl, placeId);

        if (place.googleMapsURI) {
          const link = document.createElement("a");
          link.href = place.googleMapsURI;
          link.target = "_blank";
          link.textContent = place.priceLevel
            ? ` Price level: ${place.priceLevel}`
            : place.displayName;
          content.appendChild(link);
        }

        const dirBtn = document.createElement("button");
        dirBtn.textContent = "🗺 Get Directions Here";
        dirBtn.style.cssText =
          "margin-top:8px;padding:6px 12px;background:#3F7D20;color:white;" +
          "border:none;border-radius:8px;cursor:pointer;font-size:13px;display:block;width:100%;";
        dirBtn.onclick = () =>
          handleGetDirectionsHere(place.formattedAddress || place.displayName);
        content.appendChild(dirBtn);

        marker.addListener("gmp-click", () => {
          mapRef.current.panTo(place.location);
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.setHeaderContent(
            place.displayName +
              (place.priceLevel ? ` Price level: ${place.priceLevel}` : ""),
          );
          infoWindowRef.current.open({ map: mapRef.current, anchor: marker });
        });
      });

      mapRef.current.fitBounds(bounds, 100);
    } else {
      console.log("No nearby places");
    }
  };

  const goToMylocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported on your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const loc = { lat, lng };
      setUserLocation(loc);
      if (mapRef.current) {
        mapRef.current.setCenter(loc);
        mapRef.current.setZoom(14);
        if (markerRef.current) {
          markerRef.current.position = loc;
          markerRef.current.map = mapRef.current;
        }
        filterPlaces();
      }
    });
  };

  const clearRoute = () => {
    if (directionsRendererRef.current)
      directionsRendererRef.current.setDirections({ routes: [] });
    setRouteInfo(null);
    setRouteError("");
    setCurrentDest("");
    lastOriginRef.current = "";
    lastDestRef.current = "";
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const modeColor: Record<TravelMode, string> = {
    TRANSIT: "#3F7D20",
    WALKING: "#72B01D",
    DRIVING: "#5a8a2e",
    BICYCLING: "#2e6e14",
  };

  return (
    <>
      <style>{`
        .maps-wrapper {
          margin: 0.5rem 0;
          display: flex;
          flex-direction: column;
          padding-top: 0.5rem;
          align-items: center;
          padding: 0 0.5rem;
          box-sizing: border-box;
          width: 100%;
        }
        .maps-search-bar {
          display: flex;
          flex-direction: column;
          border: 2px solid #5d866c;
          border-radius: 1rem;
          background-color: #f5f3f1;
          font-size: 1.125rem;
          width: 100%;
          max-width: 700px;
          margin-bottom: 0.5rem;
        }
        .maps-search-row {
          display: flex;
          flex-direction: row;
          padding: 0 0.5rem;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.25rem;
        }
        .maps-search-input {
          flex: 1;
          min-width: 120px;
          color: #0D0A0B;
          background-color: #F3EFF5;
          font-size: 1rem;
          font-weight: 600;
          padding: 0.5rem;
          outline: none;
          border: none;
          border-radius: 1rem;
        }
        .maps-search-btn {
          background: #3F7D20;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.4rem 0.85rem;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          white-space: nowrap;
        }
        .maps-location-btn {
          background: #3F7D20;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.4rem 0.85rem;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          white-space: nowrap;
        }
        .maps-clear-btn {
          border: none;
          background: none;
          cursor: pointer;
          flex-shrink: 0;
        }
        .maps-mode-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin: 0.5rem 0;
          justify-content: center;
          width: 100%;
          max-width: 700px;
        }
        .maps-mode-btn {
          padding: 0.3rem 0.75rem;
          border-radius: 50px;
          border: 1.5px solid;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .maps-transit-toggle {
          padding: 0.3rem 0.85rem;
          border-radius: 50px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          white-space: nowrap;
        }
        .maps-panel {
          width: 100%;
          max-width: 700px;
          border-radius: 1rem;
          padding: 0.75rem 1rem;
          margin-bottom: 0.5rem;
          box-sizing: border-box;
        }
        .maps-chip {
          padding: 0.3rem 0.75rem;
          background: #e6f4d7;
          border: 1.5px solid #72B01D;
          border-radius: 50px;
          font-size: 0.85rem;
          color: #2d5a10;
        }
        .maps-map {
          width: 100%;
          height: 500px;
          border-radius: 1rem;
          overflow: hidden;
        }
        @media (max-width: 480px) {
          .maps-search-input { font-size: 0.9rem; }
          .maps-mode-btn { font-size: 0.78rem; padding: 0.25rem 0.6rem; }
          .maps-map { height: 380px; }
          .maps-panel { padding: 0.6rem 0.75rem; }
        }
      `}</style>

      <div className="maps-wrapper">
        <div className="maps-search-bar">
          <div className="maps-search-row">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSubmit();
              }}
              placeholder="Find stores near you..."
              required
              className="maps-search-input"
            />
            <button onClick={clear} className="maps-clear-btn" title="Clear">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0D0A0B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M18 6l-12 12" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
            <button onClick={handleSubmit} className="maps-search-btn">
              🔍 Search
            </button>
            <button onClick={goToMylocation} className="maps-location-btn">
              📍 My Location
            </button>
          </div>
        </div>

        <div className="maps-mode-row">
          {(["TRANSIT", "WALKING", "DRIVING", "BICYCLING"] as TravelMode[]).map(
            (m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className="maps-mode-btn"
                style={{
                  background: travelMode === m ? modeColor[m] : "#f0f0f0",
                  color: travelMode === m ? "white" : "#333",
                  borderColor: travelMode === m ? modeColor[m] : "#ccc",
                }}
              >
                {MODE_ICONS[m]} {m.charAt(0) + m.slice(1).toLowerCase()}
              </button>
            ),
          )}
          <button
            onClick={() => setTransitLayerOn((v) => !v)}
            className="maps-transit-toggle"
            style={{
              background: transitLayerOn ? "#3F7D20" : "#e0e0e0",
              color: transitLayerOn ? "white" : "#555",
            }}
          >
            🚌 Transit Layer {transitLayerOn ? "ON" : "OFF"}
          </button>
        </div>

        {(routeLoading || routeError || routeInfo) && (
          <div
            className="maps-panel"
            style={{ background: "#f9fdf5", border: "1.5px solid #72B01D" }}
          >
            {routeLoading && (
              <div style={{ color: "#3F7D20", fontWeight: 600 }}>
                Getting directions...
              </div>
            )}
            {routeError && <div style={{ color: "#c53030" }}>{routeError}</div>}
            {routeInfo && (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <span className="maps-chip">
                    ⏱ <strong>{routeInfo.duration}</strong>
                  </span>
                  <span className="maps-chip">
                    📏 <strong>{routeInfo.distance}</strong>
                  </span>
                  <span className="maps-chip">
                    {MODE_ICONS[travelMode]}{" "}
                    <strong>
                      {travelMode.charAt(0) + travelMode.slice(1).toLowerCase()}
                    </strong>
                  </span>
                  <button
                    onClick={clearRoute}
                    style={{
                      marginLeft: "auto",
                      padding: "0.25rem 0.75rem",
                      background: "#fee2e2",
                      color: "#c53030",
                      border: "none",
                      borderRadius: "50px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    ✕ Clear
                  </button>
                  {userId && (
                    <button
                      onClick={() =>
                        routeInfo && saveRoute(address, currentDest, routeInfo)
                      }
                      disabled={saveLoading}
                      style={{
                        padding: "0.25rem 0.75rem",
                        background: saveSuccess ? "#72B01D" : "#3F7D20",
                        color: "white",
                        border: "none",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      {saveLoading
                        ? "Saving..."
                        : saveSuccess
                          ? "✓ Saved!"
                          : "💾 Save"}
                    </button>
                  )}
                </div>
                <div
                  style={{
                    marginTop: "0.5rem",
                    maxHeight: "180px",
                    overflowY: "auto",
                    borderRadius: "6px",
                    border: "1px solid #d1e8b0",
                  }}
                >
                  {routeInfo.steps.map((step, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        padding: "0.4rem 0.6rem",
                        borderBottom: "1px solid #f0f4e8",
                        fontSize: "0.82rem",
                      }}
                    >
                      <span
                        style={{
                          minWidth: 20,
                          height: 20,
                          background: "#3F7D20",
                          color: "white",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ flex: 1 }}>{step.instruction}</span>
                      <span
                        style={{
                          color: "#72B01D",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {step.distance}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {userId && (
          <div
            className="maps-panel"
            style={{ background: "#fff", border: "1.5px solid #c3d9a0" }}
          >
            <button
              onClick={() => setShowHistory((v) => !v)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "#3F7D20",
                padding: 0,
              }}
            >
              <span>
                🕓 Recent Routes (
                {savedRoutes.length > 0 ? savedRoutes.length : "..."}/
                {MAX_ROUTES})
              </span>
              <span style={{ marginLeft: "auto" }}>
                {showHistory ? "▲" : "▼"}
              </span>
            </button>
            {showHistory && (
              <div style={{ marginTop: "0.5rem" }}>
                {routesLoading && (
                  <div style={{ color: "#888", fontSize: "0.85rem" }}>
                    Loading...
                  </div>
                )}
                {!routesLoading && savedRoutes.length === 0 && (
                  <div
                    style={{
                      color: "#aaa",
                      fontSize: "0.85rem",
                      textAlign: "center",
                      padding: "1rem 0",
                    }}
                  >
                    No saved routes yet. Tap "Get Directions Here" on a store
                    pin!
                  </div>
                )}
                {savedRoutes.map((route) => (
                  <div
                    key={route.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>
                      {MODE_ICONS[route.travel_mode as TravelMode]}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: "#111",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {route.origin} → {route.destination}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#888" }}>
                        {route.duration && `⏱ ${route.duration}`}
                        {route.distance && ` · 📏 ${route.distance}`} ·{" "}
                        {formatDate(route.created_at)}
                      </div>
                    </div>
                    <button
                      onClick={() => loadRoute(route)}
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: "#e6f4d7",
                        color: "#3F7D20",
                        border: "1px solid #72B01D",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                      }}
                    >
                      ▶
                    </button>
                    <button
                      onClick={() => deleteRoute(route.id)}
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: "#fee2e2",
                        color: "#c53030",
                        border: "1px solid #fca5a5",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {loading && <div>Loading Google Maps...</div>}

        <div ref={mapContainerRef} className="maps-map" />
      </div>
    </>
  );
};

export default Maps;
