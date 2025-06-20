import React from 'react';
import './MobileControls.css';

// 移动端控制组件，模拟键盘输入 / Mobile controls component to simulate keyboard input
const MobileControls = () => {

  // 派发自定义按键事件的函数 / Function to dispatch custom key press event
  const dispatchKeyPress = (key, state) => {
    console.log(`[MobileControls] Dispatching virtualkeypress: key=${key}, state=${state}`);
    const event = new CustomEvent('virtualkeypress', {
      detail: { key, state },
    });
    window.dispatchEvent(event);
  };

  // 触摸事件处理程序 / Handlers for touch events
  const handleTouchStart = (key) => (e) => {
    e.preventDefault(); // 防止滚动/缩放等默认行为 / Prevent scrolling/zooming/etc.
    dispatchKeyPress(key, true);
  };

  const handleTouchEnd = (key) => () => {
    // touchend 事件通常不需要阻止默认行为 / No need for preventDefault on touchend usually
    dispatchKeyPress(key, false);
  };

  // 鼠标事件处理程序 (与触摸事件对应) / Handlers for mouse events (mirror touch handlers)
  const handleMouseDown = (key) => (e) => {
    // mousedown 事件通常不需要阻止默认行为 / No preventDefault needed for mouse down usually
    dispatchKeyPress(key, true);
  };

  const handleMouseUp = (key) => () => {
    dispatchKeyPress(key, false);
  };

  return (
    <div 
      className="mobile-controls-container" 
      style={{ display: 'grid' }}
    >
      {/* W 按钮 / W Button */}
      <button
        className="key-w"
        onTouchStart={handleTouchStart('w')}
        onTouchEnd={handleTouchEnd('w')}
        onMouseDown={handleMouseDown('w')}
        onMouseUp={handleMouseUp('w')}
        // 添加 onContextMenu 以防止长按时出现右键菜单 / Add onContextMenu to prevent right-click menu on long press
        onContextMenu={(e) => e.preventDefault()}
      >
        W
      </button>

      {/* A 按钮 / A Button */}
      <button
        className="key-a"
        onTouchStart={handleTouchStart('a')}
        onTouchEnd={handleTouchEnd('a')}
        onMouseDown={handleMouseDown('a')}
        onMouseUp={handleMouseUp('a')}
        onContextMenu={(e) => e.preventDefault()}
      >
        A
      </button>

      {/* Shift 按钮 / Shift Button */}
      <button
        className="key-shift"
        onTouchStart={handleTouchStart('shift')}
        onTouchEnd={handleTouchEnd('shift')}
        onMouseDown={handleMouseDown('shift')}
        onMouseUp={handleMouseUp('shift')}
        onContextMenu={(e) => e.preventDefault()}
      >
        Shift
      </button>

      {/* D 按钮 / D Button */}
      <button
        className="key-d"
        onTouchStart={handleTouchStart('d')}
        onTouchEnd={handleTouchEnd('d')}
        onMouseDown={handleMouseDown('d')}
        onMouseUp={handleMouseUp('d')}
        onContextMenu={(e) => e.preventDefault()}
      >
        D
      </button>
      
      {/* S 按钮 / S Button */}
      <button
        className="key-s"
        onTouchStart={handleTouchStart('s')}
        onTouchEnd={handleTouchEnd('s')}
        onMouseDown={handleMouseDown('s')}
        onMouseUp={handleMouseUp('s')}
        onContextMenu={(e) => e.preventDefault()}
      >
        S
      </button>
    </div>
  );
};

export default MobileControls; 