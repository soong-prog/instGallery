import { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { theme } from '../styles/theme'; // 导入 theme / Import theme
import _ from 'lodash'; // 导入 lodash 用于安全获取嵌套属性 / Import lodash for safely getting nested properties
import styled from '@emotion/styled'; // 导入 styled / Import styled
import { FaPlus, FaMinus, FaUpload } from 'react-icons/fa'; // 导入加减图标和上传图标 / Import plus, minus, and upload icons
import { saveUploadedImages, getUploadedImages } from '../config/artworks'; // 导入图片存储函数 / Import image storage functions
import { useLanguage } from '../contexts/LanguageContext'; // 导入语言上下文 / Import language context

// 使用 Vite 的 import.meta.glob 获取图片 URL / Use Vite's import.meta.glob to get image URLs
// eager: true 可以在构建时立即加载所有模块 / eager: true can load all modules immediately at build time
// as: 'url' 会直接返回处理后的 URL / as: 'url' will directly return the processed URL
const imageModules = import.meta.glob('/public/images/*.jpg', { as: 'url', eager: true });
const modelModules = import.meta.glob('/public/models/*.{glb,gltf}', { as: 'url', eager: true });
const videoModules = import.meta.glob('/public/videos/*.{mp4,webm,ogg}', { as: 'url', eager: true });

// 解析文件名的辅助函数 / Helper function to parse filename
const parseFilename = (filename) => {
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    const separator = '---'; // 定义分隔符 / Define separator
    const lastSeparatorIndex = nameWithoutExt.lastIndexOf(separator);

    let rawTitle = nameWithoutExt;
    let rawDescription = null; // 默认返回 null 表示未找到描述 / Default to null, indicating no description found

    if (lastSeparatorIndex !== -1) {
        rawTitle = nameWithoutExt.substring(0, lastSeparatorIndex);
        rawDescription = nameWithoutExt.substring(lastSeparatorIndex + separator.length);
    }

    const title = rawTitle.replace(/_/g, ' ').trim() || 'Untitled';
    // 只有当 rawDescription 不为 null 时才处理它 / Only process rawDescription if it's not null
    const description = rawDescription !== null ?
        rawDescription.replace(/_/g, ' ').trim() :
        null; // 保持 null 如果未找到 / Keep null if not found

    return { title, description };
};

// --- 样式化组件 / Styled Components --- 

const Panel = styled.div `
  position: fixed;
  top: 20px;
  bottom: 20px;
  left: 20px;
  width: 280px;
  background: ${theme.glassmorphism.background};
  backdrop-filter: ${theme.glassmorphism.blur};
  padding: 20px;
  border-radius: ${theme.borderRadius.panel};
  overflow-y: auto;
  color: ${theme.colors.accent};
  box-shadow: ${theme.shadows.main};
  z-index: 1000;
  font-family: ${theme.typography.fontFamily};
  transition: ${theme.transitions.default};
  opacity: ${props => props.isVisible ? 1 : 0};
  pointer-events: ${props => props.isVisible ? 'auto' : 'none'};
  display: flex;
  flex-direction: column;
  max-height: 90vh;

  // 统一滚动条样式 / Unified Scrollbar Styles
  scrollbar-width: 10px;
  scrollbar-color: ${theme.colors.accent} transparent; // 米色滑块，透明轨道 / Beige thumb, transparent track

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.accent};
    border-radius: 4px;
  }
`;

const CloseButton = styled.button `
  position: absolute;
  right: 15px;
  top: 15px;
  background: transparent;
  color: ${theme.colors.accent};
  font-size: ${theme.typography.fontSize.medium};
  font-family: ${theme.typography.fontFamily};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.borderRadius.pill};
  transition: ${theme.transitions.default};
  transform: ${theme.transforms.buttonRest};
  box-shadow: ${theme.shadows.main};
  outline: none;
  border: 1px solid transparent;

  &:hover {
    ${theme.hover.effect}
  }
`;

const Header = styled.h4 `
  margin: 0 0 20px 0;
  font-size: ${theme.typography.fontSize.medium};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.accent};
  padding-bottom: 8px;
`;

// 输入框基础样式 (可扩展) / Base style for inputs (can be extended)
const InputBase = styled.input ` // 使用 input 进行搜索 / Use input for search
  width: 100%;
  height: 42px; // 明确设置高度 / Explicitly set height
  padding: 10px;
  margin-bottom: 15px;
  color: ${theme.colors.primary}; // 深色文本 / Dark text
  border-radius: ${theme.borderRadius.small};
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize.small};
  box-sizing: border-box;
  outline: none;
  background-color: ${theme.colors.accent}; // Default beige background
  border: 1px solid transparent;
  transition: ${theme.transitions.default};
  
  &:hover, &:focus {
    border: 1px solid ${theme.colors.primary};
    transform: scale(1.01);
    box-shadow: ${theme.shadows.hover};
  }
`;

// 只为SearchInput使用InputBase
const SearchInput = styled(InputBase)
`
  background-color: #444444; // 深灰色背景 / Dark grey background
  color: ${theme.colors.accent}; // 米色文本 / Beige text
  border: none; // 无边框 / No border
  margin-bottom: 10px;
  
  &:hover, &:focus {
    border: 1px solid ${theme.colors.accent};
  }
`;

const List = styled.ul `
  list-style: none;
  padding: 5px 2px 5px 0;
  margin: 0;
  overflow-y: auto;
  flex: 1; // 占据剩余空间 / Take remaining space

  // 统一滚动条样式 / Unified Scrollbar Styles
  scrollbar-width: 10px;
  scrollbar-color: ${theme.colors.accent} transparent;

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.accent};
    border-radius: 4px;
  }
`;

const ListItem = styled.li `
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${theme.colors.accent};
  transition: ${theme.transitions.default};
  color: ${theme.colors.accent}; // Default Beige text
  font-size: ${theme.typography.fontSize.small};
  overflow: hidden;
  cursor: ${props => props.canClick ? 'pointer' : 'not-allowed'};
  opacity: ${props => props.canClick ? 1 : 0.7};
  outline: none;

  // Highlighted style (currently displayed)
  ${props => props.isHighlighted && `
    background-color: ${theme.colors.accent}; // Solid beige background
    color: ${theme.colors.primary}; // Dark Green text
    // padding-bottom: 8px; // Adjust padding if needed due to border-bottom interaction?
  `}

  // 悬停效果 (仅当可点击时) / Hover effect (only when clickable)
  &:hover {
    ${props => props.canClick && `
      background-color: rgba(245, 245, 220, 0.15); // 淡米色悬停效果 / Subtle beige hover
      // border-color: ${theme.colors.accent}; // 无需改变边框颜色 / No border change needed
    `}
  }
`;

const Thumbnail = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  margin-right: 10px;
  flex-shrink: 0;
  // 无边框，无圆角 / No border, no radius
`;

const FilenameSpan = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const MoreButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  height: 64px;
  width: 132px;
  padding: 0 10px;
  background: ${theme.glassmorphism.background};
  backdrop-filter: ${theme.glassmorphism.blur};
  color: ${theme.colors.accent};
  border-radius: ${theme.borderRadius.pill};
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize.medium};
  font-weight: ${theme.typography.fontWeight.medium};
  box-shadow: ${theme.shadows.main};
  cursor: pointer;
  z-index: 1001;
  transition: ${theme.transitions.default};
  transform: ${theme.transforms.buttonRest};
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border: 1px solid transparent;

  &:hover {
    ${theme.hover.effect}
  }

  &:active {
    transform: scale(0.95);
  }
`;

// 新增样式组件 / New styled components
const SelectContainer = styled.div`
  display: flex;
  align-items: stretch; // 改为stretch使子元素高度一致 / Change to stretch to make child elements have the same height
  margin-bottom: 15px;
  gap: 10px;
`;

const SelectWrapper = styled.div`
  flex: 1;
  position: relative;
  height: 42px; // 确保与InputBase相同高度 / Ensure the same height as InputBase
`;

// 统一的计数器容器 / Unified counter container
const CounterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.glassmorphism.background};
  backdrop-filter: ${theme.glassmorphism.blur};
  color: ${theme.colors.accent};
  border-radius: ${theme.borderRadius.pill};
  height: 38px;
  padding: 0 12px;
  gap: 8px;
  box-sizing: border-box;
  outline: none;
  border: none; // 移除容器本身的边框
  box-shadow: none; // 移除容器本身的阴影
  transition: ${theme.transitions.default};
  z-index: 1; // 确保层级

  /* 使用伪元素实现放大效果，避免影响内容 */
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: ${theme.borderRadius.pill};
    border: 1px solid transparent; // 初始状态边框透明
    box-shadow: ${theme.shadows.main}; // 应用到伪元素上
    transition: ${theme.transitions.default};
    z-index: -1;
  }
  
  &:hover {
    // 移除容器本身的边框和阴影样式
    
    &::before {
      transform: scale(1.03);
      box-shadow: ${theme.shadows.hover}; // 悬停时阴影应用到伪元素 / Apply shadow to pseudo-element on hover
      border: 1px solid ${theme.colors.accent}; // 悬停时边框应用到伪元素 / Apply border to pseudo-element on hover
    }
  }
