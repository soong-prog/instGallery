import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getLanguage, saveLanguage, t } from '../config/i18n';

// 创建语言上下文 / Create Language Context
export const LanguageContext = createContext();

// 自定义Hook，方便组件使用语言上下文 / Custom hook for easy consumption of language context
export const useLanguage = () => useContext(LanguageContext);

// 语言提供者组件 / Language Provider Component
export const LanguageProvider = ({ children }) => {
    // 从localStorage或浏览器设置获取初始语言 / Get initial language from localStorage or browser settings
    const [language, setLanguage] = useState('');

    // 组件挂载时初始化语言 / Initialize language on component mount
    useEffect(() => {
        const detectedLang = getLanguage();
        setLanguage(detectedLang);
    }, []);

    // 切换语言函数 / Function to toggle language
    const toggleLanguage = () => {
        const newLanguage = language === 'zh' ? 'en' : 'zh';
        setLanguage(newLanguage);
        saveLanguage(newLanguage);
        // 这里不强制刷新页面，让React的状态更新机制自然渲染 / No forced page refresh here, let React's state update mechanism render naturally
    };

    // 翻译函数，使用当前语言 / Translation function using the current language
    const translate = (key) => {
        return t(key);
    };

    const value = {
                language,
                toggleLanguage,
                t: translate,
                isZh: language === 'zh',
                isEn: language === 'en'
    };

    // 提供语言上下文 / Provide language context
    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

LanguageProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default LanguageProvider;