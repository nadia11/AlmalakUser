//Save your sound clip files under the directory android/app/src/main/res/raw. Note that files in this directory must be lowercase and underscored (e.g. my_file_name.mp3) and that subdirectories are not supported by Android
var Sound = require('react-native-sound');

//Sound.setCategory('Ambient', true);
Sound.setCategory('Playback', true);


const buttonPress = new Sound('beep.mp3', Sound.MAIN_BUNDLE, (error) => console.log('failed to load the sound', error));
export const playButtonPress = () => {
    buttonPress.play((success) => {
        console.log('successfully finished playing');
        buttonPress.release();
    });
    //   buttonPress.play((success) => buttonPress.reset());
}
buttonPress.setVolume(1);

// const pull = new Sound(require('../assets/sounds/beep.mp3'), error => console.log(error));
// export const playListPull = () => {
//   pull.play((success) => pull.reset());
// }

// const pullFinished = new Sound(require('../assets/sounds/pew.aac'), error => console.log(error));
// export const playListPullFinished = () => {
//   pullFinished.play((success) => pullFinished.reset());
// }
// import { playButtonPress, playRemoteURLSoundFile } from '../components/audio';


{/* <TouchableOpacity style={{backgroundColor:'red', position: 'absolute', top: 50, left: 0}} onPress={playRemoteURLSoundFile}>
<Text style={{textAlign:'center',fontSize:20,color:'white',padding:10}}>Play sound from local file</Text>
</TouchableOpacity> */}


export const playRemoteURLSoundFile = () =>{
  Sound.setCategory('Playback');
  var myRemoteSound = new Sound('https://www.soundjay.com/ambient/sounds/boarding-accouncement-1.mp3',null,(error)=>{
  if(error){
  console.log(error);
  return;
  }else{
  myRemoteSound.play((success)=>{
  if(success){
  console.log('Sound playing')
  }else{
  console.log('Issue playing file');
  }
  })
  }
  });
  myRemoteSound.setVolume(0.9);
  myRemoteSound.release();
}


// var whoosh = new Sound('super_ringtone.mp3', Sound.MAIN_BUNDLE, (error) => {
//     if (error) {
//       console.log('failed to load the sound', error);
//       return;
//     }
//     // loaded successfully
//     console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());
   
//     // Play the sound with an onEnd callback
//     whoosh.play((success) => {
//       if (success) {
//         console.log('successfully finished playing');
//       } else {
//         console.log('playback failed due to audio decoding errors');
//       }
//     });
//   });

// Reduce the volume by half
// whoosh.setVolume(0.5);
 
// Position the sound to the full right in a stereo field
// whoosh.setPan(1);
 
// Loop indefinitely until stop() is called
// whoosh.setNumberOfLoops(-1);
 
// Get properties of the player instance
// console.log('volume: ' + whoosh.getVolume());
// console.log('pan: ' + whoosh.getPan());
// console.log('loops: ' + whoosh.getNumberOfLoops());
 
// Seek to a specific point in seconds
// whoosh.setCurrentTime(2.5);
 
// Get the current playback point in seconds
// whoosh.getCurrentTime((seconds) => console.log('at ' + seconds));
 
// Pause the sound
// whoosh.pause();
 
// Stop the sound and rewind to the beginning
// whoosh.stop(() => {
//   whoosh.play();
// });
 
// Release the audio player resource
// whoosh.release();