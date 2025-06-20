// 展品配置 / Artwork Configuration
export const ARTWORKS_CONFIG = {
    central: {
        position: [0, 6.2, 14.75],
        size: [12, 4.5, 0.1],
        rotation: [0, Math.PI, 0],
        imageUrl: "/images/artwork1.jpg",
        title: "入口墙展品 / Entrance Wall Exhibition",
        description: "陈列在入口墙上的艺术品。 / The artwork displayed on the entrance wall."
    },
    left: [{
            position: [-9.8, 5, 6],
            rotation: [0, Math.PI / 2, 0],
            imageUrl: "/images/artwork2.jpg",
            title: "左侧展品1 / Left Exhibition 1",
            description: "陈列在左墙的第一件艺术品。 / The first artwork displayed on the left wall."
        },
        {
            position: [-9.8, 5, -2],
            rotation: [0, Math.PI / 2, 0],
            imageUrl: "/images/artwork3.jpg",
            title: "左侧展品2 / Left Exhibition 2",
            description: "陈列在左墙的第二件艺术品。 / The second artwork displayed on the left wall."
        }
    ],
    right: [{
            position: [9.8, 5, 6],
            rotation: [0, -Math.PI / 2, 0],
            imageUrl: "/images/artwork4.jpg",
            title: "右侧展品1 / Right Exhibition 1",
            description: "陈列在右墙的第一件艺术品。 / The first artwork displayed on the right wall."
        },
        {
            position: [9.8, 5, -2],
            rotation: [0, -Math.PI / 2, 0],
            imageUrl: "/images/artwork5.jpg",
            title: "右侧展品2 / Right Exhibition 2",
            description: "陈列在右墙的第二件艺术品。 / The second artwork displayed on the right wall."
        }
    ],
    sculpture: {
        modelUrl: "/models/Laocoon and his Sons.glb",
        title: "拉奥孔和他的儿子们 / Laocoön and His Sons",
        description: "一件著名的古希腊雕塑，描绘了特洛伊祭司拉奥孔和他的儿子们被海蛇缠绕的情景。 / A famous ancient Greek sculpture, depicting the Trojan priest Laocoön and his sons being entwined by sea serpents.",
        isModel: true,
        type: "model"
    },
    film: {
        videoUrl: "/videos/videoplayback.mp4",
        isVideo: true,
        type: "video"
    }
}

// 上传图片存储键 / Uploaded Images Storage Key
export const uploadedImagesKey = 'virtualGallery_uploadedImages';

// 保存上传的图片到localStorage / Save uploaded images to localStorage
export const saveUploadedImages = (images) => {
    try {
        localStorage.setItem(uploadedImagesKey, JSON.stringify(images));
        return true;
    } catch (error) {
        console.error('保存上传图片失败 / Failed to save uploaded images:', error);
        return false;
    }
};

// 从localStorage获取上传的图片 / Get uploaded images from localStorage
export const getUploadedImages = () => {
    try {
        const images = localStorage.getItem(uploadedImagesKey);
        return images ? JSON.parse(images) : [];
    } catch (error) {
        console.error('获取上传图片失败 / Failed to get uploaded images:', error);
        return [];
    }
};

// 保存当前画廊配置到localStorage / Save current gallery configuration to localStorage
export const saveGalleryConfig = (config) => {
    try {
        localStorage.setItem('virtualGallery_config', JSON.stringify(config));
        return true;
    } catch (error) {
        console.error('保存画廊配置失败 / Failed to save gallery configuration:', error);
        return false;
    }
};

// 从localStorage获取画廊配置 / Get gallery configuration from localStorage
export const getGalleryConfig = () => {
    try {
        const config = localStorage.getItem('virtualGallery_config');
        return config ? JSON.parse(config) : null;
    } catch (error) {
        console.error('获取画廊配置失败 / Failed to get gallery configuration:', error);
        return null;
    }
};