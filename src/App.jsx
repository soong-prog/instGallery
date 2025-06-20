import { Gallery } from './components/Gallery'
import { Canvas } from '@react-three/fiber'
import { Stats } from '@react-three/drei'
import { MusicControls } from './components/MusicControls'
import { AudioProvider } from './contexts/AudioContext'
import { GuidebookPanel } from './components/GuidebookPanel'
import ImageListPanel from './components/ImageListPanel'
import { useEffect } from 'react'
import { debug } from './utils/debug'
import { ARTWORKS_CONFIG } from './config/artworks'
// import _ from 'lodash'
import { useArtworkStore } from './stores/artworkStore'
import MobileControls from './components/MobileControls'
import { OrbitControls } from '@react-three/drei'
import { LanguageProvider } from './contexts/LanguageContext'
import { LanguageToggle } from './components/LanguageToggle'

// Helper functions 不再在此文件需要，已移至 store / Helper functions no longer needed in this file, moved to store
// const getIndexFromLocationKey = ...
// const getLocationKeyFromIndex = ...

// 定义一个名为App的函数组件 / Define a function component named App
function App() {
    debug.log('App组件渲染 / App component rendered');

    // --- 优化后的状态选择 / Optimized state selection ---
    // 分别选择需要的状态值 / Select the required state values respectively
    const zoomedArtworkIndex = useArtworkStore(state => state.zoomedArtworkIndex);
    const zoomedLocationKey = useArtworkStore(state => state.zoomedLocationKey);
    const isImageListVisible = useArtworkStore(state => state.isImageListVisible);
    const currentArtworksConfig = useArtworkStore(state => state.currentArtworksConfig);

    // Actions 通常是稳定的，可以直接从 store 获取或传递（如果 store action 定义稳定） / Actions are generally stable and can be obtained or passed directly from the store (if the store action definition is stable)
    // 如果需要在 effect 依赖项中使用 action，才需要像下面这样选择 / If you need to use an action in the effect dependencies, you need to select it like this
    const handleArtworkZoom = useArtworkStore(state => state.handleArtworkZoom);
    const updateArtworkData = useArtworkStore(state => state.updateArtworkData);
    const setArtworkRefs = useArtworkStore(state => state.setArtworkRefs);
    const toggleImageList = useArtworkStore(state => state.toggleImageList);
    // const resetState = useArtworkStore(state => state.resetState); // 如果需要 resetState / If resetState is needed

    // --- 结束优化后的状态选择 / End of optimized state selection ---

    const anyArtworkZoomed = zoomedArtworkIndex !== -1;

    // 添加调试代码，将当前配置暴露给 window 对象 / Add debug code to expose the current configuration to the window object
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.currentArtworksConfig = currentArtworksConfig;
            window.debugGallery = {
                getConfig: () => currentArtworksConfig,
                getFilmConfig: () => currentArtworksConfig?.film || null,
                updateFilm: (videoUrl) => {
                    if (updateArtworkData) {
                        updateArtworkData('film', {
                            videoUrl,
                            imageUrl: videoUrl,
                            title: '调试视频 / Debug Video',
                            description: '通过调试工具更新的视频 / Video updated via debug tools',
                            isVideo: true,
                            type: 'video'
                        });
                        console.log('通过调试工具更新视频URL: / Updated video URL via debug tools:', videoUrl);
                    }
                }
            };
        }
    }, [currentArtworksConfig, updateArtworkData]);

    useEffect(() => {
        debug.log('App组件挂载 / App component mounted');
        return () => {
            debug.log('App组件卸载 / App component unmounted');
            // 可选：在卸载时重置状态 / Optional: Reset state on unmount
            // const reset = useArtworkStore.getState().resetState; reset(); 
        };
    }, []);

    return (
        <LanguageProvider>
        <AudioProvider>
        <div style = {
            {
                width: '100vw',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                overflow: 'hidden',
                backgroundColor: '#1a1a1a'
            }
        } >
        <Canvas camera = {
            {
                position: [0, 5, 15],
                fov: 60
            }
        }
        style = {
            { background: '#1a1a1a' } } >
        { import.meta.env.MODE === 'development' && < Stats /> }
        <Gallery setArtworkRefs = { setArtworkRefs }
        zoomedArtworkIndex = { zoomedArtworkIndex }
        onArtworkZoom = { handleArtworkZoom }
        anyArtworkZoomed = { anyArtworkZoomed }
        currentArtworksConfig = { currentArtworksConfig }
        />
        <OrbitControls enablePan = { false }
        maxPolarAngle = { Math.PI / 2 }
        minPolarAngle = { 0 }
        enableDamping = { true }
        dampingFactor = { 0.05 }
        enabled = { zoomedArtworkIndex === null } // 当有画作放大时禁用控制 / Disable controls when an artwork is zoomed
        />
        </Canvas>
        <MusicControls />
        <GuidebookPanel onArtworkZoom = { handleArtworkZoom }
        zoomedArtworkIndex = { zoomedArtworkIndex }
        currentArtworksConfig = { currentArtworksConfig }
        />
        <ImageListPanel isVisible = { isImageListVisible }
        onClose = { toggleImageList }
        updateArtworkData = { updateArtworkData }
        originalArtworksConfig = { ARTWORKS_CONFIG }
        currentArtworksConfig = { currentArtworksConfig }
        zoomedLocationKey = { zoomedLocationKey }
        onMoreClick = { toggleImageList }
        />

        { /* 仅在触摸设备上渲染移动控件 / Render mobile controls only on touch devices */ }
        { /* {isTouchDevice && <MobileControls />} */ }
        { /* 为方便测试始终渲染 / Always render for testing: */ }
        <MobileControls />
        <LanguageToggle />
        </div>
        </AudioProvider>
        </LanguageProvider>
    );
}

export default App