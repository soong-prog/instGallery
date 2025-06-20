import { create } from 'zustand'
import { debug } from '../utils/debug'

export const useUIStore = create((set) => ({
  // 状态 / State
  isGuidebookOpen: false,
  isInfoPanelOpen: false,
  isMusicControlsOpen: false,
  isLoadingComplete: false,
  isIntroDialogOpen: true,
  
  // 操作 / Actions
  toggleGuidebook: () => {
    debug.log('切换导览手册 / Toggling guidebook')
    set((state) => ({ isGuidebookOpen: !state.isGuidebookOpen }))
  },

  toggleInfoPanel: () => {
    debug.log('切换信息面板 / Toggling info panel')
    set((state) => ({ isInfoPanelOpen: !state.isInfoPanelOpen }))
  },

  toggleMusicControls: () => {
    debug.log('切换音乐控件 / Toggling music controls')
    set((state) => ({ isMusicControlsOpen: !state.isMusicControlsOpen }))
  },

  setLoadingComplete: (isComplete) => {
    debug.log('设置加载完成状态 / Setting loading complete:', isComplete)
    set({ isLoadingComplete: isComplete })
  },

  closeIntroDialog: () => {
    debug.log('关闭介绍对话框 / Closing intro dialog')
    set({ isIntroDialogOpen: false })
  },

  // 重置所有状态 / Reset all states
  resetState: () => {
    debug.log('重置UI仓库状态 / Resetting UI store state')
    set({
      isGuidebookOpen: false,
      isInfoPanelOpen: false,
      isMusicControlsOpen: false,
      isLoadingComplete: false,
      isIntroDialogOpen: true
    })
  }
})) 