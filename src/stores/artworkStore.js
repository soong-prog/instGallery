import { create } from 'zustand'
import _ from 'lodash'
import { ARTWORKS_CONFIG } from '../config/artworks'
import { debug } from '../utils/debug'

// 辅助函数：从位置键获取索引 / Helper function: Get index from location key
const getIndexFromLocationKey = (locationKey, config) => {
  if (!config) return -1;
  
  if (locationKey === 'central') {
    return 0;
  }
  
  const matchLeft = locationKey.match(/^left\[(\d+)\]$/);
  if (matchLeft) {
    const index = parseInt(matchLeft[1], 10);
    return 1 + index;
  }
  
  const matchRight = locationKey.match(/^right\[(\d+)\]$/);
  if (matchRight) {
    const index = parseInt(matchRight[1], 10);
    const leftLength = config.left ? config.left.length : 0;
    return 1 + leftLength + index;
  }
  
  return -1;
};

// 辅助函数：从索引获取位置键 / Helper function: Get location key from index
const getLocationKeyFromIndex = (index, config) => {
  if (!config || index < 0) return '';
  
  if (index === 0) {
    return 'central';
  }
  
  const leftLength = config.left ? config.left.length : 0;
  if (index <= leftLength) {
    return `left[${index - 1}]`;
  }
  
  const rightIndex = index - 1 - leftLength;
  if (config.right && rightIndex < config.right.length) {
    return `right[${rightIndex}]`;
  }
  
  return '';
};

export const useArtworkStore = create((set, get) => ({
  // 状态 / State
  artworkRefs: [],
  zoomedArtworkIndex: -1,
  zoomedLocationKey: '',
  currentArtworksConfig: _.cloneDeep(ARTWORKS_CONFIG),
  isImageListVisible: false,

  // 操作 / Actions
  setArtworkRefs: (refs) => {
    debug.log('设置艺术品引用 / Setting artwork refs')
    set({ artworkRefs: refs })
  },

  setZoomedArtwork: (index, key) => {
    debug.log('设置缩放的艺术品 / Setting zoomed artwork:', { index, key })
    set({ 
      zoomedArtworkIndex: index,
      zoomedLocationKey: key 
    })
  },

  handleArtworkZoom: (index) => {
    debug.log('处理艺术品缩放 / Handling artwork zoom:', index)
    const state = get()
    let newZoomedIndex = -1
    let newZoomedKey = ''

    if (index === state.zoomedArtworkIndex) {
      // 关闭当前放大的画作 / Close the currently zoomed artwork
      debug.log('关闭缩放的艺术品 / Closing zoomed artwork')
    } else if (state.zoomedArtworkIndex !== -1) {
      // 从一个放大的画作切换到另一个 / Switch from one zoomed artwork to another
      newZoomedIndex = index
      newZoomedKey = getLocationKeyFromIndex(index, state.currentArtworksConfig)
      debug.log('切换到新的艺术品 / Switching to new artwork:', { newZoomedIndex, newZoomedKey })
    } else {
      // 从无放大状态放大一个画作 / Zoom in on an artwork from a non-zoomed state
      newZoomedIndex = index
      newZoomedKey = getLocationKeyFromIndex(index, state.currentArtworksConfig)
      debug.log('放大新的艺术品 / Zooming in new artwork:', { newZoomedIndex, newZoomedKey })
    }

    set({ 
      zoomedArtworkIndex: newZoomedIndex,
      zoomedLocationKey: newZoomedKey,
      isImageListVisible: newZoomedIndex !== -1 // 自动打开/关闭图片列表 / Automatically open/close the image list
    })
  },

  updateArtworkData: (locationKey, newData) => {
    debug.log('更新艺术品数据 / Updating artwork data:', { locationKey, newData })
    
    set((state) => {
      // 特殊处理 - 更新整个配置 / Special handling - update the entire configuration
      if (locationKey === 'wallCount') {
        const { newConfig } = newData
        return { currentArtworksConfig: newConfig }
      }

      // 常规更新 - 更新特定位置的画作数据 / Regular update - update artwork data at a specific location
      const { imageUrl, videoUrl, modelUrl, title, description, isVideo, isModel, type } = newData
      const newConfig = _.cloneDeep(state.currentArtworksConfig)
      
      try {
        // 根据数据类型更新不同的属性 / Update different properties based on data type
        if (imageUrl !== undefined) {
          _.set(newConfig, `${locationKey}.imageUrl`, imageUrl)
        }
        
        // 添加对视频相关属性的更新 / Add updates for video-related properties
        if (videoUrl !== undefined) {
          _.set(newConfig, `${locationKey}.videoUrl`, videoUrl)
        }
        
        if (isVideo !== undefined) {
          _.set(newConfig, `${locationKey}.isVideo`, isVideo)
        }
        
        // 添加对模型相关属性的更新 / Add updates for model-related properties
        if (modelUrl !== undefined) {
          _.set(newConfig, `${locationKey}.modelUrl`, modelUrl)
        }
        
        if (isModel !== undefined) {
          _.set(newConfig, `${locationKey}.isModel`, isModel)
        }
        
        if (type !== undefined) {
          _.set(newConfig, `${locationKey}.type`, type)
        }
        
        if (title !== undefined) {
          _.set(newConfig, `${locationKey}.title`, title)
        }
        
        if (description !== undefined) {
          _.set(newConfig, `${locationKey}.description`, description)
        }
        
        // 如果更新的是当前放大的画作，触发语音朗读 / If the updated artwork is the currently zoomed one, trigger speech synthesis
        const updatedIndex = getIndexFromLocationKey(locationKey, state.currentArtworksConfig)
        if (updatedIndex !== -1 && updatedIndex === state.zoomedArtworkIndex) {
          const speech = new SpeechSynthesisUtterance(`${title}. ${description}`)
          speech.lang = 'en-US'
          speech.rate = 1.0
          speech.pitch = 1
          window.speechSynthesis.cancel()
          window.speechSynthesis.speak(speech)
        }

        return { currentArtworksConfig: newConfig }
      } catch (error) {
        console.error("更新艺术品配置时出错 / Error updating artwork config:", error)
        return {} // 保持状态不变 / Keep state unchanged
      }
    })
  },

  toggleImageList: () => {
    debug.log('切换图片列表可见性 / Toggling image list visibility')
    set((state) => ({ isImageListVisible: !state.isImageListVisible }))
  },

  // 重置所有状态 / Reset all states
  resetState: () => {
    debug.log('重置艺术品仓库状态 / Resetting artwork store state')
    set({
      artworkRefs: [],
      zoomedArtworkIndex: -1,
      zoomedLocationKey: '',
      currentArtworksConfig: _.cloneDeep(ARTWORKS_CONFIG),
      isImageListVisible: false
    })
  }
})) 