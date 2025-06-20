import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { forwardRef, Suspense, useMemo, useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Box, Html } from '@react-three/drei'
import { ErrorBoundary } from 'react-error-boundary'
import React from 'react'
import { InfoPanel } from './InfoPanel'
import { debug } from '../utils/debug'

// 定义悬停延迟时间（毫秒） / Define hover delay time (in milliseconds)
const INFO_PANEL_DELAY = 500;

// 加载占位组件 / Loader placeholder component
function Loader() {
  return (
    <Html center>
      <div style={{
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        Loading...
      </div>
    </Html>
  )
}

// 错误显示组件 / Error display component
function ErrorMessage({ error }) {
  return (
    <Html center>
      <div style={{
        background: 'rgba(255,0,0,0.7)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        Failed to load: {error.message}
      </div>
    </Html>
  )
}

ErrorMessage.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string
  }).isRequired
}

// 修改后的GLTF模型组件 / Modified Model component for GLTF
function Model({ modelUrl, onModelLoaded }) {
  console.log('开始加载 GLTF 模型 / Starting to load GLTF model:', modelUrl)
  const gltf = useLoader(GLTFLoader, modelUrl)
  console.log('GLTF 模型加载完成 / GLTF model loaded:', gltf)

  const { position, scale } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const originalSize = box.getSize(new THREE.Vector3());

    if (originalSize.y === 0) {
        console.warn('模型高度为零，无法自动缩放 / Model has zero height, cannot auto-scale.');
        if (onModelLoaded) onModelLoaded(new THREE.Vector3(1, 1, 1)); // 提供默认尺寸 / Provide a default size
        return { position: [0, -0.5, 0], scale: [1, 1, 1] };
    }
    
    const maxHeight = 12;
    const calculatedScale = maxHeight / originalSize.y;
    
    const center = box.getCenter(new THREE.Vector3());
    const bottomY = center.y - originalSize.y / 2;
    const offsetY = -0.5 - (bottomY * calculatedScale);

    // 计算最终尺寸并向上传递 / Calculate final dimensions and pass them up
    const finalSize = originalSize.clone().multiplyScalar(calculatedScale);
    if (onModelLoaded) {
        onModelLoaded(finalSize);
    }
    
    return {
        position: [0, offsetY, 0],
        scale: [calculatedScale, calculatedScale, calculatedScale]
    };
  }, [gltf, onModelLoaded]); // 将 onModelLoaded 添加到依赖项 / Add onModelLoaded to dependencies

  return (
    <primitive 
      object={gltf.scene}
      position={position}
      scale={scale}
    />
  );
}

const MemoizedModel = React.memo(Model)

Model.propTypes = {
  modelUrl: PropTypes.string.isRequired,
  onModelLoaded: PropTypes.func, // 为回调函数添加prop类型 / Add prop type for the callback
}

export const Sculpture = forwardRef(({ 
  position, 
  modelUrl, 
  title, 
  description,
  anyArtworkZoomed = false,
  camera
}, ref) => {
  debug.log('雕塑组件渲染 / Sculpture component rendered', { title, position });
  
  const groupRef = ref;
  const [modelDimensions, setModelDimensions] = useState(null);
  
  useEffect(() => {
    debug.log('雕塑组件挂载 / Sculpture component mounted', { title });
    return () => {
      debug.log('雕塑组件卸载 / Sculpture component unmounted', { title });
       if (hoverTimeoutRef.current) {
           clearTimeout(hoverTimeoutRef.current);
       }
    };
  }, [title]);

  const memoizedModelUrl = useMemo(() => modelUrl, [modelUrl])
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const handlePointerOver = (e) => {
    e.stopPropagation();
    debug.log('雕塑悬停属性 / Sculpture Hover Props:', { anyArtworkZoomed, camera });

    if (!anyArtworkZoomed && camera) {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
            hoverTimeoutRef.current = setTimeout(() => {
                setShowInfoPanel(true);
            }, INFO_PANEL_DELAY);
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null; 
    }
    setShowInfoPanel(false);
  };

  const shouldShowInfoPanel = showInfoPanel && !anyArtworkZoomed;

  const handleModelLoad = useCallback((dimensions) => {
      setModelDimensions(dimensions);
      debug.log('模型尺寸已更新 / Model dimensions updated:', dimensions);
  }, []);

  return (
    <group 
      position={position} 
      ref={groupRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 基于加载的模型尺寸的动态隐形碰撞盒 / Dynamic and invisible collision box based on loaded model size */}
      {modelDimensions && (
          <Box args={[modelDimensions.x, modelDimensions.y, modelDimensions.z]} position={[0, modelDimensions.y / 2, 0]}>
              <meshBasicMaterial transparent opacity={0} />
          </Box>
      )}

      <Suspense fallback={<Loader />}>
        <ErrorBoundary 
          fallback={<ErrorMessage error={{ message: '模型加载失败 / Failed to load model' }} />}
          onError={(error) => {
            console.error('模型加载错误 / Model loading error:', error)
          }}
        >
          <MemoizedModel modelUrl={memoizedModelUrl} onModelLoaded={handleModelLoad} />
        </ErrorBoundary>
      </Suspense>
      {shouldShowInfoPanel && (
        <InfoPanel 
          position={[0, -1.5, 0.5]}
          title={title}
          description={description}
        />
      )}
    </group>
  )
})

Sculpture.propTypes = {
  position: PropTypes.array.isRequired,
  modelUrl: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  anyArtworkZoomed: PropTypes.bool,
  camera: PropTypes.object
}

Sculpture.defaultProps = {
  position: [0, 0, 0],
  anyArtworkZoomed: false,
  camera: null
}

Sculpture.displayName = 'Sculpture' 