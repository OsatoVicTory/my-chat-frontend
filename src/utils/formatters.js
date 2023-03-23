const fixZeros = (x) => x >= 10 ? x : `0${x}`;

const mnth = [
    "January", "February", "March", "April", "May", "June", "July", 
    "August", "September", "October", "November", "December"
]

export const formatTime = (time) => {
    
    if(time>=60) return `${fixZeros(Math.floor(time/60))}:${fixZeros(time%60)}`;
    else return `00:${time}`;
};

export const formatMessageTime = (time) => {
    const date = new Date(time);
    return `${fixZeros(date.getHours())}:${fixZeros(date.getMinutes())}`
}

export const formatToTimeAndDate = (time) => {
    const val = new Date(time);
    let date = `${fixZeros(val.getDate())}/${fixZeros(val.getMonth()+1)}/${val.getFullYear()}`;
    let Time = `${fixZeros(val.getHours())}:${fixZeros(val.getMinutes())}`;
    return `${date},  ${Time}`;
}

export const formatTimeInDateForm = (val) => {

    // console.log(typeof time)
    const dayMilliseconds = 1000 * 60 * 60 * 24;
    const date = new Date();
    const time = new Date(val);

    // if not past a day i.e 24 hrs
    // console.log(time, time.getTime(), date.getTime())
    if(date.getTime() - time.getTime() < dayMilliseconds) {
        const hrsDiff = date.getHours() - time.getHours();
        const minsDiff = date.getMinutes() - time.getMinutes();
        if(hrsDiff >= 1) return `${hrsDiff} hour${hrsDiff > 1 ? "s" : ""} ago`;
        else if(minsDiff >= 1) return `${minsDiff} minute${minsDiff > 1 ?"s" : ""} ago`;
        else return `Just now`;
    } 
    // if same year return *January 16, 23:00*
    else if(date.getFullYear() === time.getFullYear()) {
        return `${mnth[time.getMonth()]} ${time.getDate()}, ${fixZeros(time.getHours())}:${fixZeros(time.getMinutes())}`;
    }
    // if not same year return *16/1/2023, 23:00*
    else {
        return `${fixZeros(time.getDate())}/${fixZeros(time.getMonth()+1)}/${time.getFullYear()}, ${fixZeros(time.getHours())}:${fixZeros(time.getMinutes())}`;
    }
} 

export const formatTimeInSecs = (val) => {
    // let val = time-0;
    let res = '';
    res += fixZeros(Math.floor(val / 3600)) + 'H: ';
    val %= 3600;
    res += fixZeros(Math.floor(val / 60)) + 'M: ';
    val %= 60;
    res += val+'S';

    return res;
}

const isLink = (txt) => {
    const checkers = ['https://','www.','.com','.io','.to'];
    for(var j=0;j<checkers.length;j++) {
        if(txt.includes(checkers[j])) return true;
    }
    return false;
};

export const formatTextForLinks = (val) => {
    let newText = '';
    const text = val.split(' ');
    for(var i=0;i<text.length;i++) {
        if(isLink(text[i])) {
            newText += `<a href=${text[i]} target="_blank">${text[i]}</a> `;
        } else {
            newText += text[i] + ' ';
        }
    }
    return newText;
}

export const formatStatusTime = (time) => {
    const date = new Date(time);
    const curDate = new Date();
    if(date.getDate() != curDate.getDate()) {
        return `Yesterday, ${fixZeros(date.getHours())}:${fixZeros(date.getMinutes())}`;
    } else {
        return `Today, ${fixZeros(date.getHours())}:${fixZeros(date.getMinutes())}`;
    }
};

export const formatLastSeenTime = (when) => {
    const date = new Date(when);
    const curDate = new Date();
    const time = String(date);
    if(date.getFullYear() !== curDate.getFullYear()) {
        return time.slice(4, 15);
    } else if(date.getMonth() !== curDate.getMonth()) {
        return time.slice(0, 10);
    } else {
        let diff = date.getDate() - curDate.getDate();
        if(diff > 1) return `${time.slice(0, 3)} at ${time.slice(15, 20)}`;
        else if(diff == 1) return `Yesterday at ${time.slice(15, 20)}`;
        else return `Today at ${time.slice(15, 20)}`;
    }
}