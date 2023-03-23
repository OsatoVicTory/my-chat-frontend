import img from "../svgs/avatar.png";

export const getPathLength = (path) => {
    let cnt = 0;
    for(var i=0;i<path.length;i++) {
        if(path[i] === "/") cnt++;
    }

    return cnt-1;
}
const hash = "LEHV6nWB2yk8pyo0adR*.7kCMdnj";
const getFakeContactsData = () => {
    let arr = [];
    for(var i=1;i<=7;i++) {
        arr.push({
            userName: "Bose", firstName:"Bose",
            phoneNumber:"+2349065352839",
            refId: ""+i, img, _id: ''+i,
            about:"I like me",
            contacts: [{userName:"Bolu", userId: ''+i}],
            userGroups:["1"], userColor:"green",
        });
    }
    return arr;
}

const getParticipants = () => {
    return ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15"]
        .map(val => ({userName:"Bose",userId:val,phoneNumber:"+2349065352839",img}))
};
const getImages = () => {
    return new Array(10).fill({
        img: {img,hash},
        senderImg: img,
        senderName: "Bose",
        senderNumber: "+2349065352839",
        time: "Today at 11:00 am"
    });
}

export const fetchFakeReactions = (i = 1) => {
    return [
        {userId: "0",phoneNumber:"+234 906 535 2839",img, emoji: '💪'},
        {userId: ""+i,phoneNumber:"+234 906 535 2839",img, emoji: '🙏'},
    ]
}

export const getFakeAccount = () => {
    return {
        userName: "Tory", firstName:"Bose",
        phoneNumber:"+2349065352839",
        refId: ""+0, img, _id: "0",
        about:"I am me",
        contacts: [
            {userName:"Bose", userId: '1'},
            {userName:"Bose", userId: '2'},
            {userName:"Bose", userId: '3'},
            {userName:"Bose", userId: '4'},
            {userName:"Bose", userId: '5'},
            {userName:"Bose", userId: '6'},
            {userName:"Bose", userId: '7'}
        ],
        userGroups:["1"], userColor:"blue",
        contactsData: getFakeContactsData(),
    };
}

export const getFakeAccounts = () => {
    let arr = [];
    for(var i=1;i<=20;i++) {
        arr.push({
            account: {
                userName: "Bose", firstName:"Bose",
                phoneNumber:"+2349065352839",
                refId: ""+i, img, _id: ''+i,
                about:"I like me",
                contacts: [{userName:"Bolu", userId: 2}],
                userGroups:["1"], userColor:"green",
                lastSeen: "Today at 11:00 a.m"
            },
            messagesData: [
                {senderId: ""+i,_id:'20',receiverId: ""+0,message:"Finished testing",senderNumber:"+2349065352839",
                isSeen: true, createdAt: String(new Date()), senderColor:"green"},
                {senderId: ""+i,_id:'21',receiverId: ""+0,link:"/app/call/audio/call/1",linkType:"call", 
                createdAt: String(new Date()), senderColor:"green", senderNumber:"+2349065352839"},
                {senderId:""+0,_id:'22',receiverId:""+i, message: "Another tester", senderNumber: "+2349065352839",
                createdAt: String(new Date()), isDelivered: true, senderColor: "blue"},
                {senderId: ""+i,_id:'23',receiverId: ""+0,message:"testing", senderNumber:"+2349065352839", 
                createdAt: String(new Date()), images:[{img,hash}], senderColor:"green", senderImg:img},
                {senderId: ""+i,_id:'24',receiverId: ""+0,message:"Testing reactions", senderNumber:"+2349065352839", 
                createdAt: String(new Date()), images:[{img,hash}], senderColor:"green", senderImg:img,
                reactions: fetchFakeReactions(i)},
            ],
            unreadMessages: 2,
        })
    }
    return arr;
}

export const getFakeGroups = () => {
    let arr = [];
    for(var i=0;i<10;i++) {
        arr.push({
            account: {
                name: "Fake Group", description: "Parody account",
                createdBy: "Bose", createdAt: String(new Date()),
                _id: ''+i, img, participants: getParticipants(),
                groupRefId: ""+i, Images: getImages()
            },
            messagesData: [
                {senderId: ""+i,_id:'20',groupId: ""+i,message:"testing", createdAt: String(new Date()),
                senderNumber:"+234905352839", senderColor: "green"},
                {senderId: ""+i,_id:'21',groupId: ""+i,message:"testing", createdAt: String(new Date()),
                senderNumber:"+2349065352839", senderColor: "green"},
                {senderId:""+0,_id:'22',message:"seen", createdAt: String(new Date()),
                isRead: true, senderNumber:"+2349065352839", senderColor: "red"},
                {senderId: ""+i,_id:'23',groupId: ""+i,message:"testing", senderNumber:"+2349065352839", senderColor: "red",
                createdAt: String(new Date()), images:[{img,hash}]},
            ],
            unreadMessages: 3,
        })
    }
    return arr;
}
export const getFakeStatus = () => {
    let arr = {user:{},recentUpdates:[],viewedUpdates:[]};
    arr.user = {
        statuses: new Array(3).fill({
            posterId: ''+0,posterRefId:""+0,
            caption: "First post", 
            viewers: [{userId:'1',time:String(new Date())},{userId:'2',time:String(new Date())},{userId:'3',time:String(new Date())}],
            statusValue: {img, hash}, createdAt: String(new Date()), 
        })
    }
    for(var j=0;j<3;j++) {
        arr.recentUpdates.push({
            account: {
                userName: "Bose", firstName:"Bose",
                phoneNumber:"+2349065352839",
                refId: ""+j, img, _id: ''+j,
                about:"I like me",
                contacts: [{userName:"Bolu", userId: 2}],
                userGroups:["1"], userColor:"green",
            },
            statuses: [0,1,2].map(val => ({
                posterId: ''+(j+1),posterRefId:""+0,
                caption: "First post", viewers: [1,0,3],
                statusValue: {img, hash}, _id: ""+val,
                createdAt: String(new Date()),
            })),
            viewed: 0,
        })
    }
    for(var t=0;t<3;t++) {
        arr.viewedUpdates.push({
            account: {
                userName: "Bose", firstName:"Bose",
                phoneNumber:"+2349065352839",
                refId: ""+t+3, img, _id: ""+(t+3),
                about:"I like me", 
                contacts: [{userName:"Bolu", userId: 2}],
                userGroups:["1"], userColor:"green",
            },
            statuses: [0,1,2].map(val => ({
                posterId: ""+(t+3),posterRefId:""+(t+3),
                caption: "First post", viewers: [0,2,3],
                statusValue: {img, hash}, _id: ""+val,
                createdAt: String(new Date()), 
            })),
            viewed: 0,
        })
    }
    return arr;
}