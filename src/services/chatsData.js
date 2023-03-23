import img from "../svgs/avatar.png";


const Data = new Array(20).fill({
    name: "Ade",
    unread: true,
    img: img,
    time: "14:31",
    unread: true,
    unreadNo: 1000,
    lstmessage: "+234 911 123 4567: Reboot the system and dry it in hanger",
    userId: Math.floor(Math.random() * 1000000000)
});

export default Data;