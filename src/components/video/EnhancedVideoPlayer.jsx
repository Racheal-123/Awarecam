import React, { forwardRef, useEffect, useRef, useImperativeHandle } from 'react';

const EnhancedVideoPlayer = forwardRef(({ src, ...props }, ref) => {
    const videoRef = useRef(null);

    // This allows parent components to call video methods like play(), pause()
    useImperativeHandle(ref, () => videoRef.current);

    return <video 
      ref={videoRef} 
      data-src={src}
      style={{ width:"100%", height:"100%", background:"#000", display:"block" }}
      {...props} 
    />;
});

export default EnhancedVideoPlayer;