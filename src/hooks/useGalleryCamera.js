import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
// 导入暴露相机的函数 / Import the function to expose the camera
import { exposeCamera } from '../components/ScreeningRoom'

// 使用useGalleryCamera函数来创建一个可交互的相机 / Use the useGalleryCamera function to create an interactive camera
export function useGalleryCamera(collidableObjectsRef) {
  const { camera } = useThree()
  
  // 存储相机的朝向四元数 / Store the camera's orientation quaternion
  const cameraRotation = useRef(new THREE.Quaternion())
  
  // 存储相机的当前位置 / Store the camera's current position
  const cameraPosition = useRef(new THREE.Vector3())
  
  // 添加输入状态 (鼠标和触摸) / Add input state (mouse and touch)
  const inputState = useRef({
    isDown: false,
    isTouching: false, // 标志位，用于判断是否在触摸 / Flag for active touch
    touchIdentifier: null, // 跟踪特定的触摸手指 / Track the specific touch finger
    x: 0,
    y: 0,
    rotationX: 0,  // 水平旋转角度 / Horizontal rotation angle
    rotationY: 0   // 垂直旋转角度 / Vertical rotation angle
  })

  // 将相机暴露给全局，用于视频交互功能 / Expose the camera globally for video interaction functionality
  useEffect(() => {
    // 暴露相机实例给全局 / Expose the camera instance globally
    exposeCamera(camera);
  }, [camera]);

  // 1. 配置参数 / 1. Configuration Parameters
  const config = {
    height: 5.0,        // 固定相机高度 / Fixed camera height
    speed: 7.5,         // 基础移动速度 / Base movement speed
    sprintSpeed: 15.0,   // 加速移动速度 / Sprinting movement speed
    boundary: {         
      x: 29.0, // 调整 X 边界以适应新宽度 (原为 9.5) / Adjust X boundary to fit new width (was 9.5)
      zMin: -24.5, // Z 边界保持不变 / Z boundary remains unchanged
      zMax: 14.5   // Z 边界保持不变 / Z boundary remains unchanged
    },
    // 降低鼠标灵敏度 / Lower mouse sensitivity
    mouseSensitivity: 0.001,
    collisionBuffer: 0.6, // 碰撞缓冲距离 (略微增大) / Collision buffer distance (slightly increased)
  }

  // 2. 按键状态管理 / 2. Key State Management
  const keys = useRef({
    w: false, a: false, s: false, d: false, shift: false
  })

  // 初始化 Raycaster / Initialize Raycaster
  const raycaster = useRef(new THREE.Raycaster())

  useEffect(() => {
    // 设置初始位置 / Set initial position
    camera.position.set(0, config.height, 8)
    cameraPosition.current.copy(camera.position)
    
    // 设置初始朝向为水平 / Set initial orientation to horizontal
    const initialRotation = new THREE.Euler(0, 0, 0, 'YXZ')  // 设置为0表示水平视角 / Set to 0 for a horizontal view
    cameraRotation.current.setFromEuler(initialRotation)
    camera.quaternion.copy(cameraRotation.current)
    
    // 初始化鼠标旋转状态 / Initialize mouse rotation state
    inputState.current.rotationX = 0
    inputState.current.rotationY = 0

    // 鼠标事件处理 / Mouse event handling
    const handleMouseDown = (e) => {
      inputState.current.isDown = true
      inputState.current.x = e.clientX
      inputState.current.y = e.clientY
    }

    const handleMouseUp = () => {
      inputState.current.isDown = false
    }

    const handleMouseMove = (e) => {
      if (!inputState.current.isDown) return

      // 计算鼠标移动距离 / Calculate mouse movement distance
      const deltaX = e.clientX - inputState.current.x
      const deltaY = e.clientY - inputState.current.y
      inputState.current.x = e.clientX
      inputState.current.y = e.clientY

      // 直接更新旋转角度，不做限制 / Directly update rotation angles without constraints
      inputState.current.rotationX -= deltaX * config.mouseSensitivity
      inputState.current.rotationY -= deltaY * config.mouseSensitivity

      // 创建新的四元数 / Create a new quaternion
      const rotation = new THREE.Euler(
        inputState.current.rotationY,
        inputState.current.rotationX,
        0,
        'YXZ'
      )
      cameraRotation.current.setFromEuler(rotation)
    }

    // --- 触摸事件处理 / Touch Event Handling ---
    const handleTouchStart = (e) => {
      if (e.touches.length === 1 && !inputState.current.isDown) { // 仅当鼠标未按下时处理单点触摸 / Only handle single touch if mouse isn't down
        const touch = e.touches[0];
        inputState.current.isTouching = true;
        inputState.current.touchIdentifier = touch.identifier;
        inputState.current.x = touch.clientX;
        inputState.current.y = touch.clientY;
        // 阻止默认的滚动/缩放行为 / Prevent default scroll/zoom behavior
        e.preventDefault(); 
      }
    }

    const handleTouchMove = (e) => {
      if (!inputState.current.isTouching) return;

      // 找到正确的触摸点 / Find the correct touch point
      let touch = null;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === inputState.current.touchIdentifier) {
          touch = e.touches[i];
          break;
        }
      }

      if (!touch) {
         // 原来的触摸手指已抬起 / The original touch finger was lifted
         inputState.current.isTouching = false;
         inputState.current.touchIdentifier = null;
         return;
      }

      const deltaX = touch.clientX - inputState.current.x;
      const deltaY = touch.clientY - inputState.current.y;
      inputState.current.x = touch.clientX;
      inputState.current.y = touch.clientY;

      // 应用旋转 (如果需要可以为触摸调整灵敏度) / Apply rotation (can adjust sensitivity for touch if needed)
      inputState.current.rotationX -= deltaX * config.mouseSensitivity * 1.5; // 轻微提高触摸灵敏度 / Slightly higher touch sensitivity
      inputState.current.rotationY -= deltaY * config.mouseSensitivity * 1.5;

      // 限制垂直旋转以防止翻转 (可选但建议) / Clamp vertical rotation to prevent flipping (optional but recommended)
      // const maxVerticalAngle = Math.PI / 2 - 0.1; // 示例限制 / Example limit
      // inputState.current.rotationY = Math.max(-maxVerticalAngle, Math.min(maxVerticalAngle, inputState.current.rotationY));

      const rotation = new THREE.Euler(
        inputState.current.rotationY,
        inputState.current.rotationX,
        0,
        'YXZ'
      );
      cameraRotation.current.setFromEuler(rotation);
      
      // 阻止默认的滚动/缩放行为 / Prevent default scroll/zoom behavior
      e.preventDefault(); 
    }

    const handleTouchEnd = (e) => {
      // 检查结束的触摸是否是我们正在跟踪的那个 / Check if the ended touch was the one we were tracking
      let trackedTouchEnded = false;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === inputState.current.touchIdentifier) {
          trackedTouchEnded = true;
          break;
        }
      }

      if (inputState.current.isTouching && trackedTouchEnded) {
        inputState.current.isTouching = false;
        inputState.current.touchIdentifier = null;
      }
    }
    // --- 结束触摸事件处理 / End Touch Event Handling ---

    // 添加事件监听 / Add event listeners
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseUp)

    // 添加触摸监听器 (使用 passive: false 以允许 preventDefault) / Add touch listeners (use passive: false to allow preventDefault)
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd); // 处理中断 / Handle interruption

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseUp)

      // 移除触摸监听器 / Remove touch listeners
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    }
  }, [camera, config.mouseSensitivity])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return // 防止按住键时重复触发 / Prevent repeated triggers when a key is held down
      
      switch (e.code) {
        case 'KeyW': keys.current.w = true; break
        case 'KeyA': keys.current.a = true; break
        case 'KeyS': keys.current.s = true; break
        case 'KeyD': keys.current.d = true; break
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.shift = true
          break
        default: break
      }
    }

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': keys.current.w = false; break
        case 'KeyA': keys.current.a = false; break
        case 'KeyS': keys.current.s = false; break
        case 'KeyD': keys.current.d = false; break
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.shift = false
          break
        default: break
      }
    }

    // 处理来自移动端控件的虚拟按键事件 / Handler for virtual key press events from mobile controls
    const handleVirtualKeyPress = (e) => {
        console.log('[useGalleryCamera] Received virtualkeypress event: / 收到虚拟按键事件:', e.detail);
        const { key, state } = e.detail;
        switch (key) {
            case 'w': keys.current.w = state; break;
            case 'a': keys.current.a = state; break;
            case 's': keys.current.s = state; break;
            case 'd': keys.current.d = state; break;
            case 'shift': keys.current.shift = state; break;
            default: break;
        }
    };

    // 添加事件监听 / Add event listeners
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // 监听虚拟按键 / Listen for virtual key presses
    window.addEventListener('virtualkeypress', handleVirtualKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)

      // 移除虚拟按键监听器 / Remove listener for virtual key presses
      window.removeEventListener('virtualkeypress', handleVirtualKeyPress);
    }
  }, [])

  // 添加一个方法来从外部设置相机位置和朝向 / Add a method to set camera position and orientation from the outside
  const setViewPosition = (position, lookAt) => {
    // 设置相机位置 / Set camera position
    cameraPosition.current.set(position[0], position[1], position[2])
    
    // 计算朝向四元数 / Calculate orientation quaternion
    const direction = new THREE.Vector3()
    direction.subVectors(new THREE.Vector3(lookAt[0], lookAt[1], lookAt[2]), cameraPosition.current).normalize()
    
    // 从方向向量创建四元数 / Create quaternion from direction vector
    const quaternion = new THREE.Quaternion()
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction)
    
    // 设置相机朝向 / Set camera orientation
    cameraRotation.current.copy(quaternion)
    
    // 更新鼠标旋转状态以匹配新朝向 / Update mouse rotation state to match new orientation
    const euler = new THREE.Euler().setFromQuaternion(quaternion, 'YXZ')
    inputState.current.rotationX = euler.y // 使用 inputState / Use inputState
    inputState.current.rotationY = euler.x // 使用 inputState / Use inputState
    // 立即更新相机，以防此函数在循环外调用 / Immediately update camera in case this is called outside the loop
    camera.position.copy(cameraPosition.current)
    camera.quaternion.copy(cameraRotation.current)
  }

  // 3. 移动计算 / 3. Movement Calculation
  const update = (delta) => {
    // 安全检查，确保相机和可碰撞对象引用已准备好 / Safety check for camera and collidable objects ref
    if (!camera || !collidableObjectsRef || !collidableObjectsRef.current || collidableObjectsRef.current.length === 0) {
        // 如果可碰撞对象未准备好，则执行回退或默认行为 / Fallback or default behavior if collidables aren't ready
        if(camera) {
            camera.position.copy(cameraPosition.current)
            camera.quaternion.copy(cameraRotation.current)
        }
        return
    }

    const currentSpeed = keys.current.shift ? config.sprintSpeed : config.speed
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(cameraRotation.current)
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraRotation.current)
    
    // 锁定Y轴移动，用于行走/平移 / Lock Y-axis movement for walking/strafing
    forward.y = 0
    right.y = 0
    forward.normalize() // Y轴归零后进行归一化 / Normalize after zeroing y
    right.normalize()   // Y轴归零后进行归一化 / Normalize after zeroing y

    const moveVector = new THREE.Vector3() // 用于存储此帧的最终移动 / This will store the final movement for this frame
    let intendedMoveLength = 0 // 我们*想要*移动多远，基于速度和时间差 / How far we *want* to move based on speed and delta

    // 计算预期的移动方向和长度 / Calculate intended movement direction and length
    const directionIntention = new THREE.Vector3()
    if (keys.current.w) directionIntention.add(forward)
    if (keys.current.s) directionIntention.sub(forward)
    if (keys.current.d) directionIntention.add(right)
    if (keys.current.a) directionIntention.sub(right)

    if (directionIntention.lengthSq() > 0) { // 仅在尝试移动时进行碰撞检测 / Only do collision checks if trying to move
      directionIntention.normalize()
      intendedMoveLength = currentSpeed * delta

      // --- 光线投射逻辑 / Raycasting Logic ---
      raycaster.current.set(cameraPosition.current, directionIntention)
      raycaster.current.far = intendedMoveLength + config.collisionBuffer // 动态设置远平面 / Set far plane dynamically

      const intersections = raycaster.current.intersectObjects(collidableObjectsRef.current, true) // `true` 表示递归检查组内对象 / `true` checks recursively inside groups

      let collisionDistance = Infinity
      if (intersections.length > 0) {
          // 找到第一个有效的碰撞距离（忽略太近的交点，可能在几何体内部）/ Find the first valid collision distance (ignore intersections too close, could be inside geometry)
          for(let i=0; i < intersections.length; i++){
              if(intersections[i].distance > 0.01){ // 小容差 / Small tolerance
                  collisionDistance = intersections[i].distance
                  break
              }
          }
          // 备选方案：如果距离 > 0，直接取第一个 / Alternative: simply take the first one if distance > 0
          // if (intersections[0].distance > 0) {
          //    collisionDistance = intersections[0].distance;
          // }
      }

      // 根据碰撞计算允许的移动长度 / Calculate allowed movement length based on collision
      const allowedMoveLength = Math.min(intendedMoveLength, Math.max(0, collisionDistance - config.collisionBuffer))

      // 应用允许的移动 / Apply the allowed movement
      moveVector.copy(directionIntention).multiplyScalar(allowedMoveLength)
      // --- 结束光线投射逻辑 / End Raycasting Logic ---

    } // 否则：没有按键，moveVector 保持 (0,0,0) / else: no key pressed, moveVector remains (0,0,0)

    // 应用最终计算出的移动（如果没有按键或完全被阻挡，则为零）/ Apply the final calculated movement (could be zero if no keys pressed or fully blocked)
    const newPos = cameraPosition.current.clone().add(moveVector)

    // 移除了外部边界检查，依赖光线投射 / Outer boundary checks removed, relying on raycasting.
    newPos.y = config.height; // 保持高度固定 / Keep height fixed

    // 更新存储的相机位置 / Update the stored camera position
    cameraPosition.current.copy(newPos)

    // 每帧都更新实际相机的位置和方向 / Always update the actual camera's position and orientation every frame
    camera.position.copy(cameraPosition.current)
    camera.quaternion.copy(cameraRotation.current)
  }

  return { update, setViewPosition }
} 