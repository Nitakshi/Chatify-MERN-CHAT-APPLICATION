const keyStrokeSounds = [];

function useKeyboardSound(){
    const playRandomKeyStrokeSound = () => {
        const randomSound = keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];
        randomSound.currentTime = 0;
        randomSound.play().catch((error) => console.error("Audio play failed: ", error));
    }

    return {playRandomKeyStrokeSound};
}

export default useKeyboardSound;