`;

// 确保CounterButton在悬停时能正常显示 / Ensure CounterButton displays correctly on hover
const CounterButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: ${theme.colors.accent};
  border-radius: ${theme.borderRadius.pill};
  border: none;
  cursor: pointer;
  transition: ${theme.transitions.default};
  transform: ${theme.transforms.buttonRest};
  outline: none;
  padding: 0;
  z-index: 2; // 确保按钮始终在顶层
  
  &:hover {
    transform: ${theme.transforms.buttonHover};
    background-color: rgba(245, 245, 220, 0.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      transform: none;
      background-color: transparent;
    }
  }
`;

const CountLabel = styled.span`
  color: ${theme.colors.accent};
  font-size: ${theme.typography.fontSize.small};
  font-family: ${theme.typography.fontFamily};
  min-width: 24px;
  text-align: center;
  font-weight: ${theme.typography.fontWeight.medium};
  user-select: none;
  z-index: 2; // 确保文字始终在顶层 / Ensure text is always on top
`;

// 添加自定义下拉选择器组件，位于其他样式组件之后 / Add custom dropdown selector component after other styled components
const StyledSelect = styled.div`
  position: relative;
  width: 100%;
  height: 42px;
  user-select: none;
`;

const SelectHeader = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${theme.colors.accent};
  color: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.small};
  display: flex;
  align-items: center;
  padding: 0 10px;
  cursor: pointer;
  box-sizing: border-box;
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize.small};
  font-weight: ${theme.typography.fontWeight.bold};
  transition: ${theme.transitions.default};
  border: 1px solid transparent;
  
  &:hover {
    border: 1px solid ${theme.colors.primary};
    transform: scale(1.01);
    box-shadow: ${theme.shadows.hover};
  }
`;

const SelectOptions = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: ${theme.colors.accentTransparent}; /* 使用简化后的半透明米色 */
  backdrop-filter: ${theme.glassmorphism.blur};
  border-radius: ${theme.borderRadius.small};
  margin-top: 5px;
  box-shadow: ${theme.shadows.main};
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  display: ${props => props.isOpen ? 'block' : 'none'};
  border: 1px solid ${theme.colors.primaryTransparent}; /* 使用简化后的半透明绿色 */
  
  /* 使用统一滚动条样式 / Use unified scrollbar styles */
  ${theme.scrollbar.styles}
`;

const SelectOption = styled.div`
  padding: 8px 10px;
  cursor: pointer;
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize.small};
  transition: ${theme.transitions.default};
  /* 修改颜色方案 / Modify color scheme */
  color: ${props => props.isSelected ? theme.colors.accent : theme.colors.primary};
  background-color: ${props => props.isSelected ? theme.colors.primary : 'transparent'};
  font-weight: ${props => props.isSelected ? theme.typography.fontWeight.bold : theme.typography.fontWeight.regular};
  
  &:hover {
    background-color: ${props => props.isSelected 
      ? theme.colors.primary 
      : theme.colors.primaryTransparent}; /* 使用简化后的半透明绿色 */
  }
`;

// 新增上传按钮样式 / New upload button styles
const UploadButton = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 42px;
  background: ${theme.colors.accent};
  color: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.small};
  cursor: pointer;
  margin-bottom: 15px;
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize.small};
  font-weight: ${theme.typography.fontWeight.medium};
  box-sizing: border-box;
  transition: ${theme.transitions.default};
  border: 1px solid transparent;
  gap: 8px;
  
  &:hover {
    border: 1px solid ${theme.colors.primary};
    transform: scale(1.01);
    box-shadow: ${theme.shadows.hover};
  }
  
  input {
    display: none;
  }
`;

// 上传预览区域样式
const UploadPreview = styled.div`
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: ${theme.borderRadius.small};
  padding: 10px;
  margin-bottom: 15px;
  gap: 10px;
`;

const PreviewImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.small};
  flex-shrink: 0;
`;

const PreviewInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; // 确保内容可以压缩
  
  span:first-of-type {
    color: ${theme.colors.accent};
    font-size: ${theme.typography.fontSize.small};
    font-weight: ${theme.typography.fontWeight.medium};
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%; // 确保文本不会溢出容器
  }
  
  span:last-of-type {
    color: ${theme.colors.accentTransparent};
    font-size: ${theme.typography.fontSize.smaller};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const PreviewButtonContainer = styled.div`
  display: flex;
  gap: 5px;
  flex-shrink: 0; // 防止按钮被压缩
`;

const PreviewButton = styled.button`
  background: ${theme.colors.accent};
  color: ${theme.colors.primary};
  border: none;
  border-radius: ${theme.borderRadius.small};
  padding: 5px 10px;
  font-size: ${theme.typography.fontSize.smaller};
  cursor: pointer;
  transition: ${theme.transitions.default};
  
  &:hover {
    transform: scale(1.05);
  }
`;

// --- End Styled Components ---

export function ImageListPanel({ 
  isVisible, 
  onClose, 
  updateArtworkData,
  originalArtworksConfig,
  currentArtworksConfig,
  zoomedLocationKey,
  onMoreClick // 新增 prop
}) {
  const { t, language } = useLanguage(); // 使用语言上下文
  const [imageList, setImageList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(''); // 新增状态，用于跟踪选中的替换位置
  const [searchTerm, setSearchTerm] = useState(''); // 1. 添加搜索状态
  const [artworkCount, setArtworkCount] = useState(2); // 默认画作数量为2
  const [isSelectOpen, setIsSelectOpen] = useState(false); // 控制下拉菜单展开/收起
  // 新增状态，用于管理上传的图片
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentUpload, setCurrentUpload] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // 解析文件名以包含标题和描述
    const images = Object.entries(imageModules).map(([path, url]) => {
      const filename = path.substring(path.lastIndexOf('/') + 1);
      const { title, description } = parseFilename(filename);
      return { filename, url, title, description }; // 存储解析出的数据
    });

    const models = Object.entries(modelModules).map(([path, url]) => {
      const filename = path.substring(path.lastIndexOf('/') + 1);
      const { title, description } = parseFilename(filename);
      return { 
        filename, 
        url, 
        title: title || filename.split('.')[0].replace(/_/g, ' '), 
        description: description, // No fallback here, let it be null if not parsed
        isModel: true
      };
    });

    const videos = Object.entries(videoModules).map(([path, url]) => {
      const filename = path.substring(path.lastIndexOf('/') + 1);
      const { title, description } = parseFilename(filename);
      return { 
        filename, 
        url, 
        title: title || filename.split('.')[0].replace(/_/g, ' '), 
        description: description, // No fallback here either
        isVideo: true
      };
    });
    
    setImageList([...images, ...models, ...videos]);
    
    // 从 localStorage 加载上传的图片
    const savedImages = getUploadedImages();
    if (savedImages && savedImages.length > 0) {
      setUploadedImages(savedImages);
    }
  }, []);

  // 当上传图片变化时保存到 localStorage
  useEffect(() => {
    if (uploadedImages.length > 0) {
      saveUploadedImages(uploadedImages);
    }
  }, [uploadedImages]);

  // 从原始配置生成下拉选项 - 修改为使用currentArtworksConfig
  const locationOptions = useMemo(() => {
    const options = [];
    if (!currentArtworksConfig) return options;

    if (currentArtworksConfig.central) {
      // 使用翻译的位置名称
      options.push({ value: 'central', label: t('imagePanel.entrance_wall') }); 
    }
    if (currentArtworksConfig.left) {
      currentArtworksConfig.left.forEach((artwork, index) => {
        // 使用翻译的位置名称和编号
        options.push({ value: `left[${index}]`, label: `${t('imagePanel.left_wall')} ${index + 1}` }); 
      });
    }
    if (currentArtworksConfig.right) {
      currentArtworksConfig.right.forEach((artwork, index) => {
        // 使用翻译的位置名称和编号
        options.push({ value: `right[${index}]`, label: `${t('imagePanel.right_wall')} ${index + 1}` }); 
      });
    }
    
    // 添加sculpture选项
    options.push({ 
      value: 'sculpture', 
      label: t('imagePanel.sculpture') || '雕塑', // 使用翻译文本或默认值
      isModel: true // 标记为模型类型
    });
    
    // 添加film选项
    options.push({ 
      value: 'film', 
      label: t('imagePanel.film') || '视频', // 使用翻译文本或默认值
      isVideo: true // 标记为视频类型
    });
    
    return options;
  }, [currentArtworksConfig, language, t]); // 添加t作为依赖

  // 新增 useEffect: 当外部 zoomedLocationKey 改变时，同步更新本地 selectedLocation
  useEffect(() => {
    // 检查传入的 key 是否是有效的选项
    const isValidKey = locationOptions.some(option => option.value === zoomedLocationKey);
    
    if (zoomedLocationKey && isValidKey) {
      // 设置选中的位置
      setSelectedLocation(zoomedLocationKey);
      
      // 如果有搜索词，清空它以确保可以看到所有图片
      if (searchTerm) {
        setSearchTerm('');
      }
      
      // 滚动到对应的位置（如果列表已渲染）
      // 使用setTimeout确保在DOM更新后执行
      setTimeout(() => {
        const selectedElement = document.querySelector(`[data-location="${zoomedLocationKey}"]`);
        if (selectedElement) {
          selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } else if (!zoomedLocationKey && selectedLocation === '' && locationOptions.length > 0) {
      // 仅当没有放大的画作且当前没有选择任何位置时，才默认选择第一个位置
      setSelectedLocation(locationOptions[0].value);
    }
    // 当zoomedLocationKey变为空时，不再自动重置selectedLocation，保持用户的手动选择
  }, [zoomedLocationKey, locationOptions, searchTerm, selectedLocation]); // 添加selectedLocation作为依赖

  // 2. 创建当前展示图片的 URL 集合 - 更新为包含上传图片
  const currentImageUrls = useMemo(() => {
    const urls = new Set();
    if (!currentArtworksConfig) return urls;

    const addUrl = (artwork) => {
      if (artwork && artwork.imageUrl) {
        urls.add(artwork.imageUrl);
      }
    };

    addUrl(currentArtworksConfig.central);
    currentArtworksConfig.left?.forEach(addUrl);
    currentArtworksConfig.right?.forEach(addUrl);

    return urls;
  }, [currentArtworksConfig]);

  // 3. 过滤图片列表 - 根据选择的位置类型过滤
  const filteredImageList = useMemo(() => {
    // 合并本地图片和上传图片
    let list = [...imageList, ...uploadedImages];
    
    // 获取当前选择的位置选项
    const selectedOption = locationOptions.find(opt => opt.value === selectedLocation);
    const isVideoLocation = selectedOption?.isVideo;
    const isModelLocation = selectedOption?.isModel;
    
    // 根据位置类型过滤媒体
    if (isVideoLocation) {
      // 如果是film位置，只显示视频文件
      list = list.filter(item => item.isVideo === true);
    } else if (isModelLocation) {
      // 如果是sculpture位置，只显示模型文件
      list = list.filter(item => item.isModel === true);
    } else {
      // 如果是普通位置，只显示图片（非视频非模型）文件
      list = list.filter(item => !item.isVideo && !item.isModel);
      
      // Filter by search term
      if (searchTerm) {
        list = list.filter(image =>
          image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
          image.title?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Add filtering for default artwork images (artwork1.jpg to artwork5.jpg)
      const defaultArtworkPattern = /^artwork[1-5]\.jpg$/i; 
      list = list.filter(image => !defaultArtworkPattern.test(image.filename));
    }

    return list;
  }, [imageList, searchTerm, uploadedImages, selectedLocation, locationOptions]);

  // 在组件挂载和配置更新时同步画作数量
  useEffect(() => {
    if (currentArtworksConfig && currentArtworksConfig.left) {
      const leftCount = currentArtworksConfig.left.length;
      setArtworkCount(leftCount); // 直接使用当前配置的左墙画作数量
    }
  }, [currentArtworksConfig]);

  // 处理增加画作数量后选中第一个新增的位置
  const handleIncreaseCount = () => {
    if (artworkCount < 5) { // 设置最大数量限制为5
      const newCount = artworkCount + 1;
      setArtworkCount(newCount);
      updateArtworksCount(newCount);
      
      // 如果当前未选择位置，自动选择第一个新增的左墙位置
      if (!selectedLocation) {
        // 延迟一点执行，确保新选项已更新
        setTimeout(() => {
          const newLeftPosition = `left[${artworkCount}]`;
          setSelectedLocation(newLeftPosition);
        }, 100);
      }
    }
  };
  
  // 处理减少画作数量
  const handleDecreaseCount = () => {
    if (artworkCount > 1) { // 设置最小数量限制为1
      const newCount = artworkCount - 1;
      setArtworkCount(newCount);
      updateArtworksCount(newCount);
    }
  };
  
  // 更新画作数量的函数
  const updateArtworksCount = (newCount) => {
    // 获取当前左右墙画作的配置
    const currentLeft = _.get(currentArtworksConfig, 'left', []);
    
    // 如果需要增加画作数量
    if (newCount > currentLeft.length) {
      // 克隆当前配置
      const newConfig = _.cloneDeep(currentArtworksConfig);
      
      // 左墙添加画作
      while (newConfig.left.length < newCount) {
        const templateArtwork = {
          imageUrl: '/images/placeholder.jpg',
          title: `Left Wall ${newConfig.left.length + 1}`,
          description: 'Place your description here.'
        };
        newConfig.left.push(templateArtwork);
      }
      
      // 右墙添加画作
      while (newConfig.right.length < newCount) {
        const templateArtwork = {
          imageUrl: '/images/placeholder.jpg',
          title: `Right Wall ${newConfig.right.length + 1}`,
          description: 'Place your description here.'
        };
        newConfig.right.push(templateArtwork);
      }
      
      // 更新画作配置
      updateArtworkData('wallCount', { 
        newConfig: newConfig,
        count: newCount
      });
    } 
    // 如果需要减少画作数量
    else if (newCount < currentLeft.length) {
      // 克隆当前配置
      const newConfig = _.cloneDeep(currentArtworksConfig);
      
      // 裁剪左右墙的画作列表
      newConfig.left = newConfig.left.slice(0, newCount);
      newConfig.right = newConfig.right.slice(0, newCount);
      
      // 更新画作配置
      updateArtworkData('wallCount', { 
        newConfig: newConfig,
        count: newCount
      });
    }
  };

  // 在列表项渲染时添加一个高亮效果，标识当前缩放的画作
  const isLocationZoomed = (locationValue) => {
    return zoomedLocationKey === locationValue;
  };

  // 在Select容器中添加视觉提示，显示当前选中的位置
  const renderSelectLabel = () => {
    // 优先显示用户手动选择的位置
    if (selectedLocation) {
      const option = locationOptions.find(opt => opt.value === selectedLocation);
      if (option) {
        return option.label;
      }
    }
    
    // 如果用户没有选择位置但有放大的画作，显示放大画作的位置
    if (zoomedLocationKey && !selectedLocation) {
      const option = locationOptions.find(opt => opt.value === zoomedLocationKey);
      if (option) {
        return option.label;
      }
    }
    
    return t('imagePanel.select_location');
  };

  // 新增处理下拉菜单点击事件
  const handleSelectHeaderClick = () => {
    setIsSelectOpen(!isSelectOpen);
  };

  // 新增处理选项点击事件
  const handleSelectOptionClick = (value) => {
    setSelectedLocation(value);
    setIsSelectOpen(false); // 选择后关闭下拉菜单
  };

  // 点击外部时关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      const selectElement = document.querySelector('.styled-select');
      if (selectElement && !selectElement.contains(event.target)) {
        setIsSelectOpen(false);
      }
    };

    if (isSelectOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSelectOpen]);

  // 处理图片点击事件 - 加入默认描述逻辑
  const handleImageClick = (imageData) => {
    const { url, title: parsedTitle, description: parsedDescription, videoUrl } = imageData;
    
    if (!selectedLocation) {
      alert(t('imagePanel.location_prompt'));
      return;
    }
    
    const selectedOption = locationOptions.find(opt => opt.value === selectedLocation);
    const isVideoLocation = selectedOption?.isVideo;
    const isModelLocation = selectedOption?.isModel;

    let finalDescription;
    if (parsedDescription !== null) {
      // Priority 1: Use description from filename if it exists.
      finalDescription = parsedDescription;
    } else {
      // Priority 2: If no description in filename, use generic descriptions based on type.
      if (isModelLocation) {
        finalDescription = t('imagePanel.custom_model_desc');
      } else if (isVideoLocation) {
        finalDescription = t('imagePanel.custom_video_desc');
      } else {
        // Priority 3: For paintings, fall back to the description of the slot being replaced.
      finalDescription = _.get(
        originalArtworksConfig, 
        `${selectedLocation}.description`, 
          t('imagePanel.custom_image_desc') // Use a better fallback
      );
      }
    }

    if (updateArtworkData) {
      // 根据位置类型决定如何更新数据
      if (isVideoLocation) {
        // 如果是film位置，添加视频类型标记
        const actualVideoUrl = videoUrl || url; // 使用videoUrl如果存在，否则使用url
        console.log('更新视频位置数据:', {
          位置: selectedLocation,
          视频URL: actualVideoUrl,
          标题: parsedTitle
        });
        
        updateArtworkData(selectedLocation, { 
          videoUrl: actualVideoUrl, // 使用videoUrl而不是imageUrl
          imageUrl: url, // 保持兼容性
          title: parsedTitle, 
          description: finalDescription,
          isVideo: true, // 标记为视频类型
          type: 'video' // 明确标记类型
        });
        
        // 添加调试代码，查看更新后的配置
        setTimeout(() => {
          if (window.currentArtworksConfig && window.currentArtworksConfig.film) {
            console.log('更新后的film配置:', window.currentArtworksConfig.film);
          }
        }, 100);
      } else if (isModelLocation) {
        // 如果是sculpture位置，添加模型类型标记
        console.log('更新雕塑位置数据:', {
          位置: selectedLocation,
          模型URL: url,
          标题: parsedTitle
        });
        
        updateArtworkData(selectedLocation, { 
          modelUrl: url, // 使用url作为模型URL
          title: parsedTitle, 
          description: finalDescription,
          isModel: true, // 标记为模型类型
          type: 'model' // 明确标记类型
        });
        
        // 添加调试代码，查看更新后的配置
        setTimeout(() => {
          if (window.currentArtworksConfig && window.currentArtworksConfig.sculpture) {
            console.log('更新后的sculpture配置:', window.currentArtworksConfig.sculpture);
          }
        }, 100);
      } else {
        // 普通画作位置
        updateArtworkData(selectedLocation, { 
          imageUrl: url, 
          title: parsedTitle, 
          description: finalDescription
        });
      }
    }
  };

  // 处理文件上传（图片、视频或模型）
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // 获取当前选择的位置选项
    const selectedOption = locationOptions.find(opt => opt.value === selectedLocation);
    const isModelLocation = selectedOption?.isModel;
    
    // 检查文件类型
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isModel = file.name.endsWith('.glb') || file.name.endsWith('.gltf');
    
    // 根据位置类型验证文件类型
    if (isModelLocation && !isModel) {
      alert(t('imagePanel.model_types') || '请上传.glb或.gltf格式的3D模型文件');
      return;
    } else if (!isModelLocation && !isImage && !isVideo) {
      alert(t('imagePanel.media_types') || '请上传图片或视频文件');
      return;
    }
    
    // 设置预览
    const fileUrl = URL.createObjectURL(file);
    
    // 格式化文件大小
    const size = formatFileSize(file.size);
    
    // 设置当前上传预览
    setCurrentUpload({
      file,
      imageUrl: fileUrl, // 保持兼容性
      videoUrl: isVideo ? fileUrl : null, // 如果是视频，设置videoUrl
      modelUrl: isModel ? fileUrl : null, // 如果是模型，设置modelUrl
      filename: file.name,
      size,
      type: file.type || 'model/glb', // 如果是模型文件，可能没有MIME类型
      isVideo: isVideo, // 标记是否为视频
      isModel: isModel // 标记是否为模型
    });
    
    // 清除文件输入，允许重复选择同一文件
    event.target.value = '';
  };
  
  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // 确认并添加上传的媒体文件（图片、视频或模型）
  const confirmUpload = () => {
    if (!currentUpload) return;
    
    // 读取文件内容为Data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      // 创建新的媒体对象
      const isVideo = currentUpload.isVideo;
      const isModel = currentUpload.isModel;
      const fileTitle = currentUpload.filename.split('.')[0].replace(/_/g, ' '); // 简单处理文件名为标题
      
      let description;
      if (isVideo) {
        description = t('imagePanel.custom_video_desc');
      } else if (isModel) {
        description = t('imagePanel.custom_model_desc');
      } else {
        description = t('imagePanel.custom_image_desc');
      }
      
      const newMedia = {
        filename: currentUpload.filename,
        url: e.target.result, // 使用Data URL作为通用URL
        title: fileTitle,
        description: description,
        isUploaded: true, // 标记为上传的文件
        isVideo: isVideo, // 标记是否为视频
        isModel: isModel, // 标记是否为模型
        videoUrl: isVideo ? e.target.result : null, // 如果是视频，设置videoUrl
        modelUrl: isModel ? e.target.result : null // 如果是模型，设置modelUrl
      };
      
      // 添加到上传媒体列表
      const updatedImages = [...uploadedImages, newMedia];
      setUploadedImages(updatedImages);
      
      // 保存到 localStorage
      saveUploadedImages(updatedImages);
      
      // 清除当前上传预览
      setCurrentUpload(null);
    };
    
    reader.readAsDataURL(currentUpload.file);
  };
  
  // 取消上传
  const cancelUpload = () => {
    if (currentUpload && currentUpload.imageUrl) {
      URL.revokeObjectURL(currentUpload.imageUrl); // 释放对象URL
    }
    setCurrentUpload(null);
  };

  // 删除上传图片
  const deleteUploadedImage = (imageUrl) => {
    const confirmed = confirm(t('imagePanel.delete_confirm'));
    if (confirmed) {
      const filteredImages = uploadedImages.filter(img => img.url !== imageUrl);
      setUploadedImages(filteredImages);
      // 保存到 localStorage
      saveUploadedImages(filteredImages);
    }
  };

  if (!isVisible) {
    return (
      <MoreButton onClick={onMoreClick}>
        {t('gallery.more')}
      </MoreButton>
    );
  }

  return (
    <>
      <Panel isVisible={isVisible}>
        <CloseButton onClick={onClose}>
          &times;
        </CloseButton>
        <Header>{t('imagePanel.title')}</Header> 
        
        {/* 添加上传按钮 */}
        <UploadButton>
          <FaUpload size={16} /> 
          {/* 根据选择的位置类型显示不同的上传按钮文本 */}
          {locationOptions.find(opt => opt.value === selectedLocation)?.isVideo 
            ? t('imagePanel.upload_video')
            : locationOptions.find(opt => opt.value === selectedLocation)?.isModel
              ? t('imagePanel.upload_model')
              : t('imagePanel.upload')}
          <input 
            type="file" 
            accept={locationOptions.find(opt => opt.value === selectedLocation)?.isVideo 
              ? "video/*" 
              : locationOptions.find(opt => opt.value === selectedLocation)?.isModel
                ? ".glb,.gltf"
                : "image/*"}
            onChange={handleFileUpload} 
            ref={fileInputRef}
          />
        </UploadButton>
        
        {/* 上传预览区域 */}
        {currentUpload && (
          <UploadPreview>
            {currentUpload.isVideo ? (
              <video 
                src={currentUpload.videoUrl} 
                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: theme.borderRadius.small, flexShrink: 0 }} 
                controls={false}
                muted
                autoPlay={false}
              />
            ) : currentUpload.isModel ? (
              <PreviewImage src={currentUpload.modelUrl} alt="Preview" />
            ) : (
              <PreviewImage src={currentUpload.imageUrl} alt="Preview" />
            )}
            <PreviewInfo>
              <span>{currentUpload.filename}</span>
              <span>
                {currentUpload.size} • {currentUpload.type.split('/')[1].toUpperCase()} 
                {currentUpload.isVideo && <span style={{color: '#ff9900', marginLeft: '5px'}}>{t('imagePanel.video_tag')}</span>}
              </span>
            </PreviewInfo>
            <PreviewButtonContainer>
              <PreviewButton onClick={confirmUpload} title={t('imagePanel.confirm')} style={{background: theme.colors.accent, color: 'green'}}>✓</PreviewButton>
              <PreviewButton onClick={cancelUpload} style={{background: 'transparent', color: 'red'}} title={t('imagePanel.cancel')}>✕</PreviewButton>
            </PreviewButtonContainer>
          </UploadPreview>
        )}
        
        <SelectContainer>
          <SelectWrapper>
            <StyledSelect className="styled-select">
              <SelectHeader onClick={handleSelectHeaderClick}>
                {renderSelectLabel()}
              </SelectHeader>
              <SelectOptions isOpen={isSelectOpen}>
                {locationOptions.map(option => (
                  <SelectOption 
                    key={option.value} 
                    isSelected={selectedLocation === option.value} 
                    onClick={() => handleSelectOptionClick(option.value)}
                  >
                    {option.label}
                    {isLocationZoomed(option.value) && 
                      <span style={{marginLeft: '8px', fontSize: '12px', opacity: '0.7'}}>{t('imagePanel.zoomed')}</span>
                    }
                  </SelectOption>
                ))}
              </SelectOptions>
            </StyledSelect>
          </SelectWrapper>
          
          <CounterContainer>
            <CounterButton 
              onClick={handleDecreaseCount}
              disabled={artworkCount <= 1}
              title={t('imagePanel.decrease_count')}
            >
              <FaMinus size={12} />
            </CounterButton>
            
            <CountLabel>{artworkCount}</CountLabel>
            
            <CounterButton 
              onClick={handleIncreaseCount}
              disabled={artworkCount >= 5}
              title={t('imagePanel.increase_count')}
            >
              <FaPlus size={12} />
            </CounterButton>
          </CounterContainer>
        </SelectContainer>

        <SearchInput
          type="text"
          placeholder={t('imagePanel.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <List>
          {filteredImageList.length > 0 ? (
            filteredImageList.map((image) => {
              const isCurrentlyDisplayed = currentImageUrls.has(image.url);
              const canClick = !!selectedLocation; // Simplified canClick check
              
              // 查找此图片对应的位置（如果有）
              let imageLocation = '';
              if (currentArtworksConfig) {
                if (currentArtworksConfig.central && currentArtworksConfig.central.imageUrl === image.url) {
                  imageLocation = 'central';
                } else {
                  currentArtworksConfig.left?.forEach((artwork, index) => {
                    if (artwork.imageUrl === image.url) {
                      imageLocation = `left[${index}]`;
                    }
                  });
                  currentArtworksConfig.right?.forEach((artwork, index) => {
                    if (artwork.imageUrl === image.url) {
                      imageLocation = `right[${index}]`;
                    }
                  });
                }
                // 检查是否在film中使用
                if (currentArtworksConfig.film && 
                    (currentArtworksConfig.film.imageUrl === image.url || 
                     currentArtworksConfig.film.videoUrl === image.url)) {
                  imageLocation = 'film';
                }
              }
              
              const isZoomedImage = imageLocation && isLocationZoomed(imageLocation);
              // 标记上传的图片 / Mark uploaded images
              const isUploaded = image.isUploaded;
              // 标记是否为视频 / Mark if it is a video
              const isVideo = image.isVideo;

              return (
                <ListItem 
                  key={image.url} // 使用URL作为key以避免重复 / Use URL as key to avoid duplicates
                  isHighlighted={isCurrentlyDisplayed}
                  canClick={canClick}
                  onClick={() => canClick && handleImageClick(image)} 
                  title={`${image.filename}${isCurrentlyDisplayed ? ' (Currently Displayed)' : ''}`}
                  data-location={imageLocation}
                  style={{
                    ...(isZoomedImage ? { 
                      borderLeft: `4px solid ${theme.colors.accent}`,
                      paddingLeft: '6px',
                      backgroundColor: theme.colors.primaryTransparent
                    } : {})
                  }}
                >
                  <Thumbnail src={image.url} alt={image.filename} />
                  <FilenameSpan>
                    {image.filename}
                    {isVideo && <span style={{marginLeft: '5px', fontSize: '10px', color: '#ff9900'}}>{t('imagePanel.video_tag')}</span>}
                    {image.isModel && <span style={{marginLeft: '5px', fontSize: '10px', color: '#3399ff'}}>{t('imagePanel.model_tag')}</span>}
                  </FilenameSpan>
                  {/* 添加明显的删除按钮，仅对上传的图片显示 / Add a prominent delete button, shown only for uploaded images */}
                  {isUploaded && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteUploadedImage(image.url);
                      }}
                      style={{
                        background: 'rgba(220, 53, 69, 0.9)', // 红色背景 / Red background
                        color: 'white', // 白色文字 / White text
                        border: '1px solid #dc3545',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        padding: '2px 8px',
                        marginLeft: '8px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '24px',
                        height: '24px',
                        transition: 'all 0.2s ease'
                      }}
                      title={t('imagePanel.delete')}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.background = '#dc3545'; // 纯红色 / Solid red
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.background = 'rgba(220, 53, 69, 0.9)'; // 半透明红色 / Translucent red
                        e.currentTarget.style.color = 'white';
                      }}
                    >
                      {t('imagePanel.delete')}
                    </button>
                  )}
                </ListItem>
              );
            })
          ) : (
            <ListItem canClick={false} style={{ justifyContent: 'center', color: 'grey' }}>
              {searchTerm ? t('imagePanel.no_match') : t('imagePanel.no_images')} 
            </ListItem> 
          )}
        </List>
      </Panel>
    </>
  );
}

ImageListPanel.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  updateArtworkData: PropTypes.func.isRequired,
  originalArtworksConfig: PropTypes.object.isRequired,
  currentArtworksConfig: PropTypes.object.isRequired,
  zoomedLocationKey: PropTypes.string,
  onMoreClick: PropTypes.func.isRequired
};

export default ImageListPanel;