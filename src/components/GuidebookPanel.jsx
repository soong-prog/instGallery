import styled from '@emotion/styled'
import { theme } from '../styles/theme'
import { useState, useEffect, useMemo } from 'react'
import { FaBook } from 'react-icons/fa'
import PropTypes from 'prop-types'
import { useLanguage } from '../contexts/LanguageContext'

const Panel = styled.div `
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  background: ${theme.glassmorphism.background};
  backdrop-filter: ${theme.glassmorphism.blur};
  padding: 20px;
  border-radius: ${theme.borderRadius.panel};
  color: ${theme.colors.accent};
  box-shadow: ${theme.shadows.main};
  z-index: 9999;
  font-family: ${theme.typography.fontFamily};
  transform-origin: top right;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.isOpen ? 'scale(1) translateX(0)' : 'scale(0.8) translateX(20px)'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};

  display: flex;
  flex-direction: column;
  height: 80vh;

  // --- 统一滚动条样式 / Unified Scrollbar Styles ---
  // Firefox 的标准属性 / Standard properties for Firefox
  scrollbar-width: 10px; // 增加宽度 / Increase width
  scrollbar-color: ${theme.colors.accent} transparent; // 透明轨道 / Transparent track

  // 适用于 Chrome、Safari、Edge 等的 WebKit 伪元素 / WebKit pseudo-elements for Chrome, Safari, Edge etc.
  &::-webkit-scrollbar {
    width: 10px; // 增加宽度 / Increase width
  }

  &::-webkit-scrollbar-track {
    background: transparent; // 透明轨道 / Transparent track
    // border-radius: 4px; // 半径可能不需要或在透明轨道上不可见 / Radius might not be needed/visible on transparent track
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.accent}; // 米色滑块 / Beige thumb
    border-radius: 4px; // 保持滑块半径 / Keep thumb radius
  }
`

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

  &:active {
    transform: scale(0.95);
  }
`

const Title = styled.h3 `
  margin: 0;
  padding: 0;
  line-height: 1;
  margin-top: 5px;
  font-size: 36px;
  font-family: ${theme.typography.fontFamily};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.accent};
  padding-bottom: 25px;
  text-align: left;
  border-bottom: 1px solid ${theme.colors.accent};
`

const ScrollableContent = styled.div `
  flex: 1;
  overflow-y: auto;
  margin-top: 10px;
  padding-right: 5px;

  // --- 统一滚动条样式 / Unified Scrollbar Styles ---
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
`

const ArtworkContainer = styled.div `
  margin-bottom: 20px;
  padding-bottom: 15px;
  font-family: ${theme.typography.fontFamily};
  transition: all 0.3s ease;
  transform: translateY(${props => props.isOpen ? '0' : '20px'});
  opacity: ${props => props.isOpen ? '1' : '0'};
`

const ImageContainer = styled.div `
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 10px;
  background: transparent;
  border-radius: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  transform: scale(${props => props.isOpen ? '1' : '0.95'});
`

const ArtworkTitle = styled.h4 `
  margin: 0 0 10px 0;
  font-size: ${theme.typography.fontSize.medium};
  font-family: ${theme.typography.fontFamily};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.accent};
`

const ArtworkDescription = styled.p `
  margin: 0;
  font-size: ${theme.typography.fontSize.small};
  font-family: ${theme.typography.fontFamily};
  font-weight: ${theme.typography.fontWeight.regular};
  line-height: 1.5;
  color: ${theme.colors.accent};
`

const GuideButton = styled.button `
  position: fixed;
  top: 20px;
  right: 20px;
  height: 64px;
  width: 132px;
  padding: 0 10px;
  background: ${theme.glassmorphism.background};
  backdrop-filter: ${theme.glassmorphism.blur};
  color: ${theme.colors.accent};
  border-radius: ${theme.borderRadius.pill};
  cursor: pointer;
  font-size: ${theme.typography.fontSize.medium};
  font-family: ${theme.typography.fontFamily};
  font-weight: ${theme.typography.fontWeight.medium};
  z-index: 9999;
  box-shadow: ${theme.shadows.main};
  transition: ${theme.transitions.default};
  transform: ${theme.transforms.buttonRest};
  opacity: ${props => props.isOpen ? '0' : '1'};
  pointer-events: ${props => props.isOpen ? 'none' : 'auto'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  outline: none;
  border: 1px solid transparent;

  &:hover {
    ${theme.hover.effect}
  }

  &:active {
    transform: scale(0.95);
  }
`

export function GuidebookPanel({
    onArtworkZoom,
    zoomedArtworkIndex = -1,
    currentArtworksConfig
}) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(true)
    const [imageRatios, setImageRatios] = useState({})
    const [isAnimating, setIsAnimating] = useState(false)

    // 从传递的配置生成 allArtworks 数组 / Generate allArtworks array from the passed configuration
    const allArtworks = useMemo(() => {
        if (!currentArtworksConfig) return []; // 处理配置未加载的情况
        const artworks = [];
        if (currentArtworksConfig.central) artworks.push(currentArtworksConfig.central);
        if (currentArtworksConfig.left) artworks.push(...currentArtworksConfig.left);
        if (currentArtworksConfig.right) artworks.push(...currentArtworksConfig.right);
        return artworks;
    }, [currentArtworksConfig]); // 当配置更新时重新计算

    // 预加载图片并获取比例 - 依赖 allArtworks
    useEffect(() => {
            setImageRatios({}) // 清空旧比例 / Clear old ratios
            allArtworks.forEach((artwork, index) => {
                if (!artwork || !artwork.imageUrl) return; // 添加检查 / Add check
                const img = new Image()
                img.onload = () => {
                    setImageRatios(prev => ({
                        ...prev,
                        [index]: img.width / img.height
                    }))
                }
                img.onerror = () => {
                    // 处理加载错误，例如设置默认比例 / Handle loading errors, e.g., set a default ratio
                    setImageRatios(prev => ({
                        ...prev,
                        [index]: 1 // 或者其他默认比例 / Or other default ratio
                    }))
                }
                img.src = artwork.imageUrl
            })
        }, [allArtworks]) // 当 allArtworks 改变时重新加载 / Reload when allArtworks changes

    const handleToggle = () => {
        if (isAnimating) return
        setIsAnimating(true)
        setIsOpen(!isOpen)
        setTimeout(() => {
            setIsAnimating(false)
        }, 400)
    }

    const handleImageDoubleClick = (index) => {
        if (onArtworkZoom) {
            onArtworkZoom(index);
        }
    }

    return ( <
        >
        <
        Panel isOpen = { isOpen } >
        <
        CloseButton onClick = { handleToggle }
        title = { t('guide.close') } > × < /CloseButton> <
        Title > { t('guide.panel_title') } < /Title>

        <
        ScrollableContent > {
            allArtworks.map((artwork, index) => {
                if (!artwork || !artwork.title || !artwork.description) return null;
                const isZoomed = zoomedArtworkIndex === index;
                return ( <
                    ArtworkContainer key = { index }
                    isOpen = { isOpen } >
                    <
                    ImageContainer isOpen = { isOpen }
                    onDoubleClick = {
                        () => handleImageDoubleClick(index)
                    }
                    style = {
                        {
                            cursor: 'pointer',
                            border: isZoomed ? `2px solid ${theme.colors.accent}` : 'none',
                            boxShadow: isZoomed ? theme.shadows.hover : 'none'
                        }
                    } >
                    <
                    div style = {
                        {
                            height: '160px',
                            width: imageRatios[index] ? `${160 * imageRatios[index]}px` : '160px',
                            position: 'relative'
                        }
                    } >
                    <
                    img src = { artwork.imageUrl || '/images/placeholder.jpg' } // 提供默认图片 / Provide default image
                    alt = { artwork.title }
                    style = {
                        {
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            objectPosition: 'left'
                        }
                    }
                    onError = {
                        (e) => {
                            e.target.src = '/images/placeholder.jpg'
                        }
                    }
                    /> < /
                    div > <
                    /ImageContainer> <
                    ArtworkTitle > { artwork.title } < /ArtworkTitle> <
                    ArtworkDescription > { artwork.description } < /ArtworkDescription> < /
                    ArtworkContainer >
                );
            })
        } <
        /ScrollableContent> < /
        Panel > <
        GuideButton isOpen = { isOpen }
        onClick = { handleToggle }
        title = { t('guide.open') } >
        <
        FaBook size = { 20 }
        /> <
        span > { t('guide.title') } < /span> < /
        GuideButton > <
        />
    )
}

GuidebookPanel.propTypes = {
    onArtworkZoom: PropTypes.func,
    zoomedArtworkIndex: PropTypes.number,
    currentArtworksConfig: PropTypes.object.isRequired, // 添加类型检查 / Add type checking
}