import { AvatarModifierArea, AvatarModifierType, engine, GltfContainer, MeshCollider, PlayerIdentityData, PointerEvents, pointerEventsSystem, Transform } from '@dcl/sdk/ecs'
import * as npc from 'dcl-npc-toolkit'
import * as utils from '@dcl-sdk/utils'
import { createGolf, moveSystem, PlayerManager } from './systems'
import { Cube } from './components'
import { setupUi } from './ui'
import { getPlayer } from '@dcl/sdk/src/players'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

export const playerManager = new PlayerManager()

export function HideAvatar() {
  const entityy = engine.addEntity()
  
    AvatarModifierArea.create(entityy, {
      area: Vector3.create(64, 30, 64),
      modifiers: [AvatarModifierType.AMT_HIDE_AVATARS],
      excludeIds: [], // Add this line to fix the error
    })
    
    Transform.create(entityy, {
      position: Vector3.create(32, 0, 32),
    })
  
  }





export function main() {
  // draw UI
  setupUi()
  
/*   //create a ramp
  const ramp = engine.addEntity()
  //add glb file
  GltfContainer.create(ramp, { src: 'models/ramp.glb' })
  //add transform component
  let Pos = Vector3.create(5, 0, 10)
  Transform.create(ramp, { position: Pos }) // Fix: Pass position as an object */



 //spawn skeeball1 glb model
const skeeball1 = engine.addEntity()
GltfContainer.create(skeeball1, { src: 'models/skeeball1.glb' })
Transform.create(skeeball1, { 
  position: Vector3.create(8, 0, 8),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0) // Rotate 90 degrees counter clockwise around the y-axis
})
//add collider
MeshCollider.create(skeeball1)

 


  engine.addSystem((dt) => {
    for (const player of playerManager.players.values()) {
      player.velocity.update(); 
      player.moveSystem.update(dt, player.golf, player.ball )
    }
  })
}