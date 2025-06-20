import styled from '@emotion/styled'
import { theme } from '../styles/theme'
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { useAudio } from '../contexts/AudioContext'
import { useState } from 'react'

const Container = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: ${theme.glassmorphism.background};
  backdrop-filter: ${theme.glassmorphism.blur};
  padding: 16px 15px;
  border-radius: ${theme.borderRadius.panel};
  color: ${theme.colors.accent};
  box-shadow: ${theme.shadows.main};
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 15px;
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize.medium};
  font-weight: ${theme.typography.fontWeight.regular};
  ${theme.animations.fadeIn}
  ${theme.animations.slideIn}
  animation: fadeIn 0.3s ease-out, slideIn 0.3s ease-out;
  transition: ${theme.transitions.default};
  transform: ${theme.transforms.buttonRest};
  border: none;

  &:hover {
    transform: scale(1.05);
    box-shadow: ${theme.shadows.hover};
  }
`

// 重新添加播放按钮样式组件 / Re-add play button styled component
const PlayButton = styled.button`
  background: ${theme.glassmorphism.background};
  backdrop-filter: ${theme.glassmorphism.blur};
  border: none;
  color: ${theme.colors.accent};
  padding: 8px;
  cursor: pointer;
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.typography.fontSize.medium};
  font-family: ${theme.typography.fontFamily};
  font-weight: ${theme.typography.fontWeight.medium};
  transition: ${theme.transitions.default};
  transform: ${props => props.isPressed ? 'scale(0.95)' : theme.transforms.buttonRest};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  outline: none;
  box-shadow: ${props => props.isPressed ? 'none' : theme.shadows.main};

  &:hover {
    transform: ${props => props.isPressed ? 'scale(0.95)' : theme.transforms.buttonHover};
    box-shadow: ${props => props.isPressed ? 'none' : theme.shadows.hover};
    border: ${props => props.isPressed ? 'none' : '1px solid #F5F5DC'};
  }
`

const VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 280px;
  transition: ${theme.transitions.default};
  padding: 2px;
  border-radius: ${theme.borderRadius.medium};
  font-family: ${theme.typography.fontFamily};
`

const VolumeIcon = styled.div`
  color: ${theme.colors.accent};
  font-size: ${theme.typography.fontSize.medium};
  font-family: ${theme.typography.fontFamily};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${theme.transitions.default};
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;

  &:hover {
    transform: scale(1.05);
  }
`

const Slider = styled.input`
  -webkit-appearance: none;
  width: 240px;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(to right, ${theme.colors.accent} ${props => props.value * 100}%, rgba(245, 245, 240, 0.2) ${props => props.value * 100}%);
  outline: none;
  transition: ${theme.transitions.default};

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: ${theme.colors.accent};
    border-radius: 50%;
    cursor: pointer;
    transition: ${theme.transitions.default};
    border: 1px solid transparent;

    &:hover {
      ${theme.hover.effect}
    }
  }

  &:hover {
    background: linear-gradient(to right, ${theme.colors.accent} ${props => props.value * 100}%, rgba(245, 245, 240, 0.3) ${props => props.value * 100}%);
  }
`

export function MusicControls() {
  const [audioState, setAudioState] = useAudio()
  const [buttonPressed, setButtonPressed] = useState(false)

  const handlePlayPause = () => {
    setButtonPressed(true)
    setAudioState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setAudioState(prev => ({ 
      ...prev, 
      volume: newVolume
    }))
  }

  const handleMuteToggle = () => {
    const wasMuted = audioState.volume === 0
    setAudioState(prev => ({ 
      ...prev, 
      volume: wasMuted ? 0.5 : 0 
    }))
  }

  return (
    <Container>
      <PlayButton 
        onClick={handlePlayPause}
        isPressed={buttonPressed}
      >
        {audioState.isPlaying ? <FaPause /> : <FaPlay />}
      </PlayButton>
      <VolumeContainer>
        <VolumeIcon onClick={handleMuteToggle}>
          {audioState.volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
        </VolumeIcon>
        <Slider
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={audioState.volume}
          onChange={handleVolumeChange}
        />
      </VolumeContainer>
    </Container>
  )
}