import { create } from 'zustand'
import { debug } from '../utils/debug'

export const useMusicStore = create((set, get) => ({
  // 状态 / State
  isPlaying: false,
  currentTrack: null,
  volume: 0.5,
  playlist: [],
  
  // 操作 / Actions
  setPlaying: (isPlaying) => {
    debug.log('设置播放状态 / Setting playing state:', isPlaying)
    set({ isPlaying })
  },

  togglePlay: () => {
    debug.log('切换播放状态 / Toggling play state')
    set((state) => ({ isPlaying: !state.isPlaying }))
  },

  setCurrentTrack: (track) => {
    debug.log('设置当前曲目 / Setting current track:', track)
    set({ currentTrack: track })
  },

  setVolume: (volume) => {
    debug.log('设置音量 / Setting volume:', volume)
    const clampedVolume = Math.max(0, Math.min(1, volume))
    set({ volume: clampedVolume })
  },

  setPlaylist: (playlist) => {
    debug.log('设置播放列表 / Setting playlist:', playlist)
    set({ playlist })
  },

  nextTrack: () => {
    const state = get()
    const currentIndex = state.playlist.findIndex(track => track === state.currentTrack)
    const nextIndex = (currentIndex + 1) % state.playlist.length
    const nextTrack = state.playlist[nextIndex]
    debug.log('播放下一首曲目 / Playing next track:', nextTrack)
    set({ currentTrack: nextTrack })
  },

  previousTrack: () => {
    const state = get()
    const currentIndex = state.playlist.findIndex(track => track === state.currentTrack)
    const previousIndex = (currentIndex - 1 + state.playlist.length) % state.playlist.length
    const previousTrack = state.playlist[previousIndex]
    debug.log('播放上一首曲目 / Playing previous track:', previousTrack)
    set({ currentTrack: previousTrack })
  },

  // 重置所有状态 / Reset all states
  resetState: () => {
    debug.log('重置音乐仓库状态 / Resetting music store state')
    set({
      isPlaying: false,
      currentTrack: null,
      volume: 0.5,
      playlist: []
    })
  }
})) 