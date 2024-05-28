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
  Material,
  pointerEventsSystem,
  InputAction,
  PBMeshCollider_SphereMesh,
  ColliderLayer,TextShape,
  PBMaterial,
  Animator,
  AudioSource,
  TextAlignMode
} from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import players, { getPlayer } from '@dcl/sdk/src/players'
import * as npc from 'dcl-npc-toolkit'
import { Dialog } from 'dcl-npc-toolkit'
import { playerManager} from './index'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
//import { showControls} from './ui';
import { Cube } from './components'
import { getPlayerData } from '~system/Players'

let playerScore = 0;
let playerBallCountDisplay = 10;
let swingButtonPushed = false; // Set this to true when the swing button is pushed
let rotationVariable = 0; // Replace with your rotation variable
let ballCount = 10;

export let skeeball1PowerBar = engine.addEntity()
GltfContainer.create(skeeball1PowerBar, { src: 'models/skeeball1powerbar.glb' })
Transform.create(skeeball1PowerBar, { 
  position: Vector3.create(8, 0, 15),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
})  


export let skeeball2PowerBar = engine.addEntity()
GltfContainer.create(skeeball2PowerBar, { src: 'models/skeeball1powerbar.glb' })
Transform.create(skeeball2PowerBar, { 
  position: Vector3.create(56, 0, 15),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
})  


export let skeeball3PowerBar = engine.addEntity()
GltfContainer.create(skeeball3PowerBar, { src: 'models/skeeball1powerbar.glb' })
Transform.create(skeeball3PowerBar, { 
  position: Vector3.create(22, 0, 45),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
})  


export let skeeball4PowerBar = engine.addEntity()
GltfContainer.create(skeeball4PowerBar, { src: 'models/skeeball1powerbar.glb' })
Transform.create(skeeball4PowerBar, { 
  position: Vector3.create(42, 0, 45),
  rotation: Quaternion.fromEulerDegrees(0, 180, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
})  



export class Player {
  public playerId: string;
  
  balls: Entity[] = []; // Array to store the balls
  ball: Entity | null = null; // Variable to store the current ball
  position: Vector3.Mutable = Vector3.create(0, 0, 0);
  combo: number = 0;
  highscore: number = 0;
  
  machineIndex: number = 0;
  machinePos: Vector3;
  velocity: Velocity;
  playing: boolean;
  score: number = 0;
  hasLanded: boolean = false;
  power: number = 0;
  rotation: number = 0;
  
 
  constructor(playerId: string, machinePos: Vector3, index: number) {
    this.playerId = playerId;
    
    this.machinePos = machinePos;
    this.velocity = new Velocity(0,0)
    this.playing = false;
    this.machineIndex = index;
  } 


}

export class PlayerManager {
  players: Map<string, Player>;
  machinePos: Vector3;
  machineIndex: number;

  constructor(machinePos: Vector3 = Vector3.create(8, 0, 15), index: number) {
    this.players = new Map();
    this.machinePos = machinePos;
    this.machineIndex = index;
  }

  addPlayer(playerId: string, machinePos: Vector3, index: number) {
    const player = new Player(playerId, machinePos, index);
    this.players.set(playerId, player);
    
    console.log('player added')
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






export function createBall( machineStartingPosition: Vector3, player: Player) {
  const ball = engine.addEntity()
  
  let scale = Vector3.create(1, 1, 1)
  GltfContainer.create(ball, { src: 'models/ball.glb' });
  let ballposition = machineStartingPosition
  Transform.create(ball, {position: {x: ballposition.x, y: ballposition.y+0.2, z: ballposition.z}, scale: scale, rotation: Quaternion.fromEulerDegrees(0, 0, 0)})
  MeshCollider.setSphere(ball,[BALL_LAYER,ColliderLayer.CL_POINTER,ColliderLayer.CL_PHYSICS])
 
  

  player.ball = ball;

  pointerEventsSystem.onPointerDown(
    {
    entity: ball,
    opts: {
        button: InputAction.IA_POINTER, 
        hoverText: 'SWING'
      }
    },
    function () { 
      console.log("clicked ball")
      
      swingButtonPushed = true;
      
    }
      )

   //if collides with score area
  utils.triggers.addTrigger(
    ball,
    BALL_LAYER,
    SCORE_LAYER | LOSE_LAYER,
    [{ type: 'sphere', radius: 0.2}],
    function (otherEntity) {
      //set
      console.log('ball collided with score area')
      player.hasLanded = true;
      
      engine.removeEntity(ball) 
    }
  ) 
  

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



class MoveAction implements utils.actions.IAction {
  hasFinished: boolean = false;
  direction: string = '';
  ballRotationY: number = 0;
  player: Player;
  power: number = 0;
  rotation: number = 0;
  rampBounds: any;
  ball: Entity | null = null;
  skeeGolfMachines: SkeeGolfMachine[];
  heightdelta: number = 1;
  centerRotationY: number = 0;
  golferEntity: Entity | null = null;

  constructor(direction: string, player: Player,skeeGolfMachines: SkeeGolfMachine[], golferEntity: Entity) {
    this.direction = direction;
    this.player = player;
    this.power = player.power;
    this.rotation = player.rotation;
    this.ball = player.ball;
    this.skeeGolfMachines = skeeGolfMachines;
    this.rampBounds = skeeGolfMachines[player.machineIndex];
    this.centerRotationY = this.player.rotation  
    this.golferEntity = golferEntity
  }

  onStart(): void {
    
    console.log('move action started');
    if (this.ball) {
      console.log('yep, theres a ball') 
      const machine = skeeGolfMachines[this.player.machineIndex];
      console.log('machine', machine)
      this.heightdelta = utils.remap(this.power, 0, 100, 0.3, 0.9)
      
    }else{
      console.log('no ball')
    }
  }

  update(dt: number): void {
    
    const ballTransform = this.ball ? Transform.getMutable(this.ball) : null;
    const golferTransform = this.golferEntity ? Transform.getMutable(this.golferEntity) : null;
    const ballPosition = ballTransform?.position;
    const ballRotation = this.player.rotation
    const rotation: Quaternion.Mutable = Quaternion.Identity()
    const rotationSpeed = 45; // degrees per second
    const forwardDirection = Vector3.create(Math.sin((ballRotation)), 0, (Math.cos(ballRotation)));
    const speed = this.power*0.004; // Set your speed value
    
    
    
    switch (this.direction) { 
        case 'forward': 
        
        let LT = this.skeeGolfMachines[this.player.machineIndex].LT
        let RT = this.skeeGolfMachines[this.player.machineIndex].RT
        let LB = this.skeeGolfMachines[this.player.machineIndex].LB
        let RB = this.skeeGolfMachines[this.player.machineIndex].RB
        
        if (ballTransform) {

          if ( ballTransform.position.z <= LT.z ){
          ballTransform.position.x += forwardDirection.x * speed;
          ballTransform.position.z += forwardDirection.z * speed; 
            }


        if ( 
          ballTransform.position.x >= LB.x && 
          ballTransform.position.x <= RB.x && 
          ballTransform.position.z >= LB.z &&
          ballTransform.position.z <= LT.z 
          
          
          ) {
            this.power -=0.05
          //console.log('ball is on the ramp');   
          const ballRadius = 0.13; // Replace with the actual radius of the ball
          // Calculate the vertical and horizontal distances from the ball to the top of the ramp
          const verticalDistance = LT.y + ballRadius - ballTransform.position.y;
          const horizontalDistance = RT.z - ballTransform.position.z;

          // Calculate the new length of the ramp based on the ball's position
          const newdeltaY = this.rampBounds.maxY - ballTransform.position.y; 
          const newRampLength = Math.sqrt(verticalDistance**2 + horizontalDistance**2);
          // Calculate the new slope based on the new length of the ramp
          const newSlope = verticalDistance / newRampLength;
          // Calculate the slope of the ramp 
          const slope = newSlope  
          const maxRotationDifference = 90*(Math.PI / 180); // Replace with the actual maximum rotation difference

          let ballRotDeg = this.ballRotationY * (180 / Math.PI);
          // Calculate the difference in rotation
          const rotationDifference = Math.abs(this.ballRotationY - this.centerRotationY);
          // Normalize the rotation difference to the range of 0 to 1
          const normalizedRotationDifference = rotationDifference / maxRotationDifference;
          const cosineInterpolationFactor = (1 - Math.cos(normalizedRotationDifference * Math.PI)) / 2; 

          // Calculate the rotation offset
          const rotationOffset = -cosineInterpolationFactor * slope; 
          // Update the y-coordinate of the ball's position based on the slope of the ramp and the rotation offset
          ballTransform.position.y += (newSlope) * speed; 
        }   


        //ball now performs arc at end of ramp
        if ( ballTransform.position.z >= LT.z ){

              ballTransform.position.x += forwardDirection.x *  Math.min(Math.max(speed*0.6, 0.15), 0.23)
              ballTransform.position.z += forwardDirection.z * Math.min(Math.max(speed*0.6, 0.15), 0.23)
              this.heightdelta -= 0.035
           
          
      
          
            // calculate the new y position
            ballTransform.position.y += this.heightdelta
          
          }





        }
        
      
        break;
      case 'rotate':
        //rotate the ball based on the angle between the ball and the current player position
        if (ballTransform) {
          let playerPos = this.player.position;
          
          let angle = Math.atan2(playerPos!.x - ballTransform.position.x, playerPos!.z - ballTransform.position.z) - Math.PI;
          
          ballTransform.rotation = { x: 0, y: angle, z: 0, w: 0 };
          

          
          let rightDirection = Vector3.create(Math.sin(270-angle-70.2)*0.51, 0, -Math.cos(270-angle-70.2)*0.5);

          

          // Calculate the golfer's position
          let golferPos = Vector3.create(this.player.machinePos.x+rightDirection.x,this.player.machinePos.y+rightDirection.y,this.player.machinePos.z+rightDirection.z)
          
          if(this.golferEntity){
            
            let golferTransform = Transform.getMutable(this.golferEntity);
            golferTransform.position = golferPos;
            

            // Calculate the angle for the golfer to face the ball
            let golferAngle = Math.atan2(ballTransform.position.x - golferPos.x, ballTransform.position.z - golferPos.z) - Math.PI;
            golferTransform.rotation = { x: 0, y: golferAngle, z: 0, w: 0 };
          } else {
            console.log('Golfer entity does not exist');
          }
        
          
        } 
      



        break;
      case 'right': 
        
        break;
      case 'hit': 
       
        break;
      case 'stop':
        
        break;
      case 'path':
        
        break;
      default:
        break;
    }

    // Check if the action has finished
    if (this.hasFinished) {
      this.hasFinished = true;
    }
  }

  onFinish(): void {
    // Logic to finish the move action
  }
}





 
// When the player starts the golf game...
function startGolfGame(chooseMachineAction: ChooseMachineAction, index: number, playerId: string) {

  console.log("index"+index)
  
    let player = playerId
    if (player && !playerManager.players.has(player)) {
      console.log('UserId : ', player)
      
      let machinePos = chooseMachineAction.machines[index].startingPosition;
      playerManager.addPlayer(player, machinePos,index);
      console.log(playerManager.players.size)
      let currentPlayer = playerManager.players.get(player);
      if (currentPlayer) {
        playerManager.players.get(player)!.machineIndex = index;
        playerManager.players.get(player)!.machinePos = machinePos
        currentPlayer.machineIndex = index;
        
        currentPlayer.playing = true;
        console.log('player playing', currentPlayer.playing)
        if (!playerDisplays.has(currentPlayer.playerId+'0')) {
          createPlayerDisplay(player,chooseMachineAction,index)
          updatePlayerDisplay(player,"0 \n\n0" ,currentPlayer.highscore.toString(),currentPlayer.score.toString())
          console.log('display should update')
          }
      }
    } else {
      if(player){
      console.log('player already exists')
      //set player playing to true
      let machinePos = chooseMachineAction.machines[index].startingPosition;
      console.log(playerManager.players.size)
      let currentPlayer = playerManager.players.get(player);
      if (currentPlayer) {
        playerManager.players.get(player)!.machineIndex = index;
        playerManager.players.get(player)!.machinePos = machinePos
        currentPlayer.machineIndex = index;
        currentPlayer.playing = true;
        console.log('player playing', currentPlayer.playing)
        if (!playerDisplays.has(currentPlayer.playerId+'0')) {
          createPlayerDisplay(player,chooseMachineAction,index)
          updatePlayerDisplay(player,"0 \n\n0" ,currentPlayer.highscore.toString(),currentPlayer.score.toString())
        }else{
          updatePlayerDisplay(player,"0 \n\n0" ,currentPlayer.highscore.toString(),currentPlayer.score.toString())
        }
      }
    }
    }
  
  //create ball count starting at 10
  //ballCount = 10;
  console.log('ball count', ballCount) 
  let machineindex = chooseMachineAction.machines[index]; 
  console.log('machine index', machineindex)
  let machineStartingPosition = machineindex.startingPosition;

  console.log('machine starting position', machineStartingPosition)



  // Create the golfer entity and add the GLB model to it
  let golferEntity = engine.addEntity() 
  let scale = Vector3.create(0.5, 0.5, 0.5)
  GltfContainer.create(golferEntity, { src: 'models/golfer.glb' });
  let golferAnimator =   Animator.create(golferEntity, {
                            states: [
                              {
                                clip: 'idle',
                                playing: true,
                                loop: true,
                                weight: 0.5
                              },
                              {
                                clip: 'swing',
                                playing: false,
                                loop: false,
                                speed: 2,
                                weight: 1
                              },
                              {
                                clip: 'watch',
                                playing: false, 
                                loop: false,
                                speed: 0.5,
                                weight: 0.5 
                              },
                            ],  
                          })

                          let playingsound = engine.addEntity();
                          MeshRenderer.deleteFrom(playingsound)
                          MeshCollider.deleteFrom(playingsound)
                          AudioSource.create(playingsound, {
                            audioClipUrl: 'sounds/playing.mp3',
                            loop: true,
                            playing: true,
                            volume: 0.5,
                          })
                          
                        



  let golferPosition = machineStartingPosition
  if(golferPosition){
    Transform.create(playingsound, {position: {x: golferPosition.x-0.5, y: golferPosition.y+0, z: golferPosition.z}, scale: scale, rotation: Quaternion.fromEulerDegrees(0, 180, 0)})
    
    Transform.create(golferEntity, {position: {x: golferPosition.x-0.5, y: golferPosition.y+0, z: golferPosition.z}, scale: scale, rotation: Quaternion.fromEulerDegrees(0, 180, 0)})
    console.log('golfertransform was created')
  }
  //save
  const builder = new utils.actions.SequenceBuilder()
  for (let i = 0; i < ballCount; i++) {
    let turn = i
    let id = playerId;
    let totalballs = ballCount;
    swingButtonPushed = false;
    let player = playerManager.players.get(id);
    
    let newBall = new CreateBallAction(machineStartingPosition, playerManager.players.get(playerId)!,turn, totalballs);
    if (player) {
      //let swingAction = new SwingAction(powerCycleAction.power, rotationVariable,player);
      //console.log('swing action created', swingAction)
      
      builder
      .then(newBall)

      .while(() => !swingButtonPushed)
      .then( new PowerCycleAction(player, golferEntity))
      .endWhile()
      .then(new SwingAction(player, golferEntity))
      .then(new BallInMotionAction(player, golferEntity))
      
      .if(() => i === ballCount-1 )
      .then(new EndGameAction(player))
      .else()
      .endIf();
    }
    console.log('builder', builder)
}     

  const swing = new utils.actions.SequenceRunner(engine, builder, () => {
    swing.destroy();
    if (golferEntity) {
      engine.removeEntity(golferEntity);
      engine.removeEntity(playingsound)
    }
      engine.removeEntity(playingsound);
    
  });

}


// When the player stops the golf game...
function stopGolfGame() {
  // Logic to stop the golf game
}



//================================================================================================
//================================================================================================

 



interface SkeeGolfMachine {
  id: string;
  startingPosition: { x: number; y: number; z: number };
  LB: { x: number; y: number; z: number };
  RB: { x: number; y: number; z: number };
  LT: { x: number; y: number; z: number };
  RT: { x: number; y: number; z: number };
  deltaY: number;
  deltaZ: number;
  rampLength: number;
  rampSlope: number;
  powerbar: Entity;
}

// create an array to hold all your machines
let skeeGolfMachines: SkeeGolfMachine[] = [];

  
  skeeGolfMachines.push({
    id: 'machine1',
    startingPosition: { x: 8, y: 0.2, z: 15 },
    LB: { x: 8-2.7, y: 0.15+0.221, z: 15+2.137 },
    RB: { x: 8+2.7, y: 0.15+0.221, z: 15+2.137 },
    LT: { x: 8-2.7, y: 0.15+1.142, z: 15+6.209+0.15 },
    RT: { x: 8+2.7, y: 0.15+1.142, z: 15+6.209+0.15 },
    deltaY: 1.142 - 0.221,
    deltaZ: 6.438 - 2.134,
    rampLength: 0 , // calculate ramp length
    rampSlope: 0,
    powerbar: skeeball1PowerBar 
  });



skeeGolfMachines.push({
  id: 'machine2',
  startingPosition: { x: 56, y: 0.2, z: 15 },
  LB: { x: 56-2.7, y: 0.15+0.221, z: 15+2.137 },
  RB: { x: 56+2.7, y: 0.15+0.221, z: 15+2.137 },
  LT: { x: 56-2.7, y: 0.15+1.142, z: 15+6.209+0.15 },
  RT: { x: 56+2.7, y: 0.15+1.142, z: 15+6.209+0.15 },
  deltaY: 1.142 - 0.221,
  deltaZ: 6.438 - 2.134,
  rampLength: 0 , // calculate ramp length
  rampSlope: 0,
  powerbar: skeeball2PowerBar
});



skeeGolfMachines.push({
  id: 'machine3',
  startingPosition: { x: 22, y: 0.2, z: 45 },
  LB: { x: 22-2.7, y: 0.15+0.221, z: 45+2.137 },
  RB: { x: 22+2.7, y: 0.15+0.221, z: 45+2.137 },
  LT: { x: 22-2.7, y: 0.15+1.142, z: 45+6.209+0.15 },
  RT: { x: 22+2.7, y: 0.15+1.142, z: 45+6.209+0.15 }, 
  deltaY: 1.142 - 0.221,
  deltaZ: 6.438 - 2.134,
  rampLength: 0 , // calculate ramp length
  rampSlope: 0,
  powerbar: skeeball3PowerBar
});



skeeGolfMachines.push({
  id: 'machine4',
  startingPosition: { x: 42, y: 0.2, z: 45 },
  LB: { x: 42-2.7, y: 0.15+0.221, z: 45+2.137 },
  RB: { x: 42+2.7, y: 0.15+0.221, z: 45+2.137 },
  LT: { x: 42-2.7, y: 0.15+1.142, z: 45+6.209+0.15 },
  RT: { x: 42+2.7, y: 0.15+1.142, z: 45+6.209+0.15 }, 
  deltaY: 1.142 - 0.221,
  deltaZ: 6.438 - 2.134,
  rampLength: 0 , // calculate ramp length
  rampSlope: 0,
  powerbar: skeeball4PowerBar
});






// calculate rampLength and rampSlope for each machine
skeeGolfMachines = skeeGolfMachines.map(machine => {
  const deltaY = machine.LT.y - machine.LB.y;
  const deltaZ = machine.LT.z - machine.LB.z;
  const rampLength = Math.sqrt(deltaY ** 2 + deltaZ ** 2);
  const rampSlope = deltaY / deltaZ;
  const position = machine.startingPosition;
  
  return {
    ...machine,
    deltaY,
    deltaZ,
    rampLength,
    rampSlope,
  };
});


class ChooseMachineAction implements utils.actions.IAction {
  hasFinished: boolean = false;
  machines: SkeeGolfMachine[];

  constructor(machines: SkeeGolfMachine[]) {
    this.machines = machines;
  }

  onStart(): void {
    // Logic to choose a machine
    this.hasFinished = true;
  }

  update(dt: number): void {}

  onFinish(): void {}
}

class PowerCycleAction implements utils.actions.IAction {
  hasFinished: boolean = false;
  power: number = 0;
  increasing: boolean = true;
  player: Player;
  moveAction: MoveAction | undefined; 
  golferEntity: Entity

  constructor(player: Player, golferEntity: Entity) {
    this.player = player;
    this.golferEntity = golferEntity
  }

  onStart(): void {
    this.hasFinished = false;
   
    this.moveAction = new MoveAction('rotate', this.player, skeeGolfMachines, this.golferEntity);
    
  }

  update(dt: number): void {
    
  const currentPlayerPos = getPlayer()?.position;
    if (currentPlayerPos) {
      this.player.position = currentPlayerPos;
      
      this.moveAction?.update(dt);
    }
   
    // Logic to cycle power from 0 to 100 and back
    if (this.increasing) {
      this.power += dt * 100;
      this.player.power = this.power;
      
      Transform.getMutable(skeeGolfMachines[this.player.machineIndex].powerbar).scale.y = this.power / 100; // Update power bar scale
      
      if (this.power >= 100) {
        this.power = 100;
        this.increasing = false;  
      }
    } else {
      this.power -= dt * 100;
      this.player.power = this.power;
      
      Transform.getMutable(skeeGolfMachines[this.player.machineIndex].powerbar).scale.y = this.power / 100; // Update power bar scale
      
      if (this.power <= 20) {
        this.power = 20;
        this.increasing = true;
      }
    }

    if(this.player.hasLanded){
      
      
      

      this.hasFinished = true;
    }
    

  }

  onFinish(): void {
    
    
    
    
    this.player.power = this.power;
    this.moveAction = undefined;
    this.player.rotation = this.player.ball ? Transform.getMutable(this.player.ball).rotation.y : 0;
  }
}


class BallInMotionAction implements utils.actions.IAction {
  hasFinished: boolean = false;
  player: Player;
  moveAction: MoveAction | undefined; 
  golferEntity: Entity

  constructor(player: Player, golferEntity: Entity) {
    this.player = player;
    this.golferEntity = golferEntity
  }

  onStart(): void {
    this.hasFinished = false;
    
    console.log('ball in motion has started');
    this.moveAction = new MoveAction('forward', this.player, skeeGolfMachines, this.golferEntity);
    this.moveAction.onStart();
    console.log('new ball in motion moveaction created')


    
    const watchAnim = Animator.getClip(this.golferEntity,'watch')
    watchAnim.playing = true
    
  }

  update(dt: number): void {
    
    
  
    if(this.player.hasLanded){
      this.hasFinished = true;
    }else{
      this.moveAction?.update(dt);
    }

  }

  onFinish(): void {
    this.moveAction = new MoveAction('stop', this.player, skeeGolfMachines, this.golferEntity);
    this.moveAction = undefined;
    
    
    console.log('ball in motion has finished')
    this.player.hasLanded = false;
    
    swingButtonPushed = false;
  }
}




class SwingAction implements utils.actions.IAction {
  hasFinished: boolean = false;
  player: Player;
  moveAction: MoveAction | undefined; 
  golferEntity: Entity

  constructor(player: Player, golferEntity: Entity) {
    this.player = player;
    this.golferEntity = golferEntity
  }

  onStart(): void {
    this.hasFinished = false;
    //Animator.playSingleAnimation(this.golferEntity, 'swing');
    const swingAnim = Animator.getClip(this.golferEntity, 'swing')
    //const idleAnim = Animator.getClip(this.golferEntity,'idle')
    swingAnim.playing = true
    

    
    
    
  }

  update(dt: number): void {
    let finish = () => {
      this.hasFinished = true;
    }

    utils.timers.setTimeout(() => {
      console.log('1 second passed')
      finish()
    }, 500)

   
  
    
  }

  onFinish(): void {
    
   
  }
}







const SCORE_LAYER = utils.LAYER_7
export const LOSE_LAYER = utils.LAYER_8
export const BALL_LAYER = utils.LAYER_6 
// Assuming `skeeGolfMachines` is an array of `SkeeGolfMachine`
skeeGolfMachines.forEach(machine => {
  // Create a box with disabled collision
  const positions = [
    { x: machine.startingPosition.x, y: 6.118, z: machine.startingPosition.z+14.267 },//score4
    { x: machine.startingPosition.x-4.033, y: 6.764, z: machine.startingPosition.z+13.241 },//score1
    { x: machine.startingPosition.x-2.633, y: 5.055, z: machine.startingPosition.z+11.229 },//score2
    { x: machine.startingPosition.x-1.335, y: 4.012, z: machine.startingPosition.z+13.586 },//score3
    { x: machine.startingPosition.x, y: 4.417, z: machine.startingPosition.z+13.057 },//score5
    { x: machine.startingPosition.x, y: 4.417, z: machine.startingPosition.z+11.157 },//score6
    { x: machine.startingPosition.x+1.339, y: 4.012, z: machine.startingPosition.z+13.575 },//score7
    { x: machine.startingPosition.x+2.606, y: 5.055, z: machine.startingPosition.z+11.196 },//score8
    { x: machine.startingPosition.x+4.027, y: 6.764, z: machine.startingPosition.z+13.198 },//score9
    
  ];

  const colliderpositions = [
    { 
      position: { x: machine.startingPosition.x-5.664, y: 7.773, z: machine.startingPosition.z+12.64 }, // Position
      scale: { x: 0.2, y: 15.337, z: 5.981 } // Scale
    },//collider1
    { 
      position: { x: machine.startingPosition.x+5.664, y: 7.773, z: machine.startingPosition.z+12.64 }, // Position
      scale: { x: 0.2, y: 15.337, z: 5.981 } // Scale
    },//collider2
    { 
      position: { x: machine.startingPosition.x, y: 9.166, z: machine.startingPosition.z+15.021 }, // Position
      scale: { x: 11.064, y: 11.982, z: 0.194} // Scale
    },//collider3
    { 
      position: { x: machine.startingPosition.x, y: 1.124, z: machine.startingPosition.z+12.945 }, // Position
      scale: { x: 10.966, y: 2.137, z: 6.454 } // Scale
    },//collider4
    { 
      position: { x: machine.startingPosition.x, y: 2.407, z: machine.startingPosition.z+11.749}, // Position
      scale: { x: 7.5, y: 0.429, z: 1.522 } // Scale
    },//collider5
    { 
      position: { x: machine.startingPosition.x, y: 2.7, z: machine.startingPosition.z+13.64}, // Position
      scale: { x: 7.5, y: 1.015, z: 2.307 } // Scale
    },//collider6
    { 
      position: { x: machine.startingPosition.x-4.625, y: 2.818, z: machine.startingPosition.z+11.579}, // Position
      scale: { x: 1.75, y: 1.25, z: 2.3 } // Scale
    },//collider7
    { 
      position: { x: machine.startingPosition.x+4.625, y: 2.818, z: machine.startingPosition.z+11.579}, // Position
      scale: { x: 1.75, y: 1.25, z: 2.3 } // Scale
    },//collider8
    { 
      position: { x: machine.startingPosition.x-4.612, y: 3.249, z: machine.startingPosition.z+13.883}, // Position
      scale: { x: 1.75, y: 2.113, z: 2.308 } // Scale 
    },//collider9
    { 
      position: { x: machine.startingPosition.x+4.612, y: 3.249, z: machine.startingPosition.z+13.883}, // Position
      scale: { x: 1.75, y: 2.113, z: 2.308 } // Scale
    },//collider10


    
  ];
  
  positions.forEach(position => {
    
    const score = engine.addEntity();
    const scoreAmount = Math.floor(position.y-2.7);
    Transform.create(score).position = position;
    Transform.getMutable(score).scale = { x: 0.5, y: 0.5, z: 0.5 };
    //MeshRenderer.setSphere(score);
    MeshCollider.setSphere(score,SCORE_LAYER);
    // Create AudioSource component
    AudioSource.create(score, {
      audioClipUrl: 'sounds/ballscore.wav',
      loop: false,
      playing: false,
      volume: 1,
    })

     utils.triggers.addTrigger(
      score,
      SCORE_LAYER,
      BALL_LAYER,
      [{ type: 'sphere', radius: 0.5 }],
      function (otherEntity) {
        // Mouse was eaten by cat, "respawn" it
        AudioSource.playSound(score,'sounds/ballscore.wav',true);
        const text = engine.addEntity()
        Transform.create(text).position = Vector3.create(position.x, position.y+1.5, position.z);
        // Define start and end positions
        let startPos = Vector3.create(position.x, position.y+1.5, position.z);
        let endPos = Vector3.create(position.x, position.y+2, position.z);

        // Move a box
        utils.tweens.startTranslation(text, startPos, endPos, 0.8)


        utils.timers.setTimeout(function () {
          engine.removeEntity(text);
        }, 800)
        //increment score
        console.log('scored')
        const player = getPlayer()?.userId.toString()
        if (player){
          playerManager.players.get(player)!.combo += 1;
          playerManager.players.get(player)!.score += scoreAmount*playerManager.players.get(player)!.combo;
          TextShape.create(text, {
            text: "+" + scoreAmount.toString()+ "\n" + "Combo x" + playerManager.players.get(player)!.combo.toString(),
            textColor: { r: 1, g: 0, b: 1, a: 1 },
            outlineColor: { r: 1, g: 1, b: 1 },
            outlineWidth: 0.1,
            fontSize: 10,
          })
  
          console.log('score',playerManager.players.get(player)!.score)
        }
        //ballCount += 1;
        
      }
    )

    const startbox = engine.addEntity()
  GltfContainer.create(startbox, { src: 'models/startbox.glb' })
  
  Transform.create(startbox, {  
    position: Vector3.create(machine.startingPosition.x, 0, machine.startingPosition.z-3),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0), // Rotate 90 degrees counter clockwise around the y-axis
    scale: Vector3.create(0.5, 0.5, 0.5)
  })


  //i need to have the machine chosen thing to change on the second go around and reset all game variables
  utils.triggers.addTrigger(  
    startbox,
    utils.NO_LAYERS,
    utils.LAYER_1, 
    [{ type: 'box',
      scale:    { x: 3, y: 1, z: 3 }
     }],
    function (otherEntity) {
      let player = getPlayer()?.userId;
      if (!player || playerManager.players.get(player)?.playing) {
        return;
      }
      let index = skeeGolfMachines.indexOf(machine);
      console.log('index', index)
      console.log(`triggered by ${otherEntity}!`);
      let playerID = getPlayer()?.userId // Replace with the actual player ID
      // Create a new ChooseMachineAction for the clicked machine
      let chooseMachineAction = new ChooseMachineAction(skeeGolfMachines);  
      console.log(chooseMachineAction.machines[index].startingPosition) 
      let skeeGolfMachine = skeeGolfMachines[index];
      if(playerID){ 
      startGolfGame(chooseMachineAction, index, playerID);
    }
}
  );




     
  });

  colliderpositions.forEach(position => { 
    const collider = engine.addEntity();
    Transform.create(collider).position = position.position;
    Transform.getMutable(collider).scale = position.scale;
    
    //MeshRenderer.setBox(collider);
    MeshCollider.setBox(collider,LOSE_LAYER);
    console.log('collider created',Transform.getMutable(collider).scale,Transform.getMutable(collider).rotation,Transform.getMutable(collider).position)
    AudioSource.create(collider, {
      audioClipUrl: 'sounds/balldead.wav',
      loop: false,
      playing: false,
      volume: 1,
    })


     utils.triggers.addTrigger( 
      collider,  
      LOSE_LAYER, 
      BALL_LAYER,
      [{ type: 'box', scale: position.scale }],
      function (otherEntity) {
        AudioSource.playSound(collider,'sounds/balldead.wav',true);
        
        //increment score
        console.log('ball lost')  
        const player = getPlayer()?.userId.toString();
        if (player){
          playerManager.players.get(player)!.combo = 0;
          console.log('combo lost',playerManager.players.get(player)!.combo)
        }
      }
    )  
     
  });

  
    
});





class CreateBallAction implements utils.actions.IAction {
  hasFinished: boolean = false;
  position: { x: number, y: number, z: number };
  player: Player;
  turn: number;
  totalballs: number;

  constructor(position: { x: number, y: number, z: number }, player: Player, turn: number, totalballs: number) {
    this.position = position;
    this.player = player;
    this.turn = turn
    this.totalballs = totalballs
  }

  onStart(): void {
    
    if (this.player) { // Check if player is defined
      
      updatePlayerDisplay(this.player.playerId,(this.player.score + "\n\n" +(this.totalballs-this.turn) ).toString(),this.player.highscore.toString(),this.player.score.toString())
      createBall(this.position, this.player); // Use machineStartingPosition in createBall function call
      console.log(this.position)
    }

    this.hasFinished = true;
  }

  update(dt: number): void {}

  onFinish(): void {}
}



class EndGameAction implements utils.actions.IAction {
  hasFinished: boolean = false;
  player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  onStart(): void {
    //prize criteria
    if(this.player.score > 4){
      givePrize()
    }

    if (this.player.score > 0) {
      this.displayWinningScreen();
      
      const highscore = playerManager.players.get(this.player.playerId)!.highscore;
      if (this.player.score > highscore) {
        ballCount += 1;
        playerManager.players.get(this.player.playerId)!.highscore = this.player.score;

        const quicktext = engine.addEntity()
        let transform = Transform.create(quicktext)
          transform.position = { x: this.player.machinePos.x, y: 5, z: this.player.machinePos.z+5 }
          transform.rotation = Quaternion.fromEulerDegrees(0, 0, 0)
          transform.scale = { x: 1, y: 1, z: 1}
        // Create a new UIText component for the text display
        TextShape.create(quicktext, {
          text: "+BALL",
          textColor: { r: 1, g: 0, b: 1, a: 1 },
          outlineColor: { r: 1, g: 1, b: 1 },
          outlineWidth: 0.1,
          fontSize: 6.5,
            
        })
        utils.timers.setTimeout(function () {
          engine.removeEntity(quicktext);
        }, 2000)
    
      }
      this.player.score = 0;
      playerManager.players.get(this.player.playerId)!.playing = false;
      
      console.log('game ended with points')
    } else {
      this.displayLosingScreen();
      playerManager.players.get(this.player.playerId)!.highscore = this.player.score;
      this.player.score = 0;
      playerManager.players.get(this.player.playerId)!.playing = false;
      
      console.log('game ended')
    }
    updatePlayerDisplay(this.player.playerId,(this.player.score + "\n\n" +"0" ).toString(),this.player.highscore.toString(),this.player.score.toString())
    this.hasFinished = true;
  }

  displayWinningScreen(): void {
    let winsound = engine.addEntity();
    MeshRenderer.deleteFrom(winsound)
    AudioSource.create(winsound, {
      audioClipUrl: 'sounds/winner.wav',
      loop: false,
      playing: true,
      volume: 0.7,
    })
    utils.timers.setTimeout(function () {
      engine.removeEntity(winsound);
    }, 2000)




  }

  displayLosingScreen(): void {
    let losesound = engine.addEntity();
    MeshRenderer.deleteFrom(losesound)
    AudioSource.create(losesound, {
      audioClipUrl: 'sounds/gameover.wav',
      loop: false,
      playing: true,
      volume: 0.7,
    })
    utils.timers.setTimeout(function () {
      engine.removeEntity(losesound);
    }, 2000)
  }

  update(dt: number): void {}

  onFinish(): void {

    
  }
}



// Create a map to store the display entities for each player
const playerDisplays = new Map<string, Entity>()

// Function to create a new display for a player
function createPlayerDisplay(playerId: string, chooseMachineAction: ChooseMachineAction, index: number) {
  // Create a new entity for the text display
  const machineDisplay = engine.addEntity()
  const machineDisplay1 = engine.addEntity()
  const machineDisplay2 = engine.addEntity()
  const machineDisplay3 = engine.addEntity()

  //position
  if(playerManager){


  let transform = Transform.create(machineDisplay)
  transform.position = { x: chooseMachineAction.machines[index].startingPosition.x -4.2, y: 1.2, z: chooseMachineAction.machines[index].startingPosition.z+0.3 }
  transform.rotation = Quaternion.fromEulerDegrees(0, -25, 0)
  transform.scale = { x: 0.5, y: 0.5, z: 0.5}
 // Create a new UIText component for the text display
 TextShape.create(machineDisplay, {
  text: "",
  textColor: { r: 1, g: 1, b: 1, a: 1 },
  outlineColor: { r: 0, g: 0, b:0 },
  outlineWidth: 0,
  fontSize: 6.5,
  
  
})

  let transform1 = Transform.create(machineDisplay1)
  transform1.position = { x: chooseMachineAction.machines[index].startingPosition.x -4.6, y: 2.5, z: chooseMachineAction.machines[index].startingPosition.z+0.1 }
  transform1.rotation = Quaternion.fromEulerDegrees(0, -25, 0)
  transform1.scale = { x: 0.3, y: 0.3, z: 0.3 }
   // Create a new UIText component for the text display
   TextShape.create(machineDisplay1, {
    text: "",
    textColor: { r: 1, g: 1, b: 1, a: 1 },
    outlineColor: { r: 0, g: 0, b: 0 },
    outlineWidth: 0,
    fontSize: 6,
  })

  let transform2 = Transform.create(machineDisplay2)
  transform2.position = { x: chooseMachineAction.machines[index].startingPosition.x +1, y: 10.8, z: chooseMachineAction.machines[index].startingPosition.z+14.8 }
  transform2.rotation = Quaternion.fromEulerDegrees(0, 0, 0)
  transform2.scale = { x: 1, y: 1, z: 1 }
   // Create a new UIText component for the text display
   TextShape.create(machineDisplay2, {
    text: "",
    textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
    textColor: { r: 1, g: 1, b: 1, a: 1 },
    outlineColor: { r: 0, g: 0, b: 0 },
    outlineWidth: 0,
    fontSize: 9,
  })

  let transform3 = Transform.create(machineDisplay3)
  transform3.position = { x: chooseMachineAction.machines[index].startingPosition.x +1, y: 8.8, z: chooseMachineAction.machines[index].startingPosition.z+14.8 }
  transform3.rotation = Quaternion.fromEulerDegrees(0, 0, 0)
  transform3.scale = { x: 1, y: 1, z: 1 }
   // Create a new UIText component for the text display
   TextShape.create(machineDisplay3, {
    text: "",
    textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
    textColor: { r: 1, g: 1, b: 1, a: 1 },
    outlineColor: { r: 0, g: 0, b: 0 },
    outlineWidth: 0,
    fontSize: 9,
  })


  const ballcountText = TextShape.getMutable(machineDisplay)
  ballcountText.text = 'new string 0'

  const ballcountText1 = TextShape.getMutable(machineDisplay1)
  ballcountText1.text = 'new string 1'

  const ballcountText2 = TextShape.getMutable(machineDisplay1)
  ballcountText1.text = 'new string 2'

  const ballcountText3 = TextShape.getMutable(machineDisplay1)
  ballcountText1.text = 'new string 3'

    // Store the display entity in the map

    playerDisplays.set(playerId+'0', machineDisplay)
    playerDisplays.set(playerId+'1', machineDisplay1)
    playerDisplays.set(playerId+'2', machineDisplay2)
    playerDisplays.set(playerId+'3', machineDisplay3)
}
}




function updatePlayerDisplay(playerId: string, newText: string, newText1: string, newText2: string) {
  // Get the display entities for the player
  const machineDisplays0 = playerDisplays.get(playerId+'0')
  const machineDisplays1 = playerDisplays.get(playerId+'1')
  const machineDisplays2 = playerDisplays.get(playerId+'2')
  const machineDisplays3 = playerDisplays.get(playerId+'3')

  
  
  // Update the text of the first display
  if (machineDisplays0) {
    console.log('updating display0')
    const machineDisplay0 = machineDisplays0
    Transform.getMutable(machineDisplay0).position.x = skeeGolfMachines[( playerManager.players.get(playerId)!).machineIndex].startingPosition.x -4.15
    Transform.getMutable(machineDisplay0).position.z = skeeGolfMachines[( playerManager.players.get(playerId)!).machineIndex].startingPosition.z +0.3
    const ballcountText = TextShape.getMutable(machineDisplay0)
    ballcountText.text = newText
  }

  // Update the text of the second display
  if (machineDisplays1) {
    console.log('updating display1')
    const machineDisplay1 = machineDisplays1
    Transform.getMutable(machineDisplay1).position.x = skeeGolfMachines[( playerManager.players.get(playerId)!).machineIndex].startingPosition.x -4.6
    Transform.getMutable(machineDisplay1).position.z = skeeGolfMachines[( playerManager.players.get(playerId)!).machineIndex].startingPosition.z +0.1
    const ballcountText = TextShape.getMutable(machineDisplay1)
    ballcountText.text = newText1

    
  }
  if (machineDisplays2) {
    console.log('updating display1')
    const machineDisplay2 = machineDisplays2
    Transform.getMutable(machineDisplay2).position.x = skeeGolfMachines[( playerManager.players.get(playerId)!).machineIndex].startingPosition.x +1
    Transform.getMutable(machineDisplay2).position.z = skeeGolfMachines[( playerManager.players.get(playerId)!).machineIndex].startingPosition.z +14.8
    const ballcountText = TextShape.getMutable(machineDisplay2)
    ballcountText.text = newText1

    
  }
  if (machineDisplays3) { 
    console.log('updating display1')
    const machineDisplay3 = machineDisplays3
    Transform.getMutable(machineDisplay3).position.x = skeeGolfMachines[( playerManager.players.get(playerId)!).machineIndex].startingPosition.x +1
    Transform.getMutable(machineDisplay3).position.z = skeeGolfMachines[( playerManager.players.get(playerId)!).machineIndex].startingPosition.z +14.8
    const ballcountText = TextShape.getMutable(machineDisplay3)
    ballcountText.text = newText2

    
  }





}

const bighighscoretext = engine.addEntity()
Transform.create(bighighscoretext, { 
  position: Vector3.create(6, 9.8, 29.8),
  rotation: Quaternion.fromEulerDegrees(0, 0, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
})
  TextShape.create(bighighscoretext, {
    text: "HIGHSCORE"+"\n \n"+"          SCORE",
    textColor: { r: 1, g: 0, b: 0, a: 1 },
    outlineColor: { r: 0, g: 0, b: 0 },
    outlineWidth: 0,
    fontSize: 8,
  })
  const bighighscoretext1 = engine.addEntity()
  Transform.create(bighighscoretext1, { 
    position: Vector3.create(54, 9.8, 29.8),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0), // Rotate 90 degrees counter clockwise around the y-axis
    scale: Vector3.create(1, 1, 1)
  })
    TextShape.create(bighighscoretext1, {
      text: "HIGHSCORE"+"\n \n"+"          SCORE",
      textColor: { r: 1, g: 0, b: 0, a: 1 },
      outlineColor: { r: 0, g: 0, b: 0 },
      outlineWidth: 0,
      fontSize: 8,
    })
    const bighighscoretext2 = engine.addEntity()
Transform.create(bighighscoretext2, { 
  position: Vector3.create(20, 9.8, 59.8),
  rotation: Quaternion.fromEulerDegrees(0, 0, 0), // Rotate 90 degrees counter clockwise around the y-axis
  scale: Vector3.create(1, 1, 1)
})
  TextShape.create(bighighscoretext2, {
    text: "HIGHSCORE"+"\n \n"+"          SCORE",
    textColor: { r: 1, g: 0, b: 0, a: 1 },
    outlineColor: { r: 0, g: 0, b: 0 },
    outlineWidth: 0,
    fontSize: 8,
  })
  const bighighscoretext3 = engine.addEntity()
  Transform.create(bighighscoretext3, { 
    position: Vector3.create(40, 9.8, 59.8),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0), // Rotate 90 degrees counter clockwise around the y-axis
    scale: Vector3.create(1, 1, 1)
  })
    TextShape.create(bighighscoretext3, {
      text: "HIGHSCORE"+"\n \n"+"          SCORE",
      textColor: { r: 1, g: 0, b: 0, a: 1 },
      outlineColor: { r: 0, g: 0, b: 0 },
      outlineWidth: 0,
      fontSize: 8,
    })
  







//code to receive price from Devs. Player wins a prize if they score at least 5 points
function givePrize(){


}










//================================================================================================
//===========================game explain guide===================================================
export let badgerNPC = npc.create(
  {
      position: Vector3.create(42.9, 1.2, 21), 
      rotation: Quaternion.fromEulerDegrees(0, 165, 0),
      scale: Vector3.create(1, 1, 1),  
  },
  
  {
      type: npc.NPCType.CUSTOM, 
      model: 'models/badgerNPC.glb', 
      onActivate: () => {
          console.log('npc activated')  
     
    let currentplayer = players.getPlayer()
    let currentplayerId = currentplayer?.userId
    let currentplayerName = currentplayer?.name
     
    if (currentplayerId && currentplayerName){
    npc.talk(badgerNPC, GolfGameMission(currentplayerId,currentplayerName), 0)
    }else{
      
    } 
      },
      onWalkAway: () => {
          console.log('test on walk away function')
      }, 
      faceUser: false,
      reactDistance: 2,
      idleAnim: 'gameguideidle',
      //walkingAnim: 'walk1',
      hoverText: 'Activate',
      continueOnWalkAway: true,
      onlyClickTrigger: false,
      onlyExternalTrigger: false,
  }
)

let trashcan = engine.addEntity()
GltfContainer.create(trashcan, { src: 'models/trashcan.glb' })
Transform.create(trashcan, {  
  position: Vector3.create(42.9, 1.2, 21), 
  rotation: Quaternion.fromEulerDegrees(0, 165, 0),
  scale: Vector3.create(1, 1, 1)
})




export let GolfGameMission = (currentplayerId: string,currentplayerName: string): Dialog[] => [
{
    text: `You found the "knowledge keeper"..`,
      windowHeight: 'auto',   
      triggeredByNext: () => {
        npc.playAnimation(badgerNPC, `gameguideitalk`, true, 2.63)
        }
},
{
    text: `Do you want to hear about Electro-Putt?`,
      windowHeight: 'auto',
      
    
      isQuestion: true,
      buttons: [
          { label: `Yes!`,
          goToDialog: 2 ,
          
          triggeredActions: () => {
            npc.playAnimation(badgerNPC, `gameguideitalk`, true, 2.63)
             
            } },

          { label: `No thank you.`, goToDialog: 7,
          triggeredActions: () => {
            npc.playAnimation(badgerNPC, `gameguideitalk`, true, 2.63)
             
            }


           },
          

      ],
},
{
    text: `Well well well.. It's skeeball but golf. Get it?`,
    triggeredByNext: () => {
      npc.playAnimation(badgerNPC, `gameguideitalk`, true, 2.63)
      }
},
{
    text: `you just walk into that glow pad to start a game.`,
    isQuestion: true,
      buttons: [
          { label: `Explain further.`,
          goToDialog: 4 ,
          
          triggeredActions: () => {
            npc.playAnimation(badgerNPC, `gameguideitalk`, true, 2.63)
             
            } },

          { label: `Ok, that's enough.`, goToDialog: 7,
          triggeredActions: () => {
            npc.playAnimation(badgerNPC, `gameguideitalk`, true, 2.63)
             
            }


           },
          

      ],
},
{
    text: `You can aim your shot by walking -left and right- behind the golfer.`,
    isQuestion: true,
      buttons: [
          { label: `Go on..`,
          goToDialog: 5 ,
          
          triggeredActions: () => {
            npc.playAnimation(badgerNPC, `gameguideitalk`, true, 2.63)
             
            } },

          { label: `Ok, that's enough.`, goToDialog: 7,
          triggeredActions: () => {
            npc.playAnimation(badgerNPC, `gameguideitalk`, true, 2.63)
             
            }


           },
          

      ],
},
{
    text: `Click the ball and watch it soar! Keep an eye on the power bar..`,
    isQuestion: true,
      buttons: [
          { label: `Anything good?`,
          goToDialog: 8 ,
          
          triggeredActions: () => {
            npc.playAnimation(badgerNPC, `gameguideitalk`, true, 2.63)
             
            } },

          { label: `Ok, that's enough.`, goToDialog: 7,
          triggeredActions: () => {
            npc.playAnimation(badgerNPC, `gameguideitalk`, true, 2.63)
             
            }


           },
          

      ],
},
{
    text: `Kay, BYE!`,
    
    isEndOfDialog: true,
    
},
{
    text: `Ok, wow ok fine..`,
      isEndOfDialog: true,
      
},

{
  text: `Holes further away are worth more! Don't miss to rack up a combo!`,//8
  isQuestion: true,
    buttons: [
        { label: `Anything else?`,
        goToDialog: 9 ,
        
        triggeredActions: () => {
          npc.playAnimation(badgerNPC, `gameguideitalk`, true, 2.63)
           
          } },

        { label: `Thanks for sharing.`, goToDialog: 6,
        triggeredActions: () => {
          npc.playAnimation(badgerNPC, `gameguideitalk`, true, 2.63)
           
          }


         },
        

    ],
},
{
  text: `No, stop asking....`,
    isEndOfDialog: true,
    
},
]

//================================================================================================
//=========================foodstand npc==========================================================

export let foodstandNPC = npc.create(
  {
      position: Vector3.create(59.8, 0.2, 45.5), 
      rotation: Quaternion.fromEulerDegrees(0, 165, 0),
      scale: Vector3.create(1, 1, 1),
  },
  
  { 
      type: npc.NPCType.CUSTOM, 
      model: 'models/badgerNPC.glb', 
      onActivate: () => {
          console.log('npc activated')  
     
    let currentplayer = players.getPlayer() 
    let currentplayerId = currentplayer?.userId
    let currentplayerName = currentplayer?.name
     
    if (currentplayerId && currentplayerName){
    npc.talk(badgerNPC, foodstandDialog(currentplayerId,currentplayerName), 0)
    }else{
      
    } 
      },
      onWalkAway: () => {
          console.log('test on walk away function')
      }, 
      faceUser: false,
      reactDistance: 3,
      idleAnim: 'foodstandidle',
      //walkingAnim: 'walk1',
      hoverText: 'Activate',
      continueOnWalkAway: true,
      onlyClickTrigger: false,
      onlyExternalTrigger: false,
      coolDownDuration: 30000,
  }
)

export let foodstandDialog = (currentplayerId: string,currentplayerName: string): Dialog[] => [
  {
      text: `They seem to be sleeping..`,
        windowHeight: 'auto',
        isQuestion: true,
        buttons: [
            { label: `Wake them up.`,
            goToDialog: 1 ,
            triggeredActions: () => {
              playerfoodstandaudio()
              } },
  
            { label: `Let them sleep..`, goToDialog: 3,
            triggeredActions: () => {
              
              }
             },
        ],
  },

  {
      text: `We're closed..`,
      //audio: 'sounds/foodstandgrunt.wav',
      triggeredByNext: () => {
        npc.playAnimation(badgerNPC, `foodstandtalk`, true, 2.63)
        
        }
  },

  {
    text: `...`,
      windowHeight: 'auto',
      isQuestion: true,
      buttons: [
          { label: `Keep waiting`,
          goToDialog: 1 ,
          triggeredActions: () => {
            playerfoodstandaudio()
            } },
          { label: `Give up.`, goToDialog: 3,
          triggeredActions: () => {
            
            }
           },
      ],
},

  {
      text: `Maybe later..`,
      isEndOfDialog: true,
  },
  ]

  function playerfoodstandaudio(){
    let audio = engine.addEntity() 
    Transform.create(audio).position = Vector3.create(59.8, 0.2, 45.5)
    AudioSource.create(audio, {
      audioClipUrl: 'sounds/foodstandgrunt.mp3',
      loop: false,
      playing: true,
      volume: 1,
    })
    utils.timers.setTimeout(function () {
      engine.removeEntity(audio); 
    }, 2000)
  }


  //================================================================================================
//=========================fortune teller npc=======================================================

export let fortuneNPC = npc.create(
  {
      position: Vector3.create(60, 0, 59), 
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
      scale: Vector3.create(1, 1, 1),
  },
  
  { 
      type: npc.NPCType.CUSTOM, 
      model: 'models/fortuneteller.glb', 
      onActivate: () => {
          console.log('npc activated')  
          playfortunestart()
          npc.playAnimation(fortuneNPC, `fortuneopen`, true, 2)
              npc.changeIdleAnim(fortuneNPC, `fortunecheck`, false)
    let currentplayer = players.getPlayer() 
    let currentplayerId = currentplayer?.userId
    let currentplayerName = currentplayer?.name
     
    if (currentplayerId && currentplayerName){
    npc.talk(badgerNPC, fortuneDialog(currentplayerId,currentplayerName), 0)
    }else{
      
    } 
      },
      onWalkAway: () => {
          console.log('test on walk away function') 
          
          npc.changeIdleAnim(fortuneNPC, `fortuneidle`, true)
      }, 
      faceUser: false,
      reactDistance: 4, 
      idleAnim: 'fortuneidle',
      //walkingAnim: 'walk1', 
      hoverText: 'Activate',
      continueOnWalkAway: false,
      onlyClickTrigger: false,
      onlyExternalTrigger: false,
  } 
)


export let fortuneDialog = (currentplayerId: string,currentplayerName: string): Dialog[] => [
  {
      text: `Fortunes told here..`,
        windowHeight: 'auto',
        isQuestion: true,
        buttons: [
            { label: `Take the risk.`,
            goToDialog: 1 ,
            triggeredActions: () => {
              playfortunecheck()
              
              } },
  
            { label: `No thanks..`, goToDialog: 3,
            triggeredActions: () => {
              
              }
             },
        ],
  },

  {
      text: `Let's see here.  ...  ..`,
      //audio: 'sounds/foodstandgrunt.wav',
      triggeredByNext: () => {
        playerfoodstandaudio()
        npc.playAnimation(fortuneNPC, `fortunetold`, true, 2)
        }
  },
{
  text: `Doesn't look good..`,
    windowHeight: 'auto',
    isQuestion: true,
    buttons: [
        { label: `Thanks...`,
        goToDialog: 3 ,
        triggeredActions: () => {
          
          
          } },
    ],
},
  {
      text: `...`,
      isEndOfDialog: true, 
      triggeredByNext: () => {
        npc.playAnimation(fortuneNPC, `fortuneclose`, true, 2)
        npc.changeIdleAnim(fortuneNPC, `fortuneidle`, false)
        playfortunestart()
        }
  },
  ]

  function playfortunestart(){
    let audio = engine.addEntity() 
    Transform.create(audio).position = Vector3.create(59.8, 0.2, 45.5)
    AudioSource.create(audio, {
      audioClipUrl: 'sounds/fortunestart.wav',
      loop: false,
      playing: true,
      volume: 1,
    })
    utils.timers.setTimeout(function () {
      engine.removeEntity(audio); 
    }, 2000)
  }
 
  function playfortunecheck(){
    let audio = engine.addEntity() 
    Transform.create(audio).position = Vector3.create(59.8, 0.2, 45.5)
    AudioSource.create(audio, {
      audioClipUrl: 'sounds/fortunecheck.wav',
      loop: false,
      playing: true,
      volume: 1,
    })
    utils.timers.setTimeout(function () {
      engine.removeEntity(audio); 
    }, 2000)
  }


   //================================================================================================
//=========================fortune teller npc 2=======================================================

export let fortuneNPC2 = npc.create(
  {
      position: Vector3.create(52, 0, 59), 
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
      scale: Vector3.create(1, 1, 1),
  },
  
  { 
      type: npc.NPCType.CUSTOM, 
      model: 'models/fortuneteller.glb', 
      onActivate: () => {
          console.log('npc activated')  
          playfortunestart()
          npc.playAnimation(fortuneNPC2, `fortuneopen`, true, 2)
              npc.changeIdleAnim(fortuneNPC2, `fortunecheck`, false)
    let currentplayer = players.getPlayer() 
    let currentplayerId = currentplayer?.userId
    let currentplayerName = currentplayer?.name
     
    if (currentplayerId && currentplayerName){
    npc.talk(badgerNPC, fortune2Dialog(currentplayerId,currentplayerName), 0)
    }else{
      
    } 
      },
      onWalkAway: () => {
          console.log('test on walk away function')
          npc.changeIdleAnim(fortuneNPC2, `fortuneidle`, true)
      }, 
      faceUser: false, 
      reactDistance: 4,
      idleAnim: 'fortuneidle',
      //walkingAnim: 'walk1', 
      hoverText: 'Activate',
      continueOnWalkAway: false,
      onlyClickTrigger: false,
      onlyExternalTrigger: false,
  }
)


export let fortune2Dialog = (currentplayerId: string,currentplayerName: string): Dialog[] => [
  {
      text: `Fortunes told here..`,
        windowHeight: 'auto',
        isQuestion: true,
        buttons: [
            { label: `Take the risk.`,
            goToDialog: 1 ,
            triggeredActions: () => {
              playfortunecheck()
              
              } },
  
            { label: `No thanks..`, goToDialog: 3,
            triggeredActions: () => {
              
              }
             },
        ],
  },

  {
      text: `Let's see here.  ...  ..`,
      //audio: 'sounds/foodstandgrunt.wav',
      triggeredByNext: () => {
        playerfoodstandaudio()
        npc.playAnimation(fortuneNPC2, `fortunetold`, true, 2)
        }
  },
{
  text: `Looks good!`,
    windowHeight: 'auto',
    isQuestion: true,
    buttons: [
        { label: `Thanks...`,
        goToDialog: 3 ,
        triggeredActions: () => {
          
          
          } },
    ],
},
  {
      text: `...`,
      isEndOfDialog: true, 
      triggeredByNext: () => {
        npc.playAnimation(fortuneNPC2, `fortuneclose`, true, 2)
        npc.changeIdleAnim(fortuneNPC2, `fortuneidle`, false)
        playfortunestart()
        }
  },
  ]


     //================================================================================================
//=========================frog npc====================================================================

export let frogNPC = npc.create( 
  {
      position: Vector3.create(61.5, 0, 47.7),  
      rotation: Quaternion.fromEulerDegrees(0, 180, 0),
      scale: Vector3.create(1, 1, 1),
  },
  
  { 
      type: npc.NPCType.CUSTOM,  
      model: 'models/frogNPC.glb',  
      onActivate: () => {
          //console.log('npc activated')  
          //playfortunestart()
          //npc.playAnimation(fortuneNPC2, `fortuneopen`, true, 2)
          //npc.changeIdleAnim(fortuneNPC2, `fortunecheck`, false)
    let currentplayer = players.getPlayer() 
    let currentplayerId = currentplayer?.userId  
    let currentplayerName = currentplayer?.name 
     
    if (currentplayerId && currentplayerName){
    //npc.talk(badgerNPC, fortune2Dialog(currentplayerId,currentplayerName), 0)
    }else{
      
    } 
      },
      onWalkAway: () => {  
          //console.log('test on walk away function')
          //npc.changeIdleAnim(fortuneNPC2, `fortuneidle`, true)
      }, 
      faceUser: false, 
      reactDistance: 4,
      idleAnim: 'frogidlesong1',
      //walkingAnim: 'walk1',  
      hoverText: 'Activate',
      continueOnWalkAway: false,
      onlyClickTrigger: false, 
      onlyExternalTrigger: false, 
  }
)
    AudioSource.create(frogNPC, {
      audioClipUrl: 'sounds/banjo1.mp3',  
      loop: true,
      playing: true,
      volume: 0.1,
    })