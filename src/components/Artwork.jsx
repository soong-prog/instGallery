import { useState, useEffect, useMemo, useImperativeHandle, forwardRef, useRef } from 'react'
import { Box } from '@react-three/drei'
import { InfoPanel } from './InfoPanel'
import * as THREE from 'three'
import PropTypes from 'prop-types'
import { debug } from '../utils/debug'
import { a, useSpring } from '@react-spring/three'

// 定义悬停延迟时间（毫秒） / Define hover delay time (in milliseconds)
const INFO_PANEL_DELAY = 500;

// 定义一个Artwork组件，用于展示艺术品 / Define an Artwork component to display artworks
export const Artwork = forwardRef(({ position, size, rotation, imageUrl, title, description, isCurrentlyZoomed, onZoomChange, anyArtworkZoomed, camera, collidables }, ref) => {
    debug.log('Artwork组件渲染 / Artwork component rendered', { title, position });

    // 定义状态变量 / Define state variables
    const [clicked, setClicked] = useState(false) // 鼠标点击状态 / Mouse click state
    const [isZoomed, setIsZoomed] = useState(false)
    const [dimensions, setDimensions] = useState([size[0], size[1], 0.2]) // 增加默认厚度为0.2 / Add a default thickness of 0.2
    const [loadError, setLoadError] = useState(false) // 加载错误状态 / Loading error state
    const [zoomFactor, setZoomFactor] = useState(1.5) // 放大倍数，默认1.5倍 / Zoom factor, default 1.5x
    const frameRef = useRef()

    // 悬停延迟的状态和引用 / State and ref for hover delay
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const hoverTimeoutRef = useRef(null);

    // 在此组件中使用内部引用访问组节点 / Use an internal ref for the group node access within this component
    const internalGroupRef = useRef();

    // 光线投射的引用 / Refs for raycasting
    const raycasterRef = useRef(new THREE.Raycaster());
    const artworkWorldPosRef = useRef(new THREE.Vector3());
    const rayDirectionRef = useRef(new THREE.Vector3());

    // 使用内部引用获取初始世界位置 / Get initial world position using the internal ref
    useEffect(() => {
        if (internalGroupRef.current) {
            internalGroupRef.current.getWorldPosition(artworkWorldPosRef.current);
        }
        // 无需依赖，只需在groupRef设置后获取一次初始位置 / No dependency needed, just get initial position once groupRef is set
    }, []);

    useEffect(() => {
        debug.log('Artwork组件挂载 / Artwork component mounted', { title });
        return () => {
            debug.log('Artwork组件卸载 / Artwork component unmounted', { title });
            // 在卸载时清除超时 / Clear timeout on unmount
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, [title]);

    // 初始化状态 / Initialize state
    useEffect(() => {
        setIsZoomed(false);
        setZoomFactor(1.5);
    }, []);

    // 当 size 发生变化时更新尺寸 / Update dimensions when size changes
    useEffect(() => {
        setDimensions([size[0], size[1], 0.2]);
    }, [size]);

    // 创建默认纹理 / Create default texture
    const defaultTexture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 300
        canvas.height = 200
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#e0e0e0'
        ctx.fillRect(0, 0, 300, 200)
        ctx.strokeStyle = '#808080'
        ctx.lineWidth = 4
        ctx.strokeRect(2, 2, 296, 196)
        ctx.beginPath()
        ctx.moveTo(50, 50)
        ctx.lineTo(250, 150)
        ctx.moveTo(250, 50)
        ctx.lineTo(50, 150)
        ctx.stroke()

        return new THREE.CanvasTexture(canvas)
    }, [])

    // 使用状态管理纹理 / Use state to manage texture
    const [currentTexture, setCurrentTexture] = useState(defaultTexture)

    // 加载纹理 / Load texture
    useEffect(() => {
        let mounted = true

        const loadTexture = async() => {
            try {
                setLoadError(false)

                const texture = await new Promise((resolve, reject) => {
                    const loader = new THREE.TextureLoader()
                    loader.load(
                        imageUrl,
                        (tex) => resolve(tex),
                        undefined,
                        (error) => reject(error)
                    )
                })

                if (!mounted) return

                if (texture.image) {
                    const imgWidth = texture.image.width
                    const imgHeight = texture.image.height
                    const aspectRatio = imgWidth / imgHeight
                    const width = size[0]
                    const height = width / aspectRatio
                    setDimensions([width, height, 0.2]) // 保持厚度为0.2 / Keep thickness at 0.2
                }

                setCurrentTexture(texture)
            } catch (error) {
                console.warn('纹理加载错误: / Texture loading error:', error)
                if (mounted) {
                    setLoadError(true)
                    setCurrentTexture(defaultTexture)
                }
            }
        }

        loadTexture()

        return () => {
            mounted = false
                // 清理之前的纹理 / Clean up previous texture
            if (currentTexture && currentTexture !== defaultTexture) {
                currentTexture.dispose()
            }
        }
    }, [imageUrl, defaultTexture, size])

    // 计算放大后的位置和尺寸 / Calculate zoomed position and size
    const zoomedProps = useMemo(() => {
        if (isZoomed) {
            return {
                position: [0, 5, 0], // 居中位置 / Centered position
                scale: [zoomFactor, zoomFactor, 1], // 使用动态放大倍数 / Use dynamic zoom factor
                rotation: [0, 0, 0] // 正面朝向相机 / Face the camera
            }
        }
        return {
            position,
            scale: [1, 1, 1],
            rotation
        }
    }, [isZoomed, position, rotation, zoomFactor])

    // 动画过渡 / Animation transition
    const spring = useSpring({
        position: zoomedProps.position,
        scale: zoomedProps.scale,
        rotation: zoomedProps.rotation,
        config: { mass: 1, tension: 280, friction: 30 }
    })

    // 暴露给父组件的方法 / Methods exposed to the parent component
    useImperativeHandle(ref, () => ({
        toggleZoom: () => {
            const newZoomState = !isZoomed;
            setIsZoomed(newZoomState);
            if (newZoomState) {
                setZoomFactor(1.5);
            }
            // 切换缩放时清除悬停状态 / Clear hover state on zoom toggle
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
            setShowInfoPanel(false);
        }
    }));

    // 双击处理 / Double click handler
    const handleDoubleClick = (e) => {
        e.stopPropagation();
        // 先立即本地响应动画 / Respond to animation locally immediately first
        const newZoomState = !isZoomed;
        setIsZoomed(newZoomState);
        if (newZoomState) {
            setZoomFactor(1.5);
        }

        // 然后同步到全局 store（如果有的话）/ Then synchronize to the global store (if any)
        if (onZoomChange) {
            onZoomChange();
        }

        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        setShowInfoPanel(false);
    };

    // --- 捏合缩放逻辑 / Pinch to Zoom Logic ---
    const pinchState = useRef({
        isPinching: false,
        initialDistance: 0
    });

    // 鼠标滚轮处理 / Mouse wheel handler
    const handleWheel = (e) => {
        if (isZoomed) {
            e.stopPropagation();
            // 减小滚轮敏感度 & 统一 delta 计算 / Reduce wheel sensitivity & unify delta calculation
            const delta = -e.deltaY * 0.01;
            // 更新放大倍数，限制在1-3之间 / Update zoom factor, clamped between 1 and 3
            setZoomFactor(prev => {
                const newZoom = Math.max(1, Math.min(3, prev + delta)); // 使用加法，因为delta现在是反的 / Use addition since delta is now inverted
                return newZoom;
            });
        }
    };

    const handleTouchStart = (e) => {
        if (isZoomed && e.touches.length === 2) {
            e.stopPropagation(); // 阻止相机移动 / Prevent camera movement
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            pinchState.current.isPinching = true;
            pinchState.current.initialDistance = distance;
        }
    };

    const handleTouchMove = (e) => {
        if (isZoomed && pinchState.current.isPinching && e.touches.length === 2) {
            e.stopPropagation();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

            // 根据距离变化计算缩放增量 / Calculate scale delta based on distance change
            const scaleDelta = (currentDistance / pinchState.current.initialDistance) - 1;

            // 调整捏合灵敏度（可微调）/ Adjust sensitivity for pinch (can be fine-tuned)
            const sensitivity = 1.0;
            const delta = scaleDelta * sensitivity;

            // 更新缩放因子 / Update zoom factor
            setZoomFactor(prev => {
                const newZoom = Math.max(1, Math.min(3, prev * (1 + delta))); // 应用缩放因子（乘法）/ Apply scale factor multiplicatively
                return newZoom;
            });

            // 更新下一帧的初始距离以正确计算增量 / Update initial distance for the next frame to calculate delta correctly
            pinchState.current.initialDistance = currentDistance;
        }
    };

    const handleTouchEnd = (e) => {
        if (pinchState.current.isPinching && e.touches.length < 2) {
            e.stopPropagation();
            pinchState.current.isPinching = false;
            pinchState.current.initialDistance = 0;
        }
    };
    // --- 结束捏合缩放逻辑 / End Pinch to Zoom Logic ---

    // 修改后的 handlePointerOver，使用 internalGroupRef / Modified handlePointerOver using internalGroupRef
    const handlePointerOver = (e) => {
        e.stopPropagation();
        debug.log(`[${title}] 指针悬停触发 / Pointer Over Triggered`);

        // 使用 internalGroupRef.current 检查先决条件 / Check preconditions using internalGroupRef.current
        if (!anyArtworkZoomed && !isZoomed && camera && collidables && internalGroupRef.current) {
            debug.log(`[${title}] 先决条件满足 (未缩放, 相机/碰撞体OK, internalGroupRef已设置) / Preconditions Met (Not Zoomed, Camera/Collidables OK, internalGroupRef Set)`);

            // 使用 internalGroupRef 获取当前位置 / Get current positions using internalGroupRef
            internalGroupRef.current.getWorldPosition(artworkWorldPosRef.current);
            const artworkPos = artworkWorldPosRef.current;
            const camPos = camera.position;
            debug.log(`[${title}] 相机位置 / Camera Pos:`, camPos.toArray().map(n => n.toFixed(2)));
            debug.log(`[${title}] 艺术品位置 / Artwork Pos:`, artworkPos.toArray().map(n => n.toFixed(2)));

            // 设置光线投射器 / Setup raycaster
            rayDirectionRef.current.subVectors(artworkPos, camPos).normalize();
            raycasterRef.current.set(camPos, rayDirectionRef.current);
            debug.log(`[${title}] 射线方向 / Ray Direction:`, rayDirectionRef.current.toArray().map(n => n.toFixed(2)));

            // 对所有可碰撞对象执行光线投射 / Perform raycast against all collidables
            const intersects = raycasterRef.current.intersectObjects(collidables, true); // 递归 = true / recursive = true
            const distanceToArtwork = camPos.distanceTo(artworkPos);
            let isObstructed = false;
            debug.log(`[${title}] 到艺术品的距离 / Distance to Artwork:`, distanceToArtwork.toFixed(2));
            debug.log(`[${title}] 找到的光线投射交点数量 / Raycast Intersects Found:`, intersects.length);

            // 找到第一个不属于此艺术品的交点 / Find the first intersection that is NOT part of this artwork
            for (let i = 0; i < intersects.length; i++) {
                const intersect = intersects[i];
                let isSelf = false;
                // 检查 internalGroupRef.current / Check against internalGroupRef.current
                if (intersect.object === internalGroupRef.current) {
                    isSelf = true;
                } else {
                    intersect.object.traverseAncestors((ancestor) => {
                        if (ancestor === internalGroupRef.current) { // 对比内部引用 / Check against internal ref
                            isSelf = true;
                        }
                    });
                }

                debug.log(`[${title}] 交点 ${i}: / Intersection ${i}:`,
                    `对象: ${intersect.object.name || '未命名'} / Object: ${intersect.object.name || 'Unnamed'}`,
                    `是自身: ${isSelf} / Is Self: ${isSelf}`,
                    `距离: ${intersect.distance.toFixed(2)} / Distance: ${intersect.distance.toFixed(2)}`);

                // 如果它不属于艺术品本身 / If it's not part of the artwork itself
                if (!isSelf) {
                    // 如果此障碍物比艺术品更近（减去容差）/ If this obstruction is closer than the artwork (minus tolerance)
                    // 使用稍微宽松的检查：直接 < distanceToArtwork / Use a slightly more lenient check: < distanceToArtwork directly
                    if (intersect.distance < distanceToArtwork - 0.1) {
                        isObstructed = true;
                        debug.log(`[${title}] 被 ${intersect.object.name || '未命名对象'} 阻挡，距离 ${intersect.distance.toFixed(2)} / OBSTRUCTED by ${intersect.object.name || 'Unnamed Object'} at distance ${intersect.distance.toFixed(2)}`);
                        break; // 找到最近的障碍物，无需进一步检查 / Found the closest obstruction, no need to check further
                    }
                }
            } // 循环结束 / End for loop

            debug.log(`[${title}] 最终 isObstructed: / Final isObstructed:`, isObstructed);

            // 如果没有被阻挡，启动计时器 / If not obstructed, start the timer
            if (!isObstructed) {
                if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                    debug.log(`[${title}] 清除了现有超时 / Cleared existing timeout`);
                }
                debug.log(`[${title}] 设置超时以显示面板... / Setting timeout to show panel...`);
                hoverTimeoutRef.current = setTimeout(() => {
                    debug.log(`[${title}] 超时完成，设置 showInfoPanel 为 true / Timeout finished, setting showInfoPanel to true`);
                    setShowInfoPanel(true);
                }, INFO_PANEL_DELAY);
            } else {
                // 如果被阻挡，确保面板是隐藏的 / Ensure panel is hidden if obstructed
                debug.log(`[${title}] 被阻挡，确保面板隐藏。 / Obstructed, ensuring panel is hidden.`);
                if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = null;
                }
                setShowInfoPanel(false);
            }
        } else {
            // 记录 internalGroupRef.current 状态 / Log internalGroupRef.current status
            debug.log(`[${title}] 先决条件未满足: anyZoomed=${anyArtworkZoomed}, isZoomed=${isZoomed}, camera=${!!camera}, collidables=${!!collidables}, internalGroupRef=${!!internalGroupRef.current} / Preconditions NOT Met: anyZoomed=${anyArtworkZoomed}, isZoomed=${isZoomed}, camera=${!!camera}, collidables=${!!collidables}, internalGroupRef=${!!internalGroupRef.current}`);
        }
    };

    // 指针移出：清除计时器并隐藏面板 / Pointer Out: Clear timer and hide panel
    const handlePointerOut = (e) => {
        e.stopPropagation();
        // 如果计时器正在运行，则清除它 / Clear the timer if it's running
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null; // 重置引用 / Reset ref
        }
        // 立即隐藏面板 / Hide the panel immediately
        setShowInfoPanel(false);
    };

    // 使用状态变量确定是否应显示信息面板 / Use the state variable to determine if the panel should be shown
    // const shouldShowInfoPanel = hovered && !anyArtworkZoomed;
    const shouldShowInfoPanel = showInfoPanel && !anyArtworkZoomed && !isZoomed; // 同时检查此艺术品本身是否已缩放 / Also check if this artwork itself is zoomed

    // 创建画框材质 / Create frame material
    const frameMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: '#5c4a32', // 深棕木框颜色 / Dark brown wood frame color
            roughness: 0.7,
            metalness: 0.2
        })
    }, [])

    // 组合引用的辅助函数 / Helper function to combine refs
    const combineRefs = (...refs) => {
        return (node) => {
            refs.forEach((ref) => {
                if (!ref) return;
                if (typeof ref === 'function') {
                    ref(node);
                } else {
                    ref.current = node;
                }
            });
        };
    };

    return (
        <a.group ref = { combineRefs(internalGroupRef, ref) }
        position = { spring.position }
        rotation = { spring.rotation }
        scale = { spring.scale }
        onDoubleClick = { handleDoubleClick }
        onWheel = { handleWheel }
        onTouchStart = { handleTouchStart }
        onTouchMove = { handleTouchMove }
        onTouchEnd = { handleTouchEnd }
        onTouchCancel = { handleTouchEnd }
        onPointerOver = { handlePointerOver }
        onPointerOut = { handlePointerOut } >
        { /* 画框边缘 / Frame edges */ }
        <Box ref = { frameRef }
        args = {
            [dimensions[0] + 0.2, dimensions[1] + 0.2, dimensions[2]]
        }
        position = {
            [0, 0, -0.01]
        } >
        <meshStandardMaterial attach = "material" {...frameMaterial }
        />
        </Box >

        { /* 画布内容 / Canvas content */ }
        <Box args = { dimensions }
        castShadow onClick = {
            (e) => {
                e.stopPropagation()
                setClicked(!clicked)
            }
        } > {
            isZoomed ? (
                <meshBasicMaterial map = { currentTexture }
                toneMapped = { false }
                />
            ) : (
                <meshStandardMaterial map = { currentTexture }
                />
            )
        }
        </Box>

        { /* 根据新状态有条件地渲染InfoPanel / Conditionally render InfoPanel based on the new state */ } {
            shouldShowInfoPanel && (
                <InfoPanel position = {
                    [
                        0, -dimensions[1] / 2,
                        0.5
                    ]
                }
                title = { loadError ? "加载失败 / Loading Failed" : title }
                description = { loadError ? "请检查图片路径是否正确。 / Please check the image path." : description }
                />
            )
        }
        </a.group>
    )
});

Artwork.propTypes = {
    position: PropTypes.array,
    size: PropTypes.array.isRequired,
    rotation: PropTypes.array,
    imageUrl: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    isCurrentlyZoomed: PropTypes.bool,
    onZoomChange: PropTypes.func,
    anyArtworkZoomed: PropTypes.bool,
    camera: PropTypes.object,
    collidables: PropTypes.array
};

Artwork.defaultProps = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    isCurrentlyZoomed: false,
    anyArtworkZoomed: false,
    camera: null,
    collidables: []
};

// 添加displayName以修复linter警告 / Add displayName to fix linter warning
Artwork.displayName = 'Artwork';