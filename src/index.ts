import { AvatarModifierArea, AvatarModifierType, ColliderLayer, engine, GltfContainer, MeshCollider, PlayerIdentityData, PointerEvents, pointerEventsSystem, Transform, TextShape, PBMeshCollider, AudioSource } from '@dcl/sdk/ecs'
import * as npc from 'dcl-npc-toolkit'
import * as utils from '@dcl-sdk/utils'
import {  PlayerManager,LOSE_LAYER,BALL_LAYER } from './systems'
import { Cube } from './components'
import { setupUi } from './ui'
import { getPlayer } from '@dcl/sdk/src/players'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { Player } from './systems'
export const playerManager = new PlayerManager(Vector3.create(8, 0, 15), 0);

const concrete = engine.addEntity()
GltfContainer.create(concrete, { src: 'models/concrete.glb' })
Transform.create(concrete, {   
  position: Vector3.create(32, 0, 32), 
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)

})


//spawn skeeball1 glb model
const skeeball1 = engine.addEntity()
GltfContainer.create(skeeball1, { src: 'models/skeeball1.glb' })

Transform.create(skeeball1, {  
  position: Vector3.create(8, 0, 15),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
})
/* const skeeball1Text = engine.addEntity()
Transform.create(skeeball1Text, {  
  position: Vector3.create(8, 13.2, 30),
  rotation: Quaternion.fromEulerDegrees(0, 0, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
})
TextShape.create(skeeball1Text, {
  text: "ELECTRO-PUTT",
  textColor: { r: 1, g: 1, b: 0, a: 1 },
  outlineColor: { r: 0, g: 0, b: 0 },
  outlineWidth: 0,
  fontSize: 11,
}) */

//add layer
const skeeball1Display = engine.addEntity()
GltfContainer.create(skeeball1Display, { src: 'models/skeeball1display.glb' })
Transform.create(skeeball1Display, { 
  position: Vector3.create(8, 0, 15),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)

})


const skeeball1Ramp = engine.addEntity()  
GltfContainer.create(skeeball1Ramp, { src: 'models/skeeball1ramp.glb' })

Transform.create(skeeball1Ramp, { 
  position: Vector3.create(8, 0, 15),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)

})

const skeeball1PowerDisplay = engine.addEntity()
GltfContainer.create(skeeball1PowerDisplay, { src: 'models/skeeball1powerdisplay.glb' })
Transform.create(skeeball1PowerDisplay, { 
  position: Vector3.create(8, 0, 15),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
})










//spawn skeeball1 glb model
const skeeball2 = engine.addEntity()
GltfContainer.create(skeeball2, { src: 'models/skeeball1.glb' })

Transform.create(skeeball2, { 
  position: Vector3.create(56, 0, 15),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)

})
//add layer
const skeeball2Display = engine.addEntity()
GltfContainer.create(skeeball2Display, { src: 'models/skeeball1display.glb' })
Transform.create(skeeball2Display, { 
  position: Vector3.create(56, 0, 15),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)

})


const skeeball2Ramp = engine.addEntity()  
GltfContainer.create(skeeball2Ramp, { src: 'models/skeeball1ramp.glb' })

Transform.create(skeeball2Ramp, { 
  position: Vector3.create(56, 0, 15),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)

})

const skeeball2PowerDisplay = engine.addEntity()
GltfContainer.create(skeeball2PowerDisplay, { src: 'models/skeeball1powerdisplay.glb' })
Transform.create(skeeball2PowerDisplay, { 
  position: Vector3.create(56, 0, 15),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
})





//spawn skeeball1 glb model
const skeeball3 = engine.addEntity()
GltfContainer.create(skeeball3, { src: 'models/skeeball1.glb' })

Transform.create(skeeball3, { 
  position: Vector3.create(22, 0, 45),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)

})
//add layer
const skeeball3Display = engine.addEntity()
GltfContainer.create(skeeball3Display, { src: 'models/skeeball1display.glb' })
Transform.create(skeeball3Display, { 
  position: Vector3.create(22, 0, 45),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)

})


const skeeball3Ramp = engine.addEntity()  
GltfContainer.create(skeeball3Ramp, { src: 'models/skeeball1ramp.glb' })

Transform.create(skeeball3Ramp, { 
  position: Vector3.create(22, 0, 45),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)

}) 

const skeeball3PowerDisplay = engine.addEntity() 
GltfContainer.create(skeeball3PowerDisplay, { src: 'models/skeeball1powerdisplay.glb' })
Transform.create(skeeball3PowerDisplay, { 
  position: Vector3.create(22, 0, 45),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
})





//spawn skeeball1 glb model
const skeeball4 = engine.addEntity()
GltfContainer.create(skeeball4, { src: 'models/skeeball1.glb' })

Transform.create(skeeball4, { 
  position: Vector3.create(42, 0, 45),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)

})
//add layer
const skeeball4Display = engine.addEntity()
GltfContainer.create(skeeball4Display, { src: 'models/skeeball1display.glb' })
Transform.create(skeeball4Display, { 
  position: Vector3.create(42, 0, 45),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)

})


const skeeball4Ramp = engine.addEntity()  
GltfContainer.create(skeeball4Ramp, { src: 'models/skeeball1ramp.glb' })

Transform.create(skeeball4Ramp, { 
  position: Vector3.create(42, 0, 45),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1) 

}) 

const skeeball4PowerDisplay = engine.addEntity() 
GltfContainer.create(skeeball4PowerDisplay, { src: 'models/skeeball1powerdisplay.glb' })
Transform.create(skeeball4PowerDisplay, { 
  position: Vector3.create(42, 0, 45),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
})


//=========================================================================================================

const platform = engine.addEntity()
GltfContainer.create(platform, { src: 'models/platform.glb' })
Transform.create(platform, {    
  position: Vector3.create(32, 0, 16),  
  rotation: Quaternion.fromEulerDegrees(0, 90, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1) 
}) 

const platformbenches = engine.addEntity()
GltfContainer.create(platformbenches, { src: 'models/platformbenches.glb' })
Transform.create(platformbenches, {    
  position: Vector3.create(32, 0 , 16),  
  rotation: Quaternion.fromEulerDegrees(0, 90, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1) 
}) 

const platformwalls = engine.addEntity()
GltfContainer.create(platformwalls, { src: 'models/platformwalls.glb' })
Transform.create(platformwalls, {    
  position: Vector3.create(32, 0 , 16),  
  rotation: Quaternion.fromEulerDegrees(0, 90, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1) 
}) 


 const foodstand = engine.addEntity()
GltfContainer.create(foodstand, { src: 'models/foodstand.glb' })
Transform.create(foodstand, {    
  position: Vector3.create(58, 0, 44),  
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
}) 
const stool = engine.addEntity()
GltfContainer.create(stool, { src: 'models/stool.glb' }) 
Transform.create(stool, {    
  position: Vector3.create(59.8, 0.2, 45.5),   
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
})

const fence1 = engine.addEntity()
GltfContainer.create(fence1, { src: 'models/fence1.glb' })
Transform.create(fence1, {    
  position: Vector3.create(60.05, 0, 51.3),  
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
}) 

const fence2 = engine.addEntity()
GltfContainer.create(fence2, { src: 'models/fence2.glb' })
Transform.create(fence2, {    
  position: Vector3.create(5, 0, 52.4),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
}) 
 

const drinkcart = engine.addEntity()
GltfContainer.create(drinkcart, { src: 'models/drinkcart.glb' })
Transform.create(drinkcart, {    
  position: Vector3.create(25, 1.2, 13),  
  rotation: Quaternion.fromEulerDegrees(0, 195, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
}) 

const benches = engine.addEntity()
GltfContainer.create(benches, { src: 'models/benches.glb' })
Transform.create(benches, {    
  position: Vector3.create(62.9, 0, 3),  
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
}) 

const bathroom = engine.addEntity()
GltfContainer.create(bathroom, { src: 'models/bathroom.glb' })
Transform.create(bathroom, {    
  position: Vector3.create(8, 0, 60),  
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
}) 
// Create AudioSource component
AudioSource.create(bathroom, {
	audioClipUrl: 'sounds/rave.mp3',
	loop: true,
	playing: true,
  volume: 0.1
})

const fortunebase = engine.addEntity()
GltfContainer.create(fortunebase, { src: 'models/fortunetellerbase.glb' })
Transform.create(fortunebase, {    
  position: Vector3.create(60, 0, 59),  
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
}) 

const fortunebase2 = engine.addEntity()
GltfContainer.create(fortunebase2, { src: 'models/fortunetellerbase.glb' })
Transform.create(fortunebase2, {    
  position: Vector3.create(52, 0, 59),  
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
})


//=========================================================================================================


export function main() {
  // draw UI
  setupUi()
 





}