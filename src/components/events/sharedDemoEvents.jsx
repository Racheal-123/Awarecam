export const SHARED_DEMO_EVENTS = [
    { 
        id: 'evt1', 
        camera_id: 'demo-cam-1', 
        camera_name: 'Demo - Loading Dock A Camera',
        event_type: 'person_detected', 
        severity: 'medium', 
        confidence: 0.94, 
        description: 'Worker entered loading dock.', 
        created_date: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
        clip_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        snapshot_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        status: 'new',
        ai_agent: 'People Detection',
        zone_name: 'Loading Dock A',
        triggered_actions: ['alert_sent']
    },
    { 
        id: 'evt2', 
        camera_id: 'demo-cam-1', 
        camera_name: 'Demo - Loading Dock A Camera',
        event_type: 'safety_violation', 
        severity: 'high', 
        confidence: 0.89, 
        description: 'Spill detected near Bay 3.', 
        created_date: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
        clip_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        snapshot_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        status: 'new',
        ai_agent: 'Safety Monitor',
        zone_name: 'Loading Dock A',
        triggered_actions: ['alert_sent', 'task_created']
    },
    { 
        id: 'evt3', 
        camera_id: 'demo-cam-2', 
        camera_name: 'Demo - Warehouse Floor Camera',
        event_type: 'vehicle_detected', 
        severity: 'low', 
        confidence: 0.76, 
        description: 'Forklift active in Aisle 4.', 
        created_date: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 mins ago
        clip_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        snapshot_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
        status: 'acknowledged',
        ai_agent: 'Vehicle Detection',
        zone_name: 'Main Floor',
        triggered_actions: ['logged']
    },
    { 
        id: 'evt4', 
        camera_id: 'demo-cam-1', 
        camera_name: 'Demo - Loading Dock A Camera',
        event_type: 'loitering_detected', 
        severity: 'critical', 
        confidence: 0.96, 
        description: 'Unauthorized person loitering after hours.', 
        created_date: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        clip_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        snapshot_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        status: 'new',
        ai_agent: 'Security Monitor',
        zone_name: 'Perimeter',
        triggered_actions: ['alert_sent', 'lockdown_protocol']
    },
    { 
        id: 'evt5', 
        camera_id: 'demo-cam-3', 
        camera_name: 'Demo - Shipping Area Camera',
        event_type: 'abandoned_object', 
        severity: 'medium', 
        confidence: 0.85, 
        description: 'Package left unattended in shipping lane.', 
        created_date: new Date(Date.now() - 1000 * 60 * 3).toISOString(), // 3 mins ago
        clip_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        snapshot_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
        status: 'new',
        ai_agent: 'Security Monitor',
        zone_name: 'Shipping Lane 2',
        triggered_actions: ['alert_sent']
    },
    { 
        id: 'evt6', 
        camera_id: 'demo-cam-3', 
        camera_name: 'Demo - Shipping Area Camera',
        event_type: 'vehicle_detected', 
        severity: 'low', 
        confidence: 0.91, 
        description: 'Delivery truck has arrived at Bay 5.', 
        created_date: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago
        clip_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        snapshot_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
        status: 'acknowledged',
        ai_agent: 'Vehicle Detection',
        zone_name: 'Shipping Bay 5',
        triggered_actions: ['logged']
    },
    { 
        id: 'evt7', 
        camera_id: 'demo-cam-4', 
        camera_name: 'Demo - Main Entrance Camera',
        event_type: 'intrusion_alert', 
        severity: 'critical', 
        confidence: 0.99, 
        description: 'Forceful entry detected at main door.', 
        created_date: new Date(Date.now() - 1000 * 60 * 1).toISOString(), // 1 min ago
        clip_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        snapshot_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
        status: 'new',
        ai_agent: 'Security Monitor',
        zone_name: 'Main Entrance',
        triggered_actions: ['alert_sent', 'lockdown_protocol']
    },
    { 
        id: 'evt8', 
        camera_id: 'demo-cam-4', 
        camera_name: 'Demo - Main Entrance Camera',
        event_type: 'crowd_detected', 
        severity: 'medium', 
        confidence: 0.82, 
        description: 'Unusual crowd forming in the lobby.', 
        created_date: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 mins ago
        clip_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        snapshot_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
        status: 'resolved',
        ai_agent: 'Crowd Analysis',
        zone_name: 'Lobby',
        triggered_actions: ['alert_sent']
    },
];