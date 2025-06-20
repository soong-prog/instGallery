import { Box } from '@react-three/drei'
import { Sculpture } from './Sculpture'
import { Lighting } from './Lighting'
import { useMemo, useRef, useEffect, forwardRef } from 'react'
import * as THREE from 'three'
import { TextureLoader } from 'three/src/loaders/TextureLoader.js'
import { useFrame, useThree } from '@react-three/fiber'
import { ARTWORKS_CONFIG } from '../config/artworks'
import { useGalleryCamera } from '../hooks/useGalleryCamera'
import { BackgroundMusic } from './BackgroundMusic'
import PropTypes from 'prop-types'
import { Artwork } from './Artwork'
import { ScreeningRoom } from './ScreeningRoom'

// 材质配置 / Material Configuration
const MATERIALS = {
    wall: {
        roughness: 1.0, 
        metalness: 0.0, 
        envMapIntensity: 0.2,
        clearcoat: 0.0, 
        clearcoatRoughness: 0.0,
        reflectivity: 0.2 
    },
    floor: {
        metalness: 0.0, 
        clearcoat: 0.0, 
        clearcoatRoughness: 0.0,
        reflectivity: 0.5,
        envMapIntensity: 0.5, 
        normalScale: new THREE.Vector2(0.6, 0.6),
        aoMapIntensity: 1.0, 
    }
}

// 布局配置 / Layout Configuration
const LAYOUT = {
    wall: {
        dimensions: {
            height: 12.1,
            thickness: 0.2,
            depth: 40
        },
        positions: {
            left: [-9.9, 6.05, -5], 
            newRight: [29.5, 6.05, -5] 
        },
        rotations: {
            back: [0, 0, 0],
            entrance: [0, 0, 0],
            left: [0, Math.PI / 2, 0],
            newRight: [0, -Math.PI / 2, 0]
        },
        innerPositions: {
            left: -9.8, 
            right: 29.4, 
        },
        artworksCount: {
            leftWall: 2,
            rightWall: 2
        }
    },
    ceiling: {
        dimensions: {
            width: 39.2, 
            depth: 40,
            thickness: 0.2
        },
        position: [9.8, 12.2, -5] 
    },
    floor: {
        dimensions: {
            width: 39.2, 
            depth: 40,
            thickness: 0.2
        },
        position: [9.8, -0.1, -5]
    },
    divider: { 
        opening: {
            width: 8,
            height: 10,
            positionZ: -10
        }
    },
    rooms: {
        frontHall: {
            xMin: -9.8,
            xMax: 9.8, 
            zMin: -10.5,
            zMax: 14.8
        },
        backHall: {
            xMin: -9.8,
            xMax: 9.8, 
            zMin: -24.8,
            zMax: -9.5
        },
        newRoom: { 
            xMin: 9.8, 
            xMax: 29.4, 
            zMin: -24.8, 
            zMax: -9.5
        }
    },
    artworks: ARTWORKS_CONFIG
}

const Floor = forwardRef((props, ref) => {
    const loader = useMemo(() => new TextureLoader(), []);

    const floorTextures = useMemo(() => {
        const texturePath = '/textures/floor/';
        const colorMap = loader.load(texturePath + 'Tiles131_1K-JPG_Color.jpg');
        const normalMap = loader.load(texturePath + 'Tiles131_1K-JPG_NormalGL.jpg');
        const roughnessMap = loader.load(texturePath + 'Tiles131_1K-JPG_Roughness.jpg');
        const aoMap = loader.load(texturePath + 'Tiles131_1K-JPG_AmbientOcclusion.jpg');

        const maps = [colorMap, normalMap, roughnessMap, aoMap];

        maps.forEach(map => {
            map.wrapS = map.wrapT = THREE.RepeatWrapping;
            map.repeat.set(4, 4);
            map.needsUpdate = true;
        });

        return { colorMap, normalMap, roughnessMap, aoMap };
    }, [loader]);

    const materialRef = useRef();

    return (
        <Box ref={ref}
            position={LAYOUT.floor.position}
            args={
            [
                LAYOUT.floor.dimensions.width,
                LAYOUT.floor.dimensions.thickness,
                LAYOUT.floor.dimensions.depth
            ]
        }
            receiveShadow>
            <meshPhysicalMaterial ref={materialRef} {...MATERIALS.floor}
                map={floorTextures.colorMap}
                normalMap={floorTextures.normalMap}
                roughnessMap={floorTextures.roughnessMap}
                aoMap={floorTextures.aoMap}
            />
        </Box>
    )
})
Floor.displayName = 'Floor'

