import * as THREE from 'three'

// 导出一个名为Lighting的函数 / Export a function named Lighting
export function Lighting() {
    return ( <
        > { /* 环境光 / Ambient Light */ } <
        ambientLight intensity = { 0.5 }
        color = "#EAF6FF" // AliceBlue / 爱丽丝蓝
        /
        >

        { /* 主要点光源 / Main Point Light */ } <
        pointLight position = {
            [0, 6.2, 0] } // 中央位置 / Center Position
        intensity = { 4 } // 强光照强度 / Strong Light Intensity
        castShadow shadowMapSize = {
            [2048, 2048] } // 阴影映射大小 / Shadow Map Size
        shadowBias = {-0.001 } // 减少阴影瑕疵 / Reduce Shadow Artifacts
        color = "#D3D3D3" // 浅灰色 / Light Gray
        distance = { 40 } // 充足的照射距离 / Sufficient Illumination Distance
        decay = { 1.5 } // 适中的衰减 / Moderate Decay
        power = { 800 } // 光源功率，提供更好的物理精确度 / Light Power, for better physical accuracy
        />

        { /* 后厅中央光源 / Rear Hall Center Light */ } <
        pointLight position = {
            [9.8, 6.2, -17.15] } // 后厅中央位置 / Rear Hall Center Position
        intensity = { 4 } // 复制属性 / Copied Property
        castShadow shadowMapSize = {
            [2048, 2048] } // 复制属性 / Copied Property
        shadowBias = {-0.001 } // 复制属性 / Copied Property
        color = "#D3D3D3" // 复制属性 / Copied Property
        distance = { 40 } // 复制属性 / Copied Property
        decay = { 1.5 } // 复制属性 / Copied Property
        power = { 800 } // 复制属性 / Copied Property
        /> <
        />
    )
}