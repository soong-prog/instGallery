import { Floor } from './components/Floor'
import { Wall } from './components/Wall'
import { Artwork } from '../Artwork'
import { Lighting } from '../Lighting'
import { wallPositions, wallRotations, artworkConfig } from './config/layout'

export function Gallery() {
  return (
    <>
      <Floor />

      {/* 墙面 */}
      <Wall position={wallPositions.back} rotation={wallRotations.back} />
      <Wall position={wallPositions.left} rotation={wallRotations.left} />
      <Wall position={wallPositions.right} rotation={wallRotations.right} />

      {/* 展品 */}
      <Artwork 
        {...artworkConfig.central}
      />

      {artworkConfig.left.map((artwork, index) => (
        <Artwork 
          key={`left-${index}`}
          {...artwork}
          size={[3, 2, 0.1]}
          rotation={[0, -Math.PI/2, 0]}
        />
      ))}

      {artworkConfig.right.map((artwork, index) => (
        <Artwork 
          key={`right-${index}`}
          {...artwork}
          size={[3, 2, 0.1]}
          rotation={[0, Math.PI/2, 0]}
        />
      ))}

      <Lighting />
    </>
  )
} 