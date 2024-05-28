import {engine,Transform,UiInput,PlayerIdentityData,} from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { playerManager } from './index'
import { Player, PlayerManager } from './systems'
import { EntityPropTypes } from '@dcl/sdk/react-ecs'
import  { getPlayer } from '@dcl/sdk/src/players'
import { NpcUtilsUi } from 'dcl-npc-toolkit'





const SceneOwnedUi = () => (
  <UiEntity
    uiTransform={{
      width: 400,
      height: 500,
      margin: '16px 0 8px 270px',
      padding: 4,
    }}
  >
    <NpcUtilsUi /> 
    {/* rest of user defined UI */}
  </UiEntity>
)
 


export function setupUi() {
 
  ReactEcsRenderer.setUiRenderer(SceneOwnedUi)
  
}


/* export let handleButtonAction = (direction: string, isMouseDown: boolean) => {
  const currentPlayerId = getPlayer()?.userId
  const currentPlayer = currentPlayerId ? playerManager.players.get(currentPlayerId) : undefined;
  if (isMouseDown && currentPlayerId) {
    //currentPlayer?.moveSystem.setDirection(direction); // Or whatever direction the player chose
  } else {
    //moveSystem.setDirection('stop');
  }
}

export function handleDestroyAction(isMouseDown: boolean) {
  const currentPlayerId = getPlayer()?.userId
  const currentPlayer = currentPlayerId ? playerManager.players.get(currentPlayerId) : undefined;
  if (isMouseDown && currentPlayerId && currentPlayer) {
    engine.removeEntity(currentPlayer.golf)
    
    //playerManager.removePlayer(currentPlayerId)
    //console.log(playerManager.players.size)
    //hideControls() 
  } 
}



//create buttons to move the tank forward, backward and buttons to rotate the tank left and right
export const uiComponent = (controlsVisible: boolean) => {

  return controlsVisible ? (
  <UiEntity
    uiTransform={{
      width: 400,
      height: 300,
      margin: '16px 0 8px 270px',
      padding: 4,
    }}
    uiBackground={{ color: Color4.create(0.5, 0.8, 0.1, 0.6) }}
  >
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
      uiBackground={{ color: Color4.fromHexString("#70ac76ff") }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 150,
          margin: '8px 0'
        }}
        uiBackground={{
          textureMode: 'stretch',
          texture: {
            src: 'thumbnail.png',
          },
        }}
        uiText={{ value: 'SDK7 Smart Wearable', fontSize: 18 }}
      />
      <Button
        onMouseDown={() => handleButtonAction('forward', true)}


        onMouseUp={() => handleButtonAction('stop', true)}
        value={`forward`}
        fontSize={18}
        uiTransform={{ width: '100%', height: 90 } }
      />
      <Button
        onMouseDown={() => handleButtonAction('left', true)}
        onMouseUp={() => handleButtonAction('stop', true)}
        value={`left`}
        fontSize={18}
        uiTransform={{ width: '100%', height: 70 } }
      />
      <Button
        onMouseDown={() => handleButtonAction('right', true)}
        onMouseUp={() => handleButtonAction('stop', true)}
        value={`right`}
        fontSize={18}
        uiTransform={{ width: '100%', height: 60 } }
      />
      <Button
        onMouseDown={() => handleButtonAction('stop', true)}
        onMouseUp={() => handleDestroyAction(true)}
      
        value={`Quit`}
        fontSize={18}
        uiTransform={{ width: '100%', height: 50 } }
      />
      <Button
        onMouseDown={() => handleButtonAction('hit', true)}
        //onMouseUp={() => handleDestroyAction(true)}
      
        value={`Hit`}
        fontSize={18}
        uiTransform={{ width: '100%', height: 70 } }
      />
    </UiEntity>
  </UiEntity>
  ) : null;
}

export function showControls() {
  
  renderUiComponent(true);
  
}

export function hideControls() {
  
  renderUiComponent(false);
  setupUi()
}

export function renderUiComponent(controlsVisible: boolean) {
  ReactEcsRenderer.setUiRenderer(() => uiComponent(controlsVisible));
  
}
  
   */