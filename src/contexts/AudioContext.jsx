import { createContext, useContext, useState } from 'react'

// 创建一个名为AudioContext的上下文 / Create a context named AudioContext
const AudioContext = createContext(null)

// 导出一个名为AudioProvider的函数，接收一个参数children / Export a function named AudioProvider that takes children as a parameter
export function AudioProvider({ children }) {
  // 使用useState钩子，初始化audioState为一个对象，包含isPlaying、volume和audio三个属性
  // Use the useState hook to initialize audioState as an object with isPlaying, volume, and audio properties
  const [audioState, setAudioState] = useState({
    isPlaying: true,
    volume: 0.5,
    audio: null
  })

  // 返回一个AudioContext.Provider组件，将audioState和setAudioState作为value传递给子组件
  // Return an AudioContext.Provider component, passing audioState and setAudioState as value to child components
  return (
    <AudioContext.Provider value={[audioState, setAudioState]}>
      {children}
    </AudioContext.Provider>
  )
}

// 导出一个名为useAudio的函数，该函数使用AudioContext上下文 / Export a function named useAudio that uses the AudioContext
export const useAudio = () => useContext(AudioContext) 