// 导出一个名为theme的对象，包含颜色、玻璃效果、边框半径、阴影、排版、动画和过渡等属性 / Export an object named theme, containing properties like colors, glass effect, border radius, shadows, typography, animations, and transitions
export const theme = {
  colors: {
    accent: '#F5F5DC',      // 主亮色/强调色 (米色) / Primary light/accent color (Beige)
    primary: '#2F4F4F',     // 主暗色/对比色 (深石板绿) / Primary dark/contrast color (Dark Slate Green)
    hover: 'rgba(245, 245, 220, 0.2)', // 基于 accent 的半透明悬停色 / Semi-transparent hover color based on accent
    // 简化后的半透明颜色变量 / Simplified semi-transparent color variables
    accentTransparent: 'rgba(245, 245, 220, 0.5)', // 半透明米色 / Semi-transparent Beige
    primaryTransparent: 'rgba(47, 79, 79, 0.5)'    // 半透明绿色 / Semi-transparent Green
    // 移除了旧的 primary 和 darkSlateGreen / Removed old primary and darkSlateGreen
  },
  glassmorphism: {
    // 背景使用主色 (#2F4F4F) 并带透明度 / Background uses primary color (#2F4F4F) with transparency
    background: 'rgba(47, 79, 79, 0.5)', // 略微增加透明度 / Slightly more transparent
    blur: 'blur(16px)' // 略微减少模糊 / Slightly less blur
  },
  borderRadius: {
    small: '8px',    // 略微提高小元素圆角 / Slightly increased border radius for small elements
    medium: '14px',  // 提高中等元素圆角 / Increased border radius for medium elements
    large: '18px',   // 提高大元素圆角 / Increased border radius for large elements
    panel: '20px',   // 面板使用更大圆角 / Larger border radius for panels
    pill: '9999px'   // 保持不变 / Keep unchanged
  },
  shadows: {
    // 柔和、漫反射的黑色阴影 (苹果风格) / Soft, diffuse shadows based on black (Apple style)
    main: '0 2px 4px rgba(0, 0, 0, 0.05), 0 8px 16px rgba(0, 0, 0, 0.1)',
    hover: '0 3px 6px rgba(0, 0, 0, 0.07), 0 10px 20px rgba(0, 0, 0, 0.12)'
  },
  typography: {
    fontFamily: '"EB Garamond", "Times New Roman", serif',  // 使用 EB Garamond / Use EB Garamond
    fontSize: {
      small: '16px',
      medium: '24px',
      large: '32px'
    },
    fontWeight: {
      regular: 600,    // 加粗 / Bold
      medium: 700,     // 更粗 / Bolder
      bold: 800        // 最粗 / ExtraBold
    }
  },
  transforms: { // 新增的变换部分 / New section for transforms
    buttonRest: 'scale(1.0)',
    buttonHover: 'scale(1.05)'
  },
  hover: {
    effect: `
      transform: scale(1.05);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.07), 0 10px 20px rgba(0, 0, 0, 0.12);
      border: 1px solid #F5F5DC;
    `
  },
  // 添加统一的滚动条样式，使用固定颜色值避免this引用问题 / Add unified scrollbar styles, using fixed color values to avoid 'this' reference issues
  scrollbar: {
    width: '10px',
    thumbColor: '#F5F5DC', // 使用固定颜色避免this引用问题 / Use fixed color to avoid 'this' reference issues
    trackColor: 'transparent',
    styles: `
      scrollbar-width: thin;
      scrollbar-color: #F5F5DC transparent;
      
      &::-webkit-scrollbar {
        width: 10px;
      }
      
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #F5F5DC;
        border-radius: 4px;
      }
    `
  },
  animations: {
    fadeIn: `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px) translateX(-50%);
        }
        to {
          opacity: 1;
          transform: translateY(0) translateX(-50%);
        }
      }
    `,
    slideIn: `
      @keyframes slideIn {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }
    `
  },
  transitions: {
    default: 'all 0.2s ease-out' // 略快的过渡效果 / Slightly faster transition
  }
} 