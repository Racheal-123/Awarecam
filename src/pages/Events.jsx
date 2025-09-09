
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Play, Calendar, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from 'sonner';

import { User } from '@/api/entities';
import { Organization } from '@/api/entities';
import { Event } from '@/api/entities';
import { EventNote } from '@/api/entities';
import { getDemoCameras, getDemoEventsForCamera } from '@/components/utils/demoData';

import LiveVideoModal from "@/components/video/LiveVideoModal";

const DEFAULT_EVENT_COLORS = {
  intrusion: "#ef4444", ppe: "#10b981", loitering: "#f59e0b",
  vehicle: "#3b82f6", fire: "#dc2626", smoke: "#6b7280", custom: "#8b5cf6",
  // Add fallback colors for other event types
  motion_detected: '#6366f1',
  person_detected: '#ec4899',
  safety_violation: '#f97316',
  system_alert: '#64748b',
  loitering_detected: '#f59e0b',
  abandoned_object: '#9333ea',
  intrusion_alert: '#ef4444',
  crowd_detected: '#facc15',
};

const fmtTime = (t) => {
    const timestamp = Number(t);
    if (isNaN(timestamp)) {
        const date = new Date(t);
        if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        }
        return "Invalid Time";
    }
    return new Date(timestamp * 1000)
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

export default function EventsPage() {
    const [user, setUser] = useState(null);
    const [organization, setOrganization] = useState(null);
    
    // Window = today by default
    const now = new Date();
    const startOfDay = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 1000);
    const endOfDay = startOfDay + 24 * 3600 - 1;

    const [winStart, setWinStart] = useState(startOfDay);
    const [winEnd, setWinEnd] = useState(endOfDay);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    const [hoverEvt, setHoverEvt] = useState(null);  // {event, xPx}
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [openLive, setOpenLive] = useState(null);  // {cameraId, cameraName, streamUrl, event} or {variant, clipEvent, preClipUrl, ...}

    const timelineBarRef = useRef(null);
    const [seeking, setSeeking] = useState(false);
    const [noteOpenFor, setNoteOpenFor] = useState(null);
    const [noteDraft, setNoteDraft] = useState("");
    const [eventNotes, setEventNotes] = useState({});

    useEffect(() => {
        (async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                if (userData.organization_id) {
                    const orgs = await Organization.filter({ id: userData.organization_id });
                    if (orgs.length > 0) {
                        setOrganization(orgs[0]);
                    }
                }
            } catch (e) {
                console.error("Failed to load user/org", e);
            }
        })();
    }, []);

    // Fetch events in window
    useEffect(() => {
        if (!organization) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            setSelectedEventId(null);
            try {
                const fetchedEvents = await Event.filter({
                    organization_id: organization.id,
                    created_date: {
                        $gte: new Date(winStart * 1000).toISOString(),
                        $lte: new Date(winEnd * 1000).toISOString(),
                    },
                }, '-created_date', 200);

                const mapEvent = e => ({
                    ...e,
                    start_ts: Math.floor(new Date(e.created_date).getTime() / 1000),
                    end_ts: Math.floor(new Date(e.created_date).getTime() / 1000) + 10,
                    acknowledged: e.status === 'acknowledged' || e.status === 'resolved',
                });

                const mappedEvents = fetchedEvents.map(mapEvent);
                
                const cams = getDemoCameras();
                const demoEvents = cams.flatMap(c =>
                  getDemoEventsForCamera(c.id, winStart, winEnd).map(ev => {
                    // Manually apply mapEvent's logic for demo events to ensure consistency
                    const eventStatus = ev.acknowledged ? 'acknowledged' : 'new';
                    const start_ts = Math.floor(new Date(ev.created_date).getTime() / 1000);
                    const end_ts = start_ts + 10; // Default event duration
                    const acknowledged = eventStatus === 'acknowledged' || eventStatus === 'resolved';

                    return { 
                      ...ev, 
                      camera_id: c.id, // Add camera_id for LiveVideoModal
                      camera_name: c.name,
                      stream_url: c.streamUrl,
                      video_url: c.streamUrl,
                      clip_url: c.streamUrl,
                      description: `${ev.event_type.replace(/_/g, ' ')} detected at ${c.name}`,
                      status: eventStatus,
                      start_ts: start_ts, // Calculated
                      end_ts: end_ts,     // Calculated
                      acknowledged: acknowledged, // Calculated
                    };
                  })
                );

                if (!cancelled) {
                    const combined = [...mappedEvents, ...demoEvents];
                    combined.sort((a, b) => a.start_ts - b.start_ts);
                    setEvents(combined);
                }
            } catch (error) {
                if (!error.message.includes('429')) {
                    toast.error("Failed to fetch events.");
                    console.error(error);
                }
            } finally {
                setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [winStart, winEnd, organization]);

    // Fetch notes for selected event
    useEffect(() => {
        if (!selectedEventId || eventNotes[selectedEventId]) return;
        
        const fetchNotes = async () => {
            try {
                const notes = await EventNote.filter({ event_id: selectedEventId }, '-created_date');
                setEventNotes(prev => ({ ...prev, [selectedEventId]: notes }));
            } catch (e) {
                if (!e.message.includes('429')) {
                  console.error("Failed to fetch notes for event", selectedEventId, e);
                }
            }
        };
        fetchNotes();
    }, [selectedEventId, eventNotes]);

    const eventSegments = useMemo(() => {
        if (!events.length) return [];
        const span = Math.max(1, winEnd - winStart);
        return events.map(e => {
            const start = Math.max(0, e.start_ts - winStart);
            const end = Math.max(start + 1, (e.end_ts || e.start_ts + 2) - winStart);
            const left = Math.min(100, Math.max(0, (start / span) * 100));
            const width = Math.min(100 - left, Math.max(1, ((end - start) / span) * 100));
            return { 
                id: e.id, 
                left, 
                width, 
                color: DEFAULT_EVENT_COLORS[e.event_type] || "#8b5cf6", 
                raw: e,
                title: `${e.event_type} · ${fmtTime(e.start_ts)}` 
            };
        });
    }, [events, winStart, winEnd]);

    function seekFromClientX(clientX) {
        const el = timelineBarRef.current; 
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const ts = Math.floor(winStart + ratio * (winEnd - winStart));
        // snap to nearest event start
        let nearest = null, best = Infinity;
        for (const e of events) {
            const d = Math.abs((e.start_ts || 0) - ts);
            if (d < best) { 
                best = d; 
                nearest = e; 
            }
        }
        if (nearest) setSelectedEventId(nearest.id);
    }
    
    const changeDay = (direction) => {
        const newDate = new Date(winStart * 1000);
        newDate.setDate(newDate.getDate() + direction);
        const newStart = Math.floor(new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()).getTime() / 1000);
        const newEnd = newStart + 24 * 3600 - 1;
        setWinStart(newStart);
        setWinEnd(newEnd);
    };

    async function toggleAck(ev, checked) {
      // optimistic
      setEvents(prev => prev.map(p => p.id === ev.id ? { ...p, acknowledged: checked } : p));
      
      // Check if this is a demo event (demo events have string IDs like 'evt1', 'evt2', etc.)
      const isDemoEvent = typeof ev.id === 'string' && ev.id.startsWith('evt');
      
      if (isDemoEvent) {
        // For demo events, just show a message and keep the optimistic update
        toast.success(`Demo event ${checked ? 'acknowledged' : 'marked as new'} (local only).`);
        return;
      }
      
      try {
        await Event.update(ev.id, { status: checked ? "acknowledged" : "new" });
        toast.success(`Event ${checked ? 'acknowledged' : 'marked as new'}.`);
      } catch(error) {
        setEvents(prev => prev.map(p => p.id === ev.id ? { ...p, acknowledged: !checked } : p));
        toast.error("Failed to update event status.");
      }
    }

    function openNote(ev) { setNoteOpenFor(ev); setNoteDraft(""); }
    async function saveNoteModal() {
      if (!noteOpenFor) return;
      const ev = noteOpenFor;
      
      // Check if this is a demo event
      const isDemoEvent = typeof ev.id === 'string' && ev.id.startsWith('evt');
      
      if (isDemoEvent) {
        // For demo events, just update local state
        setEvents(prev => prev.map(p => p.id === ev.id ? { ...p, note: noteDraft } : p));
        toast.success("Demo note saved (local only).");
        setNoteOpenFor(null);
        return;
      }
      
      const tempNote = { content: noteDraft, created_by: user?.email, created_date: new Date().toISOString() };
      setEventNotes(prev => ({...prev, [ev.id]: [tempNote, ...(prev[ev.id] || [])]}));

      try {
        const newNote = await EventNote.create({
            event_id: ev.id,
            content: noteDraft,
            organization_id: organization.id,
            user_id: user.id
        });
        setEventNotes(prev => ({...prev, [ev.id]: [newNote, ...(prev[ev.id] || []).slice(1)]}));
        toast.success("Note saved.");
      } catch(error) {
        setEventNotes(prev => ({...prev, [ev.id]: (prev[ev.id] || []).slice(1) }));
        toast.error("Failed to save note.");
      }
      setNoteOpenFor(null);
    }

    const eventToOpen = useMemo(() => {
        if (!openLive) return [];
        return events
            .filter(event => event.camera_id === openLive.event.camera_id)
            .map(event => ({
                id: event.id,
                camera_id: event.camera_id,
                event_type: event.event_type,
                severity: event.severity,
                start_ts: event.start_ts,
                end_ts: event.end_ts,
                created_at: event.created_date,
                thumbnail_url: event.thumbnail_url || event.snapshot_url,
            }));
      }, [openLive, events]);

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-full space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Event Timeline</CardTitle>
                    <CardDescription>Review events chronologically across a time window.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between gap-4 mb-4">
                         <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon" onClick={() => changeDay(-1)}><ChevronsLeft className="w-4 h-4" /></Button>
                             <div className="flex items-center gap-2 font-medium text-slate-700">
                                 <Calendar className="w-5 h-5 text-slate-500"/>
                                 <span>{new Date(winStart * 1000).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                             </div>
                             <Button variant="outline" size="icon" onClick={() => changeDay(1)}><ChevronsRight className="w-4 h-4" /></Button>
                         </div>
                    </div>
                    
                    <div style={{ border:"1px solid #e5e7eb", borderRadius:12, padding:"10px 10px 12px", background:"#fff", marginBottom:12 }}
                         onMouseLeave={()=> setHoverEvt(null)}>
                      <div
                        ref={timelineBarRef}
                        style={{ position:"relative", height:28, margin:"0 4px 10px", background:"linear-gradient(90deg,#f3f4f6,#eef2ff)", borderRadius:999, boxShadow:"inset 0 0 12px rgba(99,102,241,.25)", cursor:"crosshair" }}
                        onMouseDown={(e)=>{ setSeeking(true); seekFromClientX(e.clientX); }}
                        onMouseMove={(e)=>{ if (seeking) seekFromClientX(e.clientX); }}
                        onMouseUp={()=> setSeeking(false)}
                        onTouchStart={(e)=>{ setSeeking(true); if(e.touches[0]) seekFromClientX(e.touches[0].clientX); }}
                        onTouchMove={(e)=>{ if (seeking && e.touches[0]) seekFromClientX(e.touches[0].clientX); }}
                        onTouchEnd={()=> setSeeking(false)}
                      >
                        {eventSegments.length === 0 ? (
                          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#6b7280", fontSize:12 }}>No events in window</div>
                        ) : (
                          eventSegments.map(seg => (
                            <div
                              key={seg.id}
                              title={seg.title}
                              onMouseEnter={(e)=> setHoverEvt({ event: seg.raw, xPx: e.currentTarget.getBoundingClientRect().left + e.currentTarget.offsetWidth/2 })}
                              onMouseMove={(e)=> setHoverEvt({ event: seg.raw, xPx: e.clientX })}
                              onMouseLeave={()=> setHoverEvt(null)}
                              onClick={()=> setSelectedEventId(seg.id)}
                              style={{ position:"absolute", left: seg.left+"%", width: seg.width+"%", top:6, bottom:6, borderRadius:8, background: seg.color, boxShadow:`0 0 10px ${seg.color}66, inset 0 0 6px #fff3`, cursor:"pointer" }}
                            />
                          ))
                        )}
                        {/* marker for selected */}
                        {selectedEventId && (() => {
                          const s = eventSegments.find(x => x.id === selectedEventId); if (!s) return null;
                          const mid = s.left + s.width/2;
                          return <div style={{ position:'absolute', left:`${mid}%`, top:0, bottom:0, width:2, background:'#11182766' }} />;
                        })()}
                      </div>

                      {/* Hover tooltip */}
                      {hoverEvt && (
                        <div style={{ position:'fixed', transform:'translateX(-50%)', top:'calc(100% - 210px)', zIndex:2000, background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:10, boxShadow:'0 10px 30px rgba(0,0,0,.2)', minWidth:180, left: hoverEvt.xPx }}>
                          {hoverEvt.event?.thumbnail_url && <img src={hoverEvt.event.thumbnail_url} alt="" style={{ width:160, height:90, objectFit:'cover', borderRadius:8, border:'1px solid #e5e7eb' }} />}
                          <div style={{fontWeight:700, marginTop:6, textTransform:'capitalize'}}>{hoverEvt.event?.event_type || 'event'}</div>
                          <div style={{fontSize:12, color:'#374151'}}>{fmtTime(hoverEvt.event?.start_ts || Math.floor(Date.now()/1000))}</div>
                        </div>
                      )}
                    </div>
                </CardContent>
            </Card>

            {loading && <div className="flex justify-center items-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}

            {!loading && events.length === 0 && (
                <Card>
                    <CardContent className="p-8 text-center text-slate-500">
                        No events found for this day.
                    </CardContent>
                </Card>
            )}

            {!loading && events.length > 0 && (
                <div className="space-y-2">
                    {events.map(ev => {
                        const isDemoEvent = typeof ev.id === 'string' && ev.id.startsWith('evt');
                        
                        return (
                            <Card key={ev.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-12 bg-slate-200 rounded-md overflow-hidden flex-shrink-0">
                                            <img src={ev.thumbnail_url || ev.snapshot_url || `https://picsum.photos/seed/${ev.id}/160/90`} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-800 capitalize flex items-center gap-2">
                                                {ev.event_type.replace(/_/g, ' ')}
                                                {isDemoEvent && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">DEMO</span>}
                                            </p>
                                            <p className="text-sm text-slate-600">{ev.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-700">{fmtTime(ev.start_ts)}</p>
                                            <p className="text-xs text-slate-500">{ev.camera_name}</p>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:12, paddingTop:12, borderTop:'1px solid #f1f5f9' }}>
                                      <button
                                        onClick={() => toggleAck(ev, !ev.acknowledged)}
                                        title={ev.acknowledged ? "Unacknowledge" : "Acknowledge"}
                                        style={{ width:28, height:28, borderRadius:999, border:"1px solid #e5e7eb", background: ev.acknowledged ? "#10b981" : "#fff", color: ev.acknowledged ? "#fff" : "#111827", fontWeight:700, cursor:"pointer", display:'flex', alignItems:'center', justifyContent:'center' }}
                                      >
                                        {ev.acknowledged ? "✓" : "○"}
                                      </button>

                                      <button style={{ border:"1px solid #e5e7eb", background:"#fff", borderRadius:8, padding:"4px 8px", fontSize:12, cursor:"pointer" }} onClick={() => openNote(ev)}>Note</button>

                                      <button
                                        style={{ border:"1px solid #e5e7eb", background:"#fff", borderRadius:8, padding:"4px 8px", fontSize:12, cursor:"pointer" }}
                                        onClick={() => setSelectedEventId(s => s === ev.id ? null : ev.id)}
                                      >
                                        Info
                                      </button>

                                      <button
                                        style={{ border:"1px solid #111827", background:"#111827", color:"#fff", borderRadius:8, padding:"4px 8px", fontSize:12, cursor:"pointer", marginLeft:"auto" }}
                                        onClick={() => setOpenLive({
                                          variant: "event-clip",
                                          cameraId: ev.camera_id,
                                          cameraName: ev.camera_name || ev.event_type,
                                          preClipUrl: ev.clip_url || null,
                                          streamUrl: ev.video_url || ev.stream_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                                          event: ev,
                                        })}
                                      >
                                        View
                                      </button>
                                    </div>

                                    {selectedEventId === ev.id && (
                                      <div style={{ marginTop:12, borderTop:"1px dashed #e5e7eb", paddingTop:8, fontSize:14, background: '#fafafa', padding: '8px', borderRadius: '8px' }}>
                                        <div><b>Type:</b> {ev.event_type}</div>
                                        <div><b>Agent:</b> {ev.ai_agent}</div>
                                        <div><b>Severity:</b> {ev.severity}</div>
                                        <div><b>Start:</b> {fmtTime(ev.start_ts)}{ev.end_ts ? <>  <b>End:</b> {fmtTime(ev.end_ts)}</> : null}</div>
                                        {isDemoEvent && ev.note && <div><b>Note:</b> {ev.note}</div>}
                                        {!isDemoEvent && eventNotes[ev.id] && eventNotes[ev.id][0] && <div><b>Latest Note:</b> {eventNotes[ev.id][0].content}</div>}
                                      </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {openLive && (
              <LiveVideoModal
                cameraName={openLive.event?.camera_name || openLive.cameraName}
                streamUrl={openLive.streamUrl}
                eventsData={[openLive.event]}
                initialClipUrl={openLive.preClipUrl}
                showEventsPane={false}
                showTimeline={false}
                demoMode={!openLive.preClipUrl && !openLive.streamUrl?.includes(".m3u8")}
                onClose={()=> setOpenLive(null)}
              />
            )}
            
            {noteOpenFor && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setNoteOpenFor(null)}>
                <div className="w-full max-w-md bg-white rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Add Note</CardTitle>
                            <CardDescription>Add a note to event at {fmtTime(noteOpenFor.start_ts)}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Type your note here..."
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                rows={5}
                            />
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="ghost" onClick={() => setNoteOpenFor(null)}>Cancel</Button>
                                <Button onClick={saveNoteModal} disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Save Note'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
              </div>
            )}
        </div>
    );
}
