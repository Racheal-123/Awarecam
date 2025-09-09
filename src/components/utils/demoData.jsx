
// lib/demoData.js
export const DEMO = true;

// --- 8 demo cameras with working video URLs ---
const CAMERAS = [
  { 
    id: "demo-cam-01", 
    name: "Front Gate", 
    streamUrl: "https://www.w3schools.com/html/mov_bbb.mp4", 
    thumb: "https://picsum.photos/seed/cam-01/320/180" 
  },
  { 
    id: "demo-cam-02", 
    name: "Loading Dock", 
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", 
    thumb: "https://picsum.photos/seed/cam-02/320/180" 
  },
  { 
    id: "demo-cam-03", 
    name: "Warehouse A", 
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 
    thumb: "https://picsum.photos/seed/cam-03/320/180" 
  },
  { 
    id: "demo-cam-04", 
    name: "Warehouse B", 
    streamUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8", 
    thumb: "https://picsum.photos/seed/cam-04/320/180" 
  },
  { 
    id: "demo-cam-05", 
    name: "Parking North", 
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", 
    thumb: "https://picsum.photos/seed/cam-05/320/180" 
  },
  { 
    id: "demo-cam-06", 
    name: "Parking South", 
    streamUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4", 
    thumb: "https://picsum.photos/seed/cam-06/320/180" 
  },
  { 
    id: "demo-cam-07", 
    name: "Lobby", 
    streamUrl: "https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8", 
    thumb: "https://picsum.photos/seed/cam-07/320/180" 
  },
  { 
    id: "demo-cam-08", 
    name: "Roof", 
    streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", 
    thumb: "https://picsum.photos/seed/cam-08/320/180" 
  },
];

export function getDemoCameras() {
  return CAMERAS;
}
export function getDemoCameraById(id) {
  return CAMERAS.find(c => c.id === id) || null;
}

/**
 * Maps static demo cameras to a richer format that matches the live application's data structure.
 * It assigns locations cyclically from the provided list.
 * @param {Array} demoCams - The raw array of demo cameras.
 * @param {Array} locations - The list of location entities from the context.
 * @returns {Array} - An array of enriched demo camera objects.
 */
export function mapDemoCameras(demoCams, locations = []) {
  if (!Array.isArray(demoCams) || demoCams.length === 0) {
    return [];
  }

  // If there are no locations, return cameras with a default location name.
  if (!Array.isArray(locations) || locations.length === 0) {
    return demoCams.map(cam => ({
      ...cam,
      is_public_feed: true,
      location_id: 'demo-location',
      locationName: 'Demo Location',
      status: 'active',
      stream_status: 'live', // Set demo cameras as live
      camera_type: 'public_feed',
      is_streaming: true,
      rtsp_url: cam.streamUrl,
      health_score: 95,
      events_today: Math.floor(Math.random() * 5),
      ai_agents: ['person_detected', 'vehicle_detected'],
    }));
  }

  // Assign locations to demo cameras cyclically.
  return demoCams.map((cam, index) => {
    const location = locations[index % locations.length];
    return {
      ...cam,
      is_public_feed: true,
      location_id: location.id,
      locationName: location.name,
      status: 'active',
      stream_status: 'live', // Set demo cameras as live
      camera_type: 'public_feed',
      is_streaming: true,
      rtsp_url: cam.streamUrl,
      health_score: 95,
      events_today: Math.floor(Math.random() * 5),
      ai_agents: ['person_detected', 'vehicle_detected'],
    };
  });
}


// --- Deterministic event generator (same events everywhere) ---
const TYPES = ["intrusion","vehicle","ppe","loitering","fire","smoke","custom"];

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = (h ^ s.charCodeAt(i)) * 16777619 >>> 0;
  return h >>> 0;
}
function lcg(seed) {
  let x = seed >>> 0;
  return () => (x = (1664525 * x + 1013904223) >>> 0) / 2**32;
}

/**
 * Returns realistic, stable events per camera for the given window.
 * Always same output for same (cameraId, winStart, winEnd).
 */
export function getDemoEventsForCamera(cameraId, winStart, winEnd) {
  const span = Math.max(60, Math.floor(winEnd - winStart));
  const seed = hashStr(`${cameraId}-${winStart}-${winEnd}`);
  const rnd = lcg(seed);

  const n = Math.max(4, Math.min(12, Math.floor(rnd() * 10) + 4)); // 4–14 events
  const out = [];
  for (let i = 0; i < n; i++) {
    const startOff = Math.floor(rnd() * span);
    const start_ts = winStart + startOff;
    const dur = 5 + Math.floor(rnd() * 12); // 5–17s
    const end_ts = start_ts + dur;
    const event_type = TYPES[Math.floor(rnd() * TYPES.length)];
    out.push({
      id: `${cameraId}-${start_ts}`,
      camera_id: cameraId,
      event_type,
      start_ts,
      end_ts,
      thumbnail_url: `https://picsum.photos/seed/${cameraId}-${start_ts}/160/90`,
      acknowledged: rnd() > 0.7 ? true : false,
      note: rnd() > 0.85 ? "Auto-generated demo note" : null,
      meta: { actions: rnd() > 0.6 ? ["Notify supervisor", "Log incident"] : [] }
    });
  }
  // stable sort
  return out.sort((a,b)=>a.start_ts - b.start_ts);
}
