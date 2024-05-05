import {
  engine,
  Transform,
  Schemas,
  Entity,
  GltfContainer,
  MeshRenderer,
  MeshCollider,PlayerIdentityData,
  CameraModeArea,
  CameraType,
  AvatarModifierArea,
  AvatarModifierType,
  TransformComponent,
  TransformType,
} from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import players, { getPlayer } from '@dcl/sdk/src/players'
import * as npc from 'dcl-npc-toolkit'
import { Dialog } from 'dcl-npc-toolkit'
import { playerManager } from './index'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { showControls} from './ui';
import { Cube } from './components'


export class Player {
  public playerId: string;
  golf: Entity;
  ball: Entity;
  moveSystem: MoveSystem;
  velocity: Velocity;
  playing: boolean = false;
  
 
  constructor(playerId: string) {
    this.playerId = playerId;
    this.golf = createGolf(playerId);
    this.ball = createBall(playerId,this.golf);
    this.moveSystem = new MoveSystem();
    this.velocity = new Velocity(0,0)
    this.playing = false;
  } 
}

export class PlayerManager {
  players: Map<string, Player>;

  constructor() {
    this.players = new Map();
  }

  addPlayer(playerId: string) {
    const player = new Player(playerId);
    this.players.set(playerId, player);
    console.log('player added')
  }

  removePlayer(playerId: string) {
    const player = this.players.get(playerId);
    if (player) {
      engine.removeEntity(player.golf);
      this.players.delete(playerId);
      console.log('player removed')
    }
  }

  isPlaying(playerId: string): boolean {
    const player = this.players.get(playerId);
    if (player) {
      // Assuming the Player class has an 'isPlaying' property
      return player.playing;
    }
    return false;
  }
}
export function createGolf(playerId: string) {
  const golf = engine.addEntity()
  MeshRenderer.setBox(golf)
  MeshCollider.setBox(golf)

  
  //GltfContainer.create(golf, { src: 'models/shake.glb' });
  let position = Vector3.create(2, 0, 2)
  Transform.create(golf, {position: position})
  
  return golf
}

export function createBall(playerId: string, golf: Entity) {
  const ball = engine.addEntity()
  let scale = Vector3.create(1, 1, 1)
  GltfContainer.create(ball, { src: 'models/ball.glb' });
  
  let golfPosition = Transform.getMutable(golf).position;
  let golfRotation = Transform.getMutable(golf).rotation;
  let ballposition = Vector3.create(7.7, 0.2, 8)
  //rotate ball 270 degrees
  let ballrotation = Quaternion.fromEulerDegrees(0, 180, 0)
  // Calculate the new position of the ball
  let positionOffset = Vector3.rotate(Vector3.Left(), golfRotation);
  let position = Vector3.add(golfPosition, positionOffset);
  
  // Set the rotation of the ball to be the same as the golf entity
  let rotation = golfRotation; 
  
  Transform.create(ball, {position: ballposition,scale:scale, rotation: Quaternion.fromEulerDegrees(0, 0, 0)})
  MeshCollider.create(ball)  
  
  return ball  
}
 
export class Velocity {  
  speed: number;
  deceleration: number;

  constructor(initialSpeed: number, deceleration: number) {
    this.speed = initialSpeed;
    this.deceleration = deceleration;
  }

  update() {
    this.speed -= this.deceleration;
    if (this.speed < 0) {
      this.speed = 0;
    }
  }
}



export class MoveSystem {
  private direction: string = '';
  private path1 = [Vector3.create(5, 1, 5), Vector3.create(5, 1, 11), Vector3.create(11, 1, 11), Vector3.create(11, 1, 5)];
  private path2 = [Vector3.create(5, 1, 5), Vector3.create(5, 1, 15), Vector3.create(15, 1, 15), Vector3.create(15, 1, 5)];
  ballRotationY: number = 0;

  public setDirection(direction: string) {
    this.direction = direction;
  }

  public update(dt: number, golf: Entity, ball: Entity) {
    const ballTransform = Transform.getMutable(ball);
    const ballPosition = ballTransform.position;
    const ballRotation = Quaternion.toEulerAngles(ballTransform.rotation);
    const rotation: Quaternion.Mutable = Quaternion.Identity()
    // Define a constant for the rotation speed
    const rotationSpeed = 45; // degrees per second
    // Calculate the forward direction of the ball
    const forwardDirection = Vector3.create(Math.sin((this.ballRotationY)), 0, (Math.cos(this.ballRotationY)));
    const speed = 0.08; // Set your speed value
  
    switch (this.direction) {
      case 'forward':
        // Move the ball forward along with the golf
        const ballTransform = Transform.getMutable(ball);
        //golfPosition.x += forwardDirection.x * speed;
        //golfPosition.z += forwardDirection.z * speed;
        ballTransform.position.x += forwardDirection.x * speed;
        ballTransform.position.z += forwardDirection.z * speed; 

        // Define the bounds of the ramp
        const rampBounds = {
          minX: 8 - 2.054,
          maxX: 8 + 2.054,
          minZ: 8 + 0.835,
          maxZ: 8 + 10.085
        };
        // Check if the ball is within the bounds of the ramp
        if (
          ballTransform.position.x >= rampBounds.minX &&
          ballTransform.position.x <= rampBounds.maxX && 
          ballTransform.position.z >= rampBounds.minZ &&
          ballTransform.position.z <= rampBounds.maxZ
        )   {
          console.log('ball is on the ramp');  
          const ballRadius = 0.2; // Replace with the actual radius of the ball
          // Calculate the vertical and horizontal distances from the ball to the top of the ramp
          const verticalDistance = RT.y + ballRadius - ballTransform.position.y;
          const horizontalDistance = RT.z - ballTransform.position.z;

          // Calculate the new length of the ramp based on the ball's position
          const newdeltaY = LT.y - ballTransform.position.y; 
          const newRampLength = Math.sqrt(verticalDistance**2 + horizontalDistance**2);
        // Calculate the new slope based on the new length of the ramp
        const newSlope = verticalDistance / newRampLength;
        // Calculate the slope of the ramp 
        const slope = newSlope  
        const maxRotationDifference = 90*(Math.PI / 180); // Replace with the actual maximum rotation difference
        const centerRotationY = 0; // Replace with the actual center y rotation
        // Print out the ball's y rotation and the center y rotation
        let ballRotDeg = this.ballRotationY * (180 / Math.PI);
        console.log('ball y rotation degrees', ballRotDeg);
        console.log('center y rotation', centerRotationY);  
        // Calculate the difference in rotation
        const rotationDifference = Math.abs(this.ballRotationY - centerRotationY);
        // Normalize the rotation difference to the range of 0 to 1
        const normalizedRotationDifference = rotationDifference / maxRotationDifference;
        const cosineInterpolationFactor = (1 - Math.cos(normalizedRotationDifference * Math.PI)) / 2; 

        // Calculate the rotation offset
        const rotationOffset = -cosineInterpolationFactor * slope; 
        // Update the y-coordinate of the ball's position based on the slope of the ramp and the rotation offset
        ballTransform.position.y += (newSlope) * speed;
        console.log('ball y position', ballTransform.position.y)  
        console.log('slope y offset', rotationOffset)   
        }   
      break;  
      case 'left':
        // Rotate the golf to the left  
        //golfRotation.y -= 1; 
        //golfTransform.rotation = Quaternion.fromEulerDegrees(golfRotation.x, golfRotation.y, golfRotation.z);
        this.ballRotationY -= rotationSpeed * dt * (Math.PI / 180); // dt should be the time elapsed since the last frame
        console.log('ball rotation y', this.ballRotationY)
      break;
      case 'right': 
        // Rotate the golf to the right
        //golfRotation.y += 1.0;  
        //golfTransform.rotation = Quaternion.fromEulerDegrees(golfRotation.x, golfRotation.y, golfRotation.z);
        this.ballRotationY += rotationSpeed * dt * (Math.PI / 180); // dt should be the time elapsed since the last frame
        console.log('ball rotation y', this.ballRotationY)
      break;
      case 'hit': 
          
          
      break;
      case 'stop':
        // Stop the movement 

      break;
      case 'path':
       

        
      break;
      default:
      break;
    }
   
  }

  
  
  
}
export const moveSystem = new MoveSystem(); 











export let golfJudgeNPC = npc.create(
    {
        position: Vector3.create(2, 0, 9),
        rotation: Quaternion.Zero(),
        scale: Vector3.create(1, 1, 1),
    },
    //NPC Data Object 
    {
        type: npc.NPCType.CUSTOM,
        model: 'models/golfNPC.glb',
        onActivate: () => {
            console.log('npc activated') 
      
      let currentplayer = players.getPlayer()
      let currentplayerId = currentplayer?.userId
      let currentplayerName = currentplayer?.name
       
      if (currentplayerId && currentplayerName && !playerManager.players.has(currentplayerId!)){
      npc.talk(golfJudgeNPC, GolfGameMission(currentplayerId,currentplayerName), 0)
      }else{
        loginDialog
      } 
        },
        onWalkAway: () => {
            console.log('test on walk away function')
        }, 
        faceUser: true,
        reactDistance: 5,
        //idleAnim: 'idle1',
        //walkingAnim: 'walk1',
        hoverText: 'Activate',
        continueOnWalkAway: true,
        onlyClickTrigger: false,
        onlyExternalTrigger: false,
    }
)

export let GolfGameMission = (currentplayerId: string,currentplayerName: string): Dialog[] => [
  {
        text: `Hello ` + currentplayerName + `!`,
        windowHeight: 'auto',   
  },

  {
      text: `Do you want to join the golf game?`,
      windowHeight: 'auto',
      
      isQuestion: true,
      buttons: [
          { label: `Yes!`,
          goToDialog: 2 ,
          triggeredActions: () => {
            logNewPlayers()
            
            } },

          { label: `I'm just watching`, goToDialog: 4 },

      ],
  },
  {
      text: `Ok, awesome, I will spawn a golf for you!`,
  },
  
  {
    text: ` Have fun!`,
    windowHeight: 'auto',
    isQuestion: true,
    buttons: [
        { label: `Ok, thank you!`, goToDialog: 6 ,
        triggeredActions: () => {
          showControls();
        }},
    ],
    
    isEndOfDialog: true,



  },

  {
      text: `Ok, enjoy the show!`,
      isEndOfDialog: true,
  },
]

export let loginDialog = (): Dialog[] =>  [
  {
      text: `Hello!`,
  },
  {
      text: `Please log in to play the golf game.`,
      isEndOfDialog: true,
  },
]

export function logNewPlayers() {
  for (const [entity, data] of engine.getEntitiesWith(PlayerIdentityData)) {
    let player = getPlayer({ userId: data.address })
    if (player && !playerManager.players.has(player.userId)) {
    console.log('UserId : ', player.userId)
    playerManager.addPlayer(player.userId);
    
    startGolfGame()
    console.log(playerManager.players.size)
    }
  }
}


 
// When the player starts the golf game...
function startGolfGame() {
  
  




}

// When the player stops the golf game...
function stopGolfGame() {
  
  
}




// Define the coordinates of the four corners of the ramp
const LB = { x: 8 - 2.054, y: 0.02, z: 8 + 0.835 };
const RB = { x: 8 + 2.054, y: 0.02, z: 8 + 0.835 };
const LT = { x: 8 - 2.054, y: 2.0, z: 8 + 10.085 };
const RT = { x: 8 + 2.054, y: 2.0, z: 8 + 10.085 };
const deltaY = LT.y - LB.y; // difference in heights
const deltaZ = LT.z - LB.z; // difference in lengths
const rampLength = Math.sqrt(deltaY ** 2 + deltaZ ** 2);
const rampSlope = deltaY / deltaZ;
console.log('ramp slope', rampSlope) 