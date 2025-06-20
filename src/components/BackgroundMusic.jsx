import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAudio } from '../contexts/AudioContext'

// 导出一个名为BackgroundMusic的函数，用于播放背景音乐
export function BackgroundMusic({ url = '/music/ambient.mp3' }) {
  // 使用useThree钩子获取相机
  const { camera } = useThree()
  // 使用useState钩子创建一个音频实例
  const [audio] = useState(() => new THREE.PositionalAudio(new THREE.AudioListener()))
  // 使用useAudio钩子获取音频状态
  const [audioState, setAudioState] = useAudio()
  
  // 使用useEffect钩子加载音频文件
  useEffect(() => {
    // 创建音频加载器
    const audioLoader = new THREE.AudioLoader()
    
    // 加载音频文件
    audioLoader.load(url, (buffer) => {
      audio.setBuffer(buffer)
      audio.setVolume(audioState.volume)
      audio.setLoop(true)
      audio.setRefDistance(20)
      audio.play()
      
      // 将音频实例保存到全局状态
      setAudioState(prev => ({ ...prev, audio }))
    })

    // 将音频监听器添加到相机
    camera.add(audio.listener)
    
    // 清理函数
    return () => {
      audio.stop()
      camera.remove(audio.listener)
    }
  }, [audio, camera, url, setAudioState, audioState.volume])

  // 监听全局状态变化
  useEffect(() => {
    if (!audio.buffer) return

    if (audioState.isPlaying) {
      audio.play()
    } else {
      audio.pause()
    }
    
    audio.setVolume(audioState.volume)
  }, [audio, audioState.isPlaying, audioState.volume])

  // 返回null，不渲染任何内容
  return null
} 