import { Html } from '@react-three/drei'
import { theme } from '../styles/theme'
import PropTypes from 'prop-types'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

// 定义新动画的关键帧 / Define keyframes for the new animation
const appleFadeSlideUp = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, 10px); /* 结合居中和向上滑动开始 / Combine centering and slide-up start */
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0px); /* 最终居中位置 / Final centered position */
  }
`;

// 创建动画样式组件 / Create animated styled component
const AnimatedPanel = styled.div`
  background: ${theme.glassmorphism.background};
  backdrop-filter: ${theme.glassmorphism.blur};
  color: ${theme.colors.accent};
  padding: 30px;
  border-radius: ${theme.borderRadius.panel};
  width: 600px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -120px;
  pointer-events: none;
  box-shadow: ${theme.shadows.main};
  will-change: opacity, transform;
  font-family: ${theme.typography.fontFamily};
  animation: ${appleFadeSlideUp} 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
`

const Title = styled.h3`
  margin: 0 0 15px 0;
  font-size: ${theme.typography.fontSize.large};
  font-family: ${theme.typography.fontFamily};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.accent};
  padding-bottom: 15px;
  text-align: center;
  border-bottom: 1px solid ${theme.colors.accent};
`

const Description = styled.p`
  margin: 0;
  font-size: ${theme.typography.fontSize.medium};
  font-family: ${theme.typography.fontFamily};
  font-weight: ${theme.typography.fontWeight.regular};
  line-height: 1.5;
  color: ${theme.colors.accent};
  text-align: center;
`

const Container = styled.div`
  position: fixed;
  pointer-events: none;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  z-index: 100;
`

export function InfoPanel({ position, title, description }) {
  return (
    <Html
      position={position}
      portal={{current: document.body}}
    >
      <Container>
        <AnimatedPanel className="info-panel">
          <Title>{title}</Title>
          <Description>{description}</Description>
        </AnimatedPanel>
      </Container>
    </Html>
  )
}

InfoPanel.propTypes = {
  position: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
}
