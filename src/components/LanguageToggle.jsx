import React from 'react';
import styled from '@emotion/styled';
import { useLanguage } from '../contexts/LanguageContext';
import { theme } from '../styles/theme';

// 滑块容器 / Slider Container
const ToggleContainer = styled.div `
  position: fixed;
  left: 50%;
  top: 20px;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  background: ${theme.glassmorphism.background};
  backdrop-filter: ${theme.glassmorphism.blur};
  border-radius: ${theme.borderRadius.pill};
  padding: 4px;
  z-index: 90;
  box-shadow: ${theme.shadows.main};
  border: 1px solid transparent;
  overflow: hidden;
  user-select: none;
  width: 260px; /* 调整宽度 / Adjust width */
  height: 56px; /* 调整高度 / Adjust height */
  transition: all 0.2s ease-in-out;

  &:hover {
    box-shadow: ${theme.shadows.hover};
    transform: translateX(-50%) scale(1.03);
    border: 1px solid ${theme.colors.accent};
  }
`;

// 语言选项 / Language Option
const LanguageOption = styled.div `
  flex: 1;
  text-align: center;
  padding: 10px 0;
  font-family: ${theme.typography.fontFamily};
  font-size: ${theme.typography.fontSize.medium};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${props => props.active ? theme.colors.primary : theme.colors.accent};
  cursor: pointer;
  transition: color 0.3s ease;
  position: relative;
  z-index: 2;
`;

// 动态滑块 / Dynamic Slider
const Slider = styled.div `
  position: absolute;
  left: ${props => props.isZh ? 'calc(50%)' : '4px'};
  top: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  border-radius: ${theme.borderRadius.pill};
  background: ${theme.colors.accent};
  transition: left 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  z-index: 1;
`;

export const LanguageToggle = () => {
    const { language, toggleLanguage } = useLanguage();

    // 是否为中文 / Is Chinese
    const isZh = language === 'zh';

    return ( <
        ToggleContainer id = "language-toggle-button" >
        <
        Slider isZh = { isZh }
        /> <
        LanguageOption active = {!isZh }
        onClick = {
            () => isZh && toggleLanguage()
        } >
        EN <
        /LanguageOption> <
        LanguageOption active = { isZh }
        onClick = {
            () => !isZh && toggleLanguage()
        } >
        中文 <
        /LanguageOption> < /
        ToggleContainer >
    );
};

export default LanguageToggle;