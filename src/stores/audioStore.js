import { create } from 'zustand'
import { debug } from '../utils/debug'

export const useAudioStore = create((set, get) => ({
  // 状态 / State
  isPlaying: true,
  volume: 0.5,
  audio: null,

  // 操作 / Actions
  setAudio: (audio) => {
    debug.log('设置音频实例 / Setting audio instance')
    set({ audio })
    
    // 同步音频实例的状态 / Synchronize the state of the audio instance
    const { volume, isPlaying } = get()
    if (audio) {
      audio.setVolume(volume)
      if (isPlaying) {
        audio.play()
      } else {
        audio.pause()
      }
    }
  },

  togglePlay: () => {
    debug.log('切换音频播放 / Toggling audio playback')
    set((state) => {
      const newIsPlaying = !state.isPlaying
      if (state.audio) {
        if (newIsPlaying) {
          state.audio.play()
        } else {
          state.audio.pause()
        }
      }
      return { isPlaying: newIsPlaying }
    })
  },

  setVolume: (volume) => {
    debug.log('设置音频音量 / Setting audio volume:', volume)
    set((state) => {
      if (state.audio) {
        state.audio.setVolume(volume)
      }
      return { volume }
    })
  },

  // 静音/取消静音 / Mute/unmute
  toggleMute: () => {
    debug.log('切换音频静音 / Toggling audio mute')
    set((state) => {
      const wasMuted = state.volume === 0
      const newVolume = wasMuted ? 0.5 : 0
      if (state.audio) {
        state.audio.setVolume(newVolume)
      }
      return { volume: newVolume }
    })
  },

  // 清理函数 / Cleanup function
  cleanup: () => {
    debug.log('清理音频 / Cleaning up audio')
    const { audio } = get()
    if (audio) {
      audio.stop()
      audio.listener && audio.listener.parent && audio.listener.parent.remove(audio.listener)
    }
    set({ audio: null })
  }
})) 