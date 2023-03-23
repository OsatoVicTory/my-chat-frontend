export const videoTime = (time) => {
    
    const fixZeros = (x) => x >= 10 ? x : `0${x}`;
    if(time>=60) return `${fixZeros(Math.floor(time/60))}:${fixZeros(time%60)}`;
    else return `00:${time}`;
}