import React from 'react'
import useKeyboardSound from '../hooks/useKeyboardSound'

function MessageInput() {
  const {playRandomKeyStrokeSound} = useKeyboardSound();
  return (
    <div>MessageInput</div>
  )
}

export default MessageInput