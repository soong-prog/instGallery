// 语言资源文件 / Language resource file
export const translations = {
    en: {
        // 通用UI元素 / Common UI elements
        gallery: {
            title: "Virtual Art Gallery",
            loading: "Loading...",
            more: "More...",
            close: "Close",
        },
        // 导览手册 / Guidebook
        guide: {
            title: "Guide",
            panel_title: "Gallery Guide",
            open: "Open Guidebook",
            close: "Close Guidebook"
        },
        // 画作面板 / Artwork panel
        artwork: {
            zoom: "Double-click to zoom",
            loading_error: "Loading Error",
            check_path: "Please check if the image path is correct.",
        },
        // 图片列表面板 / Image list panel
        imagePanel: {
            title: "Replace Artwork",
            upload: "Upload Image",
            upload_video: "Upload Video",
            select_location: "-- Select location --",
            search: "Search images by filename...",
            no_match: "No images match your search.",
            no_images: "No images found.",
            location_prompt: "Please select the artwork location to replace.",
            confirm: "Confirm",
            cancel: "Cancel",
            delete_confirm: "Are you sure you want to delete this uploaded image?",
            uploaded: "(uploaded)",
            delete: "Delete",
            entrance_wall: "Entrance Wall",
            left_wall: "Left Wall",
            right_wall: "Right Wall",
            zoomed: "(zoomed)",
            image_types: "Image files only (JPEG, PNG, GIF, etc.)",
            media_types: "Please upload an image or video file",
            decrease_count: "Decrease artwork count",
            increase_count: "Increase artwork count",
            film: "Film",
            video_tag: "[Video]",
            sculpture: "Sculpture",
            upload_model: "Upload 3D Model",
            model_tag: "[3D Model]",
            custom_upload_description: "Custom uploaded image.",
            upload_failed: "Failed to load image, please check the file path.",
            custom_image_desc: "Custom uploaded image.",
            custom_video_desc: "Custom uploaded video.",
            custom_model_desc: "Custom uploaded 3D model."
        },
        // 提示和错误信息 / Tips and error messages
        messages: {
            save_success: "Changes saved successfully.",
            save_error: "Failed to save changes.",
            upload_success: "Image uploaded successfully.",
            upload_error: "Failed to upload image.",
        },
    },
    zh: {
        // 通用UI元素 / Common UI elements
        gallery: {
            title: "虚拟艺术画廊",
            loading: "加载中...",
            more: "更多...",
            close: "关闭",
        },
        // 导览手册 / Guidebook
        guide: {
            title: "导览",
            panel_title: "画廊导览",
            open: "打开导览手册",
            close: "关闭导览手册"
        },
        // 画作面板 / Artwork panel
        artwork: {
            zoom: "双击放大",
            loading_error: "加载失败",
            check_path: "请检查图片路径是否正确。",
        },
        // 图片列表面板 / Image list panel
        imagePanel: {
            title: "替换画作",
            upload: "上传本地图片",
            upload_video: "上传本地视频",
            upload_model: "上传3D模型",
            select_location: "-- 选择位置 --",
            search: "按文件名搜索图片...",
            no_match: "没有匹配的图片。",
            no_images: "未找到图片。",
            location_prompt: "请选择要替换的画作位置。",
            confirm: "确认",
            cancel: "取消",
            delete_confirm: "确定要删除这张上传的图片吗？",
            uploaded: "(上传)",
            delete: "删除",
            entrance_wall: "入口墙",
            left_wall: "左墙",
            right_wall: "右墙",
            zoomed: "(已放大)",
            image_types: "只能上传图片文件（如：JPEG, PNG, GIF等）",
            media_types: "请上传图片或视频文件",
            model_types: "请上传.glb或.gltf格式的3D模型文件",
            decrease_count: "减少画作数量",
            increase_count: "增加画作数量",
            film: "影片",
            video_tag: "[视频]",
            sculpture: "雕塑",
            model_tag: "[模型]",
            custom_upload_description: "自定义上传图片",
            upload_failed: "加载图片失败，请检查文件路径。",
            custom_image_desc: "自定义上传图片",
            custom_video_desc: "自定义上传视频",
            custom_model_desc: "自定义上传3D模型"
        },
        // 提示和错误信息 / Tips and error messages
        messages: {
            save_success: "更改已成功保存。",
            save_error: "保存更改失败。",
            upload_success: "图片上传成功。",
            upload_error: "图片上传失败。",
        },
    },
};

// 默认语言 / Default language
export const DEFAULT_LANGUAGE = "en";

// 检测浏览器语言 / Detect browser language
export const detectBrowserLanguage = () => {
    const browserLang = navigator.language || navigator.userLanguage;
    // 检查是否为中文 / Check if it's Chinese
    if (browserLang.startsWith("zh")) {
        return "zh";
    }
    return DEFAULT_LANGUAGE;
};

// 从localStorage获取语言设置，如果没有则使用浏览器语言 / Get language setting from localStorage, or use browser language if not available
export const getLanguage = () => {
    const savedLang = localStorage.getItem("virtualGallery_language");
    return savedLang || detectBrowserLanguage();
};

// 保存语言设置到localStorage / Save language setting to localStorage
export const saveLanguage = (lang) => {
    localStorage.setItem("virtualGallery_language", lang);
};

// 获取翻译文本 / Get translated text
export const getTranslation = (key, language = null) => {
    const lang = language || getLanguage();
    const keys = key.split(".");
    let result = translations[lang];

    // 通过点表示法访问嵌套对象 / Access nested objects via dot notation
    for (const k of keys) {
        if (result && result[k] !== undefined) {
            result = result[k];
        } else {
            // 如果找不到翻译，返回英文版本或原始键名 / If translation is not found, return the English version or the original key
            const englishVersion = getEnglishTranslation(key);
            return englishVersion || key;
        }
    }

    return result;
};

// 获取英文翻译文本(作为后备) / Get English translation as a fallback
export const getEnglishTranslation = (key) => {
    const keys = key.split(".");
    let result = translations["en"];

    for (const k of keys) {
        if (result && result[k] !== undefined) {
            result = result[k];
        } else {
            return null;
        }
    }

    return result;
};

// 翻译函数简写形式 / Shorthand for translation function
export const t = (key) => getTranslation(key);

// 创建语言切换函数 / Create language toggle function
export const toggleLanguage = () => {
    const currentLang = getLanguage();
    const newLang = currentLang === "zh" ? "en" : "zh";
    saveLanguage(newLang);
    // 强制页面刷新以应用新语言 / Force page reload to apply new language
    window.location.reload();
};