import React, { useRef, useEffect, useState } from 'react';
import { Box, Html } from '@react-three/drei';
import PropTypes from 'prop-types';
import * as THREE from 'three'; // 导入 THREE 用于光线投射 / Import THREE for raycasting
import { debug } from '../utils/debug'; // 导入 debug 用于日志记录 / Import debug for logging

// 简化的 ScreeningRoom 组件，专注于通过点击播放 3D 嵌入式视频 / Simplified ScreeningRoom component focusing on 3D embedded video via click
export const ScreeningRoom = React.forwardRef(({ 
    position, 
    galleryDimensions, 
    videoConfig,
    camera,          // <-- 添加 camera 属性 / <-- Add camera prop
    collidables      // <-- 添加 collidables 属性 / <-- Add collidables prop
}, ref) => {
    const [play3DVideo, setPlay3DVideo] = useState(false);
    const videoRef = useRef(null);
    const screenRef = useRef(); // <-- 为屏幕 Box 添加一个 ref / <-- Add a ref for the screen Box
    // 使用 state 存储当前视频URL，以便在播放状态变化时重新加载 / Use state to store the current video URL, so it can be reloaded when the playback state changes
    const [currentVideoUrl, setCurrentVideoUrl] = useState("/videos/videoplayback.mp4");

    // 用于光线投射的 Refs / Refs for raycasting
    const raycaster = useRef(new THREE.Raycaster());
    const screenWorldPos = useRef(new THREE.Vector3());
    const rayDirection = useRef(new THREE.Vector3());

    // 创建屏幕位置 / Create screen position 
    const screenPosition = [
        ((9.8 + 29.4) / 2), // X 中心坐标 (恢复原值) / X center coordinate (restored value)
        6.2,                 // Y 高度 (与画作对齐) / Y height (aligned with artwork)
        14.8                 // Z 位置（入口墙，恢复原值） / Z position (entry wall, restored value)
    ];
    
    const screenWidth = 15.68; // 近似计算的屏幕宽度 / Approximate screen width
    const screenHeight = 8.82; // 近似计算的屏幕高度 / Approximate screen height
    
    // 当视频配置变化时更新当前视频URL / Update current video URL when video config changes
    useEffect(() => {
        const newVideoUrl = videoConfig?.videoUrl || "/videos/videoplayback.mp4";
        console.log('ScreeningRoom - videoConfig changed:', videoConfig);
        console.log('ScreeningRoom - updating videoUrl:', newVideoUrl);
        setCurrentVideoUrl(newVideoUrl);
        
        // 如果当前正在播放视频，需要重新加载视频 / If video is currently playing, it needs to be reloaded
        if (play3DVideo && videoRef.current) {
            console.log('ScreeningRoom - 正在播放中，需要重新加载视频');
            // 延迟一点执行，确保 src 已更新 / Execute with a slight delay to ensure src is updated
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().catch(e => console.error('重新加载视频失败 / Failed to reload video:', e));
                }
            }, 100);
        }
    }, [videoConfig, play3DVideo]);
    
    // 管理3D视频播放状态 / Manage 3D video playback state
    useEffect(() => {
        if (play3DVideo && videoRef.current) {
            // 确保视频播放 / Ensure video plays
            videoRef.current.muted = true; // 确保静音，允许自动播放 / Ensure muted to allow autoplay
            videoRef.current.currentTime = 0; // 从头开始播放 / Play from the beginning
            
            // 添加调试日志 / Add debug log
            console.log('ScreeningRoom - 开始播放视频:', videoRef.current.src);
            
            const playPromise = videoRef.current.play();
            if (playPromise) {
                playPromise.catch(e => {
                    console.error('3D视频播放失败 / 3D video playback failed:', e);
                    // 尝试再次播放 / Attempt to play again
                    setTimeout(() => {
                        if (videoRef.current) videoRef.current.play().catch(() => {});
                    }, 1000);
                });
            }
        } else if (!play3DVideo && videoRef.current) {
                videoRef.current.pause();
        }
    }, [play3DVideo]); // 从依赖数组中移除了 videoRef.current，因为它会导致问题 / Removed videoRef.current from dependency array as it causes issues

    // 仅用于 3D 视频的简化 toggleVideo 函数 / Simplified toggleVideo function for 3D video only
    const toggleVideo = () => {
        setPlay3DVideo(prev => !prev);
    };

    const handleScreenClick = (e) => {
        e.stopPropagation();

        if (!camera || !collidables || !screenRef.current) {
            debug.log('Screen click aborted: Missing camera, collidables, or screenRef.');
            return;
        }

        // 获取屏幕的世界坐标 / Get world position of the screen
        screenRef.current.getWorldPosition(screenWorldPos.current);
        const camPos = camera.position;

        // 创建从相机到屏幕的光线 / Create ray from camera to the screen
        rayDirection.current.subVectors(screenWorldPos.current, camPos).normalize();
        raycaster.current.set(camPos, rayDirection.current);
        
        // Intersect with collidables (walls, etc.)
        const intersects = raycaster.current.intersectObjects(collidables, true);
        
        const distanceToScreen = camPos.distanceTo(screenWorldPos.current);
        let isObstructed = false;

        if (intersects.length > 0) {
            // The first intersection is the closest one
            const firstIntersection = intersects[0];
            // Check if the intersection is closer than the screen itself
            if (firstIntersection.distance < distanceToScreen - 0.1) { // 0.1 buffer
                isObstructed = true;
                debug.log('Screen click obstructed by:', firstIntersection.object.name || 'Unnamed Object');
            }
        }

        // 仅在没有遮挡时切换视频 / Only toggle video if not obstructed
        if (!isObstructed) {
            debug.log('Screen click successful, toggling video.');
            toggleVideo();
        }
    };

    return (
        <group ref={ref} position={position}>
            {/* 屏幕 - 点击以切换3D视频 / Screen - Click to toggle 3D video */}
            <Box 
                ref={screenRef} // <-- 在此处附加 ref / <-- Attach the ref here
                args={[screenWidth, screenHeight, 0.1]} 
                position={[screenPosition[0], screenPosition[1], screenPosition[2]]}
                rotation={[0, Math.PI, 0]} // 旋转使屏幕面向-Z方向 / Rotate screen to face -Z direction
                onClick={handleScreenClick} // <-- 使用新的处理程序 / <-- Use the new handler
                renderOrder={0} // 指定渲染顺序，先渲染背景 / Specify render order, render background first
            >
                {/* 根据视频状态更改材质 / Change material based on video state */}
                <meshBasicMaterial color={play3DVideo ? "black" : "darkgray"} />
            </Box>

            {/* 使用 Html 的 3D 嵌入式视频 / 3D Embedded Video using Html */}
            {play3DVideo && (
                <Html
                    rotation={[0, Math.PI, 0]} // 匹配屏幕旋转 / Match screen rotation
                    position={[screenPosition[0], screenPosition[1], screenPosition[2]]} // 与屏幕相同的 Z 坐标 / Same Z as screen
                    transform
                    renderOrder={1} // 在屏幕背景之后渲染 / Render after screen background
                    style={{
                        width: '500px', // 调整后的像素宽度 / Adjusted pixel width
                        height: '281px', // 调整后的像素高度 / Adjusted pixel height
                    }}
                >
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'black',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <video
                            ref={videoRef}
                            src={currentVideoUrl}
                            width="100%"
                            height="100%"
                            style={{objectFit: 'contain'}}
                            autoPlay
                            loop
                            muted
                            playsInline
                            controls={false}
                        />
                        {/* 关闭按钮也使用 toggleVideo / Close button also uses toggleVideo */}
                        <button
                            onClick={toggleVideo} 
                            style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                background: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                border: 'none',
                                padding: '5px 10px',
                                cursor: 'pointer',
                                zIndex: 10,
                                fontSize: '16px', 
                                lineHeight: '1' 
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </Html>
            )}
            
            {/* 屏幕边框 / Screen Border */}
            <Box 
                args={[screenWidth + 0.2, screenHeight + 0.2, 0.3]} 
                position={[screenPosition[0], screenPosition[1], screenPosition[2] - 0.1]}
                rotation={[0, Math.PI, 0]} // 匹配屏幕旋转 / Match screen rotation
            >
                 <meshStandardMaterial 
                    color="black" 
                    roughness={0.8} 
                    metalness={0} 
                 />
             </Box>
        </group>
    );
});

// 为 useGalleryCamera.js 添加 exposeCamera 导出 / Add back the exposeCamera export for useGalleryCamera.js
export const exposeCamera = (camera) => {
    if (camera && typeof window !== 'undefined') {
        window._galleryCamera = camera;
    }
};

// 更新 propTypes 和 defaultProps / Update propTypes and defaultProps
ScreeningRoom.propTypes = {
    position: PropTypes.arrayOf(PropTypes.number).isRequired,
    galleryDimensions: PropTypes.shape({ // 暂时未使用，保留 / Still unused, keep for now
        width: PropTypes.number,
        depth: PropTypes.number,
        height: PropTypes.number
    }),
    videoConfig: PropTypes.object, // 添加视频配置属性 / Add video config property
    camera: PropTypes.object,      // <-- 为 camera 添加 prop 类型 / <-- Add prop type for camera
    collidables: PropTypes.array   // <-- 为 collidables 添加 prop 类型 / <-- Add prop type for collidables
};

ScreeningRoom.defaultProps = {
    galleryDimensions: { width: 39.2, depth: 40, height: 12.1 },
    videoConfig: null, // 默认为null / Defaults to null
    camera: null,              // <-- 添加默认 prop / <-- Add default prop
    collidables: []            // <-- 添加默认 prop / <-- Add default prop
};

ScreeningRoom.displayName = 'ScreeningRoom'; 