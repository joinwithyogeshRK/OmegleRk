import { useEffect } from 'react';
import {socket} from '../hooks/socket'
const Landing = () => {
  console.log("here is socket",socket);
  useEffect(()=>{
    socket.emit('message', {
      sdp:"hello world"
    },[] )
  })
  return (
    <div>
    
    </div>
  )
}

export default Landing