const Wall = forwardRef(({ position, rotation, depth, textures }, ref) => {
    const { height, thickness } = LAYOUT.wall.dimensions;

    const isVertical = Math.abs(rotation[1]) > 0.1;
    const wallLength = isVertical ? depth : 0;

    return (
        <group ref={ref}
            position={position}
            rotation={rotation}>
            <Box args={
            [wallLength, height, thickness]
            }
                receiveShadow>
                <meshPhysicalMaterial {...MATERIALS.wall}
                    map={textures.colorMap}
                    normalMap={textures.normalMap}
                    roughnessMap={textures.roughnessMap}
                    aoMap={textures.aoMap}
                />
            </Box>
        </group>
    );
});
Wall.propTypes = {
    position: PropTypes.arrayOf(PropTypes.number).isRequired,
    rotation: PropTypes.arrayOf(PropTypes.number).isRequired,
    depth: PropTypes.number.isRequired,
    textures: PropTypes.object.isRequired,
};
Wall.displayName = 'Wall'

const Ceiling = forwardRef((props, ref) => {
    const loader = useMemo(() => new TextureLoader(), []);
    const entranceWallWidth = LAYOUT.rooms.newRoom.xMax - LAYOUT.rooms.frontHall.xMin;
    const entranceWallHeight = LAYOUT.wall.dimensions.height;
    const ceilingWidth = LAYOUT.ceiling.dimensions.width;
    const ceilingDepth = LAYOUT.ceiling.dimensions.depth;
    const wallRepeatX = 6;
    const wallRepeatY = 4;
    const repeatX = wallRepeatX * (ceilingWidth / entranceWallWidth);
    const repeatY = wallRepeatY * (ceilingDepth / entranceWallHeight);

    const ceilingTextures = useMemo(() => {
        const texturePath = '/textures/wall/';
        const colorMap = loader.load(texturePath + 'PaintedBricks004_1K-JPG_Color.jpg');
        const normalMap = loader.load(texturePath + 'PaintedBricks004_1K-JPG_NormalGL.jpg');
        const roughnessMap = loader.load(texturePath + 'PaintedBricks004_1K-JPG_Roughness.jpg');
        const aoMap = loader.load(texturePath + 'PaintedBricks004_1K-JPG_AmbientOcclusion.jpg');
        const maps = [colorMap, normalMap, roughnessMap, aoMap];
        maps.forEach(map => {
            map.wrapS = map.wrapT = THREE.RepeatWrapping;
            map.repeat.set(repeatX, repeatY);
            map.needsUpdate = true;
        });
        return { colorMap, normalMap, roughnessMap, aoMap };
    }, [loader, repeatX, repeatY]);

    return (
        <Box ref={ref}
            position={LAYOUT.ceiling.position}
            args={
            [
                LAYOUT.ceiling.dimensions.width,
                LAYOUT.ceiling.dimensions.thickness,
                LAYOUT.ceiling.dimensions.depth
            ]
        }
            receiveShadow>
            <meshPhysicalMaterial {...MATERIALS.wall}
                map={ceilingTextures.colorMap}
                normalMap={ceilingTextures.normalMap}
                roughnessMap={ceilingTextures.roughnessMap}
                aoMap={ceilingTextures.aoMap}
                side={THREE.DoubleSide}
            />
        </Box>
    )
})
Ceiling.displayName = 'Ceiling'

const DividerWall = forwardRef(({ textures }, ref) => {
    const galleryWidth = LAYOUT.rooms.frontHall.xMax - LAYOUT.rooms.frontHall.xMin;
    const wallHeight = LAYOUT.wall.dimensions.height;
    const { width: openingWidth, height: openingHeightDefined, positionZ } = LAYOUT.divider.opening;
    const dividerThickness = 1.0;
    const openingBottomYWorld = 0;
    const openingTopYWorld = openingBottomYWorld + openingHeightDefined;
    const sideWidth = (galleryWidth - openingWidth) / 2;
    const topWallHeight = wallHeight - openingTopYWorld;
    const groupCenterY = wallHeight / 2;
    const sideX = openingWidth / 2 + sideWidth / 2;
    const topWallCenterYRelative = (openingTopYWorld + wallHeight) / 2 - groupCenterY;

    const targetWorldWidthPerRepeat = 4;
    const targetWorldHeightPerRepeat = 3;

    const sideRepeatX = sideWidth / targetWorldWidthPerRepeat;
    const sideRepeatY = wallHeight / targetWorldHeightPerRepeat;
    const topRepeatX = openingWidth / targetWorldWidthPerRepeat;
    const topRepeatY = topWallHeight / targetWorldHeightPerRepeat;

    const [sideMaterial, topMaterial] = useMemo(() => {
        const sideTextures = {};
        const topTextures = {};

        Object.keys(textures).forEach(key => {
            if (textures[key]) {
                sideTextures[key] = textures[key].clone();
                sideTextures[key].repeat.set(sideRepeatX, sideRepeatY);
                sideTextures[key].needsUpdate = true;

                topTextures[key] = textures[key].clone();
                topTextures[key].repeat.set(topRepeatX, topRepeatY);
                topTextures[key].needsUpdate = true;
            }
        });

        const createMat = (tex) => new THREE.MeshPhysicalMaterial({
            ...MATERIALS.wall,
            map: tex.colorMap,
            normalMap: tex.normalMap,
            roughnessMap: tex.roughnessMap,
            aoMap: tex.aoMap,
        });

        return [createMat(sideTextures), createMat(topTextures)];
    }, [textures, sideRepeatX, sideRepeatY, topRepeatX, topRepeatY]);

    return (
        <group ref={ref}
            position={
            [0, groupCenterY, positionZ]
            }>
            <Box position={
            [-sideX, 0, 0]
        }
                args={
            [sideWidth, wallHeight, dividerThickness]
        }
                receiveShadow>
                <primitive object={sideMaterial}
                    attach="material" />
            </Box>
            <Box position={
            [sideX, 0, 0]
        }
                args={
            [sideWidth, wallHeight, dividerThickness]
        }
                receiveShadow>
                <primitive object={sideMaterial}
                    attach="material" />
            </Box>
            <Box position={
            [0, topWallCenterYRelative, 0]
        }
                args={
            [openingWidth, topWallHeight, dividerThickness]
        }
                receiveShadow>
                <primitive object={topMaterial}
                    attach="material" />
            </Box>
        </group>
    )
})
DividerWall.propTypes = {
    textures: PropTypes.shape({
        colorMap: PropTypes.instanceOf(THREE.Texture),
        normalMap: PropTypes.instanceOf(THREE.Texture),
        roughnessMap: PropTypes.instanceOf(THREE.Texture),
        aoMap: PropTypes.instanceOf(THREE.Texture),
    }).isRequired,
};
DividerWall.displayName = 'DividerWall'

export function Gallery({
    setArtworkRefs,
    zoomedArtworkIndex,
    onArtworkZoom,
    anyArtworkZoomed,
    currentArtworksConfig
}) {
    const { camera } = useThree()

    const floorRef = useRef();
    const ceilingRef = useRef();
    const leftWallRef = useRef();
    const frontRightWallRef = useRef();
    const extendedBackWallRef = useRef();
    const extendedEntranceWallRef = useRef();
    const newRightWallRef = useRef();
    const dividerWallRef = useRef();
    const sculptureRef = useRef();
    const screeningRoomRef = useRef();
    const collidableMeshesRef = useRef([]);
    const otherCollidablesRef = useRef([]);

    const cameraControls = useGalleryCamera(collidableMeshesRef);

    const artworkRefsInternal = useRef([]);

    const loader = useMemo(() => new TextureLoader(), []);
    const mainWallTextures = useMemo(() => {
        const texturePath = '/textures/wall/';
        const colorMap = loader.load(texturePath + 'PaintedBricks003_1K-JPG_Color.jpg');
        const normalMap = loader.load(texturePath + 'PaintedBricks003_1K-JPG_NormalGL.jpg');
        const roughnessMap = loader.load(texturePath + 'PaintedBricks003_1K-JPG_Roughness.jpg');
        const aoMap = loader.load(texturePath + 'PaintedBricks003_1K-JPG_AmbientOcclusion.jpg');

        const maps = [colorMap, normalMap, roughnessMap, aoMap];

        maps.forEach(map => {
            map.wrapS = map.wrapT = THREE.RepeatWrapping;
            map.repeat.set(6, 4);
            map.needsUpdate = true;
        });

        return { colorMap, normalMap, roughnessMap, aoMap };
    }, [loader]);

    const specialWallTextures = useMemo(() => {
        const texturePath = '/textures/wall/';
        const colorMap = loader.load(texturePath + 'PaintedBricks004_1K-JPG_Color.jpg');
        const normalMap = loader.load(texturePath + 'PaintedBricks004_1K-JPG_NormalGL.jpg');
        const roughnessMap = loader.load(texturePath + 'PaintedBricks004_1K-JPG_Roughness.jpg');
        const aoMap = loader.load(texturePath + 'PaintedBricks004_1K-JPG_AmbientOcclusion.jpg');

        const maps = [colorMap, normalMap, roughnessMap, aoMap];

        maps.forEach(map => {
            map.wrapS = map.wrapT = THREE.RepeatWrapping;
            map.repeat.set(6, 4);
            map.needsUpdate = true;
        });

        return { colorMap, normalMap, roughnessMap, aoMap };
    }, [loader]);

    useFrame((state, delta) => {
        if (cameraControls && typeof cameraControls.update === 'function') {
            cameraControls.update(delta);
        }
    });

    useEffect(() => {
        const objects = [
            floorRef.current,
            ceilingRef.current,
            leftWallRef.current,
            frontRightWallRef.current,

            extendedBackWallRef.current,
            extendedEntranceWallRef.current,
            newRightWallRef.current,
            dividerWallRef.current,
            sculptureRef.current,
        ].filter(Boolean);

        collidableMeshesRef.current = objects;
        
        otherCollidablesRef.current = objects;

    }, [currentArtworksConfig]);

    useEffect(() => {
        if (setArtworkRefs) {
            setArtworkRefs(artworkRefsInternal.current);
        }
    }, [setArtworkRefs]);

    const artworks = currentArtworksConfig || ARTWORKS_CONFIG;

    const calculateEqualSpacingPositions = (zMin, zMax, count) => {
        const length = zMax - zMin;
        const positions = [];

        for (let i = 1; i <= count; i++) {
            const z = zMin + (i / (count + 1)) * length;
            positions.push(z);
        }

        return positions;
    };

    const leftWallCount = artworks.left ? artworks.left.length : LAYOUT.wall.artworksCount.leftWall;
    const rightWallCount = artworks.right ? artworks.right.length : LAYOUT.wall.artworksCount.rightWall;

    const frontHallLeftPositions = calculateEqualSpacingPositions(
        LAYOUT.rooms.frontHall.zMin,
        LAYOUT.rooms.frontHall.zMax,
        leftWallCount
    );

    const frontHallRightPositions = calculateEqualSpacingPositions(
        LAYOUT.rooms.frontHall.zMin,
        LAYOUT.rooms.frontHall.zMax,
        rightWallCount
    );

    const calculateArtworkSize = (count) => {
        const defaultCount = 2;
        const defaultWidth = 6;
        const defaultHeight = 4;
        const minWidth = 3;
        const maxWidth = 9;

        let width = defaultWidth * (defaultCount / count);
        width = Math.max(minWidth, Math.min(maxWidth, width));
        const aspectRatio = defaultWidth / defaultHeight;
        const height = width / aspectRatio;

        return [width, height, 0.1];
    };

    const leftWallArtworkSize = calculateArtworkSize(leftWallCount);
    const rightWallArtworkSize = calculateArtworkSize(rightWallCount);

    const extendedWallParams = useMemo(() => {
        const backHeight = LAYOUT.wall.dimensions.height;
        const backWidth = LAYOUT.rooms.newRoom.xMax - LAYOUT.rooms.backHall.xMin;
        const backPositionX = (LAYOUT.rooms.newRoom.xMax + LAYOUT.rooms.backHall.xMin) / 2;
        const backPositionZ = LAYOUT.rooms.backHall.zMin - LAYOUT.wall.dimensions.thickness / 2;

        const entranceHeight = LAYOUT.wall.dimensions.height;
        const entranceWidth = LAYOUT.rooms.newRoom.xMax - LAYOUT.rooms.frontHall.xMin;
        const entrancePositionX = (LAYOUT.rooms.newRoom.xMax + LAYOUT.rooms.frontHall.xMin) / 2;
        const entrancePositionZ = LAYOUT.rooms.frontHall.zMax + LAYOUT.wall.dimensions.thickness / 2;

        return {
            back: { width: backWidth, height: backHeight, position: [backPositionX, backHeight / 2, backPositionZ], rotation: [0, 0, 0] },
            entrance: { width: entranceWidth, height: entranceHeight, position: [entrancePositionX, entranceHeight / 2, entrancePositionZ], rotation: [0, 0, 0] }
        };
    }, []);

    const frontHallRightWallParams = useMemo(() => {
        const height = LAYOUT.wall.dimensions.height;
        const depth = LAYOUT.rooms.frontHall.zMax - LAYOUT.rooms.frontHall.zMin;
        const positionX = LAYOUT.rooms.frontHall.xMax + LAYOUT.wall.dimensions.thickness / 2;
        const positionZ = (LAYOUT.rooms.frontHall.zMax + LAYOUT.rooms.frontHall.zMin) / 2;

        return { width: depth, height: height, position: [positionX, height / 2, positionZ], rotation: [0, Math.PI / 2, 0] };

    }, []);

    const galleryLayoutDimensions = useMemo(() => ({
        width: LAYOUT.floor.dimensions.width,
        depth: LAYOUT.floor.dimensions.depth,
        height: LAYOUT.wall.dimensions.height
    }), []);

    return (
        <>
            <BackgroundMusic url="/music/ambient.mp3"
                volume={
                    0.3
                }
        />

            <Ceiling ref={ceilingRef}
            />
            <Floor ref={floorRef}
        />

            <group ref={extendedBackWallRef}
                position={extendedWallParams.back.position}
                rotation={
                    extendedWallParams.back.rotation
                }>
                <Box args={
            [extendedWallParams.back.width, extendedWallParams.back.height, LAYOUT.wall.dimensions.thickness]
        }
                    receiveShadow>
                    <meshPhysicalMaterial {...MATERIALS.wall}
                        map={mainWallTextures.colorMap}
                        normalMap={mainWallTextures.normalMap}
                        roughnessMap={mainWallTextures.roughnessMap}
                        aoMap={
                            mainWallTextures.aoMap
                        }
                    />
                </Box>
            </group>

            <Wall ref={leftWallRef}
                position={LAYOUT.wall.positions.left}
                rotation={LAYOUT.wall.rotations.left}
                depth={
                    LAYOUT.wall.dimensions.depth
                }
                textures={mainWallTextures}
        />

            <group ref={frontRightWallRef}
                position={frontHallRightWallParams.position}
                rotation={
                    frontHallRightWallParams.rotation
                }>
                <Box args={
            [frontHallRightWallParams.width, frontHallRightWallParams.height, LAYOUT.wall.dimensions.thickness]
                }
                    receiveShadow>
                    <meshPhysicalMaterial {...MATERIALS.wall}
                        map={mainWallTextures.colorMap}
                        normalMap={mainWallTextures.normalMap}
                        roughnessMap={mainWallTextures.roughnessMap}
                        aoMap={
                            mainWallTextures.aoMap
                        }
                    />
                </Box>
            </group>

            <group ref={extendedEntranceWallRef}
                position={extendedWallParams.entrance.position}
                rotation={
                    extendedWallParams.entrance.rotation
                }>
                <Box args={
            [extendedWallParams.entrance.width, extendedWallParams.entrance.height, LAYOUT.wall.dimensions.thickness]
        }
                    receiveShadow>
                    <meshPhysicalMaterial {...MATERIALS.wall}
                        map={specialWallTextures.colorMap}
                        normalMap={specialWallTextures.normalMap}
                        roughnessMap={specialWallTextures.roughnessMap}
                        aoMap={
                            specialWallTextures.aoMap
                        }
                    />
                </Box>
            </group>

            <Wall ref={newRightWallRef}
                position={LAYOUT.wall.positions.newRight}
                rotation={LAYOUT.wall.rotations.newRight}
                depth={
                    LAYOUT.wall.dimensions.depth
                }
                textures={mainWallTextures}
        />

            <DividerWall ref={dividerWallRef}
                textures={specialWallTextures}
        />

            {artworks.sculpture?.modelUrl && (
                <Sculpture ref={sculptureRef}
                    position={
                        [0, 0, -21]
        }
                    modelUrl={artworks.sculpture.modelUrl}
                    title={artworks.sculpture.title}
                    description={artworks.sculpture.description}
                    anyArtworkZoomed={anyArtworkZoomed}
                    camera={camera}
                />
            )}

            {
                artworks.central && (
                    <Artwork ref={
                        el => artworkRefsInternal.current[0] = el
                    } {...artworks.central}
                        isCurrentlyZoomed={
                            zoomedArtworkIndex === 0
                        }
                        onZoomChange={
                    () => {
                        if (zoomedArtworkIndex !== null && zoomedArtworkIndex !== 0 && artworkRefsInternal.current[zoomedArtworkIndex]) {
                            artworkRefsInternal.current[zoomedArtworkIndex].toggleZoom();
                        }
                        onArtworkZoom(0);
                    }
                }
                        anyArtworkZoomed={anyArtworkZoomed}
                        camera={camera}
                        collidables={
                            collidableMeshesRef.current
                        }
                />
            )
        }

            {
            artworks.left && artworks.left.map((artwork, index) => {
                const artworkIndex = index + 1;
                const zPosition = frontHallLeftPositions[index];
                    return (
                        <Artwork key={
                            `left-${index}`
                        }
                            ref={
                                el => artworkRefsInternal.current[artworkIndex] = el
                            } {...artwork}
                            position={
                        [LAYOUT.wall.innerPositions.left, 6.2, zPosition]
                            }
                            size={leftWallArtworkSize}
                            rotation={
                        [0, Math.PI / 2, 0]
                    }
                            isCurrentlyZoomed={
                                zoomedArtworkIndex === artworkIndex
                            }
                            onZoomChange={
                        () => {
                            if (zoomedArtworkIndex !== null && zoomedArtworkIndex !== artworkIndex && artworkRefsInternal.current[zoomedArtworkIndex]) {
                                artworkRefsInternal.current[zoomedArtworkIndex].toggleZoom();
                            }
                            onArtworkZoom(artworkIndex);
                        }
                    }
                            anyArtworkZoomed={anyArtworkZoomed}
                            camera={camera}
                            collidables={
                                collidableMeshesRef.current
                            }
                    />
                );
            })
        }

            {
            artworks.right && artworks.right.map((artwork, index) => {
                const artworkIndex = index + 1 + (artworks.left ? artworks.left.length : 0);
                const zPosition = frontHallRightPositions[index];
                if (zPosition >= LAYOUT.rooms.frontHall.zMin && zPosition <= LAYOUT.rooms.frontHall.zMax) {
                        return (
                            <Artwork key={
                                `right-${index}`
                            }
                                ref={
                                    el => artworkRefsInternal.current[artworkIndex] = el
                                } {...artwork}
                                position={
                            [9.8, 6.2, zPosition]
                                }
                                size={rightWallArtworkSize}
                                rotation={
                            [0, -Math.PI / 2, 0]
                        }
                                isCurrentlyZoomed={
                                    zoomedArtworkIndex === artworkIndex
                                }
                                onZoomChange={
                            () => {
                                if (zoomedArtworkIndex !== null && zoomedArtworkIndex !== artworkIndex && artworkRefsInternal.current[zoomedArtworkIndex]) {
                                    artworkRefsInternal.current[zoomedArtworkIndex].toggleZoom();
                                }
                                onArtworkZoom(artworkIndex);
                            }
                        }
                                anyArtworkZoomed={anyArtworkZoomed}
                                camera={camera}
                                collidables={
                                    collidableMeshesRef.current
                                }
                        />
                    );
                }
                return null;
            })
        }

            <ScreeningRoom ref={screeningRoomRef}
                position={
            [0, 0, 0]
                }
                galleryDimensions={galleryLayoutDimensions}
                videoConfig={
                    artworks.film || {}
                }
                camera={camera}
                collidables={collidableMeshesRef.current}
        />

            <Lighting />
        </>
    )
}

Gallery.propTypes = {
    setArtworkRefs: PropTypes.func,
    zoomedArtworkIndex: PropTypes.number,
    onArtworkZoom: PropTypes.func,
    anyArtworkZoomed: PropTypes.bool,
    currentArtworksConfig: PropTypes.object.isRequired,
};