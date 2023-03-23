import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import "./App.css";
import MediaPage from "./components/MediaPage/MediaPage";
import SideComponent from "./pages/SideComponent/index";
import DM from "./pages/chats/DMs/DM";
import GC from "./pages/chats/GCs/GC";
import ChatNull from "./pages/chats/Null";
import GC_Info from "./pages/ChatInfo/GC_Info";
import DM_Info from "./pages/ChatInfo/DM_Info";
import VideoCall from "./pages/LiveCalls/VideoCall";
import AudioCall from "./pages/LiveCalls/AudioCall";
import StatusView from "./pages/Status/StatusView";
import Profile from "./pages/Profile/Profile";
import MyStatus from "./pages/Status/MyStatus";
import UploadStatusImage from "./pages/SideComponent/StatusHome/uploadImage";
import WriteStatus from "./pages/SideComponent/StatusHome/writeStatus";
import StatusNull from "./pages/Status/StatusNull";
import { getPathLength, getFakeAccount } from "./utils/routings";
import AnswerAudioCall from "./pages/LiveCalls/answerAudio";
import AnswerVideoCall from "./pages/LiveCalls/answerVideo";
import CallsNull from "./pages/LiveCalls/CallsNull";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { 
  chatsActions, groupChatsActions, userActions, 
  callsActions, statusActions, curCallActions, statusMessageActions 
} from "./state";
import { 
  receivedNewStatus, viewedStatus,
  updateReaction, deletedStatus,
  receiveMessagesSentToYou, changeUserAccount,
  deletedMessageForAll, changeGroupAccount,
  userTypingMessage, LeftGroup, readAllMessages,
  allYourSentMessageDelivered, oneOfYourSentMessageDelivered 
} from "./utils/helpers";
import {
  addUsersToGroup, leaveGroup,
  joinViaGroupLink, makeAdmin,
  receiveMessageLink, receiveForwardedMessage
} from "./utils/helpers2";
import { io } from "socket.io-client";
import LoadingPage from "./components/loading/LoadingPage";
import { userLoggedIn } from "./services/user";
import ErrorPage from "./components/error/error";

const AppMain = () => {

  const { chats, groups, status, user, curCall, calls } = useSelector(state => state);
  const dispatch = useDispatch();
  const { setChatsData } = bindActionCreators(chatsActions, dispatch);
  const { setGroupChatsData } = bindActionCreators(groupChatsActions, dispatch);
  const navigate = useNavigate();
  const { setCurCallData } = bindActionCreators(curCallActions, dispatch);
  const { setUserData } = bindActionCreators(userActions, dispatch);
  const { setCallsData } = bindActionCreators(callsActions, dispatch);
  const { setStatusData } = bindActionCreators(statusActions, dispatch);
  const { setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
  const { contacts, img, _id, userGroups } = user;
  const [socket, setSocket] = useState({});
  const [Loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const SERVER = "http://localhost:5000";

  const routesComponents = {
    chat_null: <ChatNull />,
    dm: <DM socket={socket} />,
    gc: <GC socket={socket} />,
    media: <MediaPage socket={socket} />,
    dm_info: <DM_Info socket={socket} />,
    gc_info: <GC_Info socket={socket} />,
    call: <CallsNull />,
    audio_call: <AudioCall socket={socket} />,
    video_call: <VideoCall socket={socket} />,
    audio_call_join: <AnswerAudioCall socket={socket} />,
    video_call_join: <AnswerVideoCall socket={socket} />,
    status_view: <StatusView socket={socket} />,
    upload_img: <UploadStatusImage socket={socket} />,
    write: <WriteStatus socket={socket} />,
    my_status_view: <MyStatus socket={socket} />,
    status_null: <StatusNull />,
    profile: <Profile socket={socket} />,
  };
  
  const pathLen = getPathLength(useLocation().pathname);

  const LeftDiv = () => {

    return (
      <div className={`Left ${pathLen <= 2}`}>
        <SideComponent socket={socket} />
      </div>
    )
  }

  const RightDiv = ({ ele }) => {
    
    return (
      <div className={`Right ${pathLen > 2}`}>
        {routesComponents[ele]}
      </div>
    )

  };

  useEffect(() => {
    if(!user?._id && user?._id != 0) {
      setLoading(true);
      setUserData(getFakeAccount());
      return setLoading(false);

      userLoggedIn()
        .then(res => {
          if(res.data.status != "success") {
            setStatusMessage({type:'error',text:res.data.message});
            return navigate("/login");
          }
          setStatusMessage({type:'success',text:res.data.message});
          setUserData(res.data.user);
          setLoading(false);
        })
        .catch(err => {
          setStatusMessage({type: 'error',text: err?.message||'Bad network. Reload page'})
          setError(true);
          setLoading(false);
        })
    }
    if(!socket?.on) setSocket(io(SERVER));
    if(socket.on && socket.emit) { 
    socket.on('sentLink', (data) => {
      receiveMessageLink(data.targets, _id, data.sender, data.message, chats, setChatsData, groups, setGroupChatsData, socket);
    });

    socket.on('forwardedMessage', (data) => {
      receiveForwardedMessage(data.targets, _id, data.sender, data.message, chats, setChatsData, groups, setGroupChatsData, socket);
    })
    
    /* incoming message(s) received socket */
    //this happens only once, when user just comes online
    //so fire action receivedAllMessages to all senders
    //to update message state to delivered on their end
    //no need to update my own delivered state
    //as api call would have done that
    socket.emit('receivedAllMessages', {
        senders: chats.map(chat => chat.account._id),
        receiver: _id
    });

    /** chats */
    socket.on('istypingToYou', (data) => {
      if(data.typerId==_id) return;
      const displayName = contacts.find(contact => contact.userId == data.typerId)?.userName;
      userTypingMessage(chats, setChatsData, data.typerId, displayName||data.typerNumber);
    });

    socket.on('stoppedTypingToYou', (data) => {
      if(data.typerId==_id) return;
      userTypingMessage(chats, setChatsData, data.typerId, null)
    });

    socket.on('sentMessageToYou', (data) => {
        socket.emit('receivedOneMessage', {
            receiver: data.receiver,
            sender: data.sender,
            messageId: data.message._id
        });

        receiveMessagesSentToYou(null, null, chats, setChatsData, data.sender, data.message, data.account);
    });
     
    socket.on('deliveredAllMessages', (data) => {
      allYourSentMessageDelivered(chats, setChatsData, data.receiver)
    });

    socket.on('deliveredOneMessage', (data) => {
        oneOfYourSentMessageDelivered(chats, setChatsData, data.sender, data.messageId);
    })
  
    socket.on('readAllMessages', (data) => {
        readAllMessages(null, null, chats, setChatsData, data.reader);
    });
  
    socket.on('deletedMessageForAll', (data) => {
      deletedMessageForAll(null, null, chats, setChatsData, data.messageId, data.deleter);
    });

    socket.on('updatedMyAccount', (data) => {
      if(data._id == user._id) return setUserData({ lastSeen: data.lastSeen });
      if(!chats.find(chat => chat.account._id == data._id)) return;
      changeUserAccount({...data}, null, chats, setChatsData, data?.updater||data._id);
      changeUserAccount({...data}, null, status, setStatusData,data?.updater||data._id);
      changeUserAccount({...data}, null, calls, setCallsData, data?.updater||data._id);
      let { contactsData } = user;
      for(var i=0;i<contactsData.length;i++) {
        if(contactsData[i].userId == data._id) {
          const tmp = contactsData[i].userName;
          contactsData[i] = {...data};
          contactsData[i].userName = tmp;
          setUserData({ contactsData });
          break;
        }
      }
    });
  
    socket.on('receiveReaction', (data) => {
      if(data.groupId) return;
      if(!chats.find(c => c.account._id == data.receiver)) return;
      updateReaction(null, null, chats, setChatsData, data.id, data.messageId, data.reactions);
    });
    /** chats */

    /** group */
    socket.on('joinedGroup', (data) => {
      if(!userGroups.find(group => data.groupId == group)) return;
      joinViaGroupLink(data.groupId, data.joiner, contacts, groups, setGroupChatsData);
    });

    socket.on('leftGroup', (data) => {
      if(!userGroups.find(group => data.groupId == group)) return;
      leaveGroup(data.groupId, data.leaver, contacts, groups, setGroupChatsData);
    });

    socket.on('madeAdmin', (data) => {
      if(!userGroups.find(group => data.groupId == group)) return;
      const {initiated, initiator} = data;
      const initiatedName = contacts.find(c => c.userId == initiated.userId)?.userName||initiated.phoneNumber;
      const initiatorName = contacts.find(c => c.userId == initiator.userId)?.userName||initiator.phoneNumber;
      makeAdmin(data.groupId, initiatorName, initiatedName, initiated.userId, groups, setGroupChatsData);
    });

    socket.on('addedUsersToGroup', (data) => {
      if(!userGroups.find(group => data.groupId == group)) return;
      addUsersToGroup(data.groupId, data, contacts, groups, setGroupChatsData);
    });

    socket.on('sentGroupMessageToYou', (data) => {
        if(!userGroups.find(group => data.groupId == group)) return;
        receiveMessagesSentToYou(null, null, groups, setGroupChatsData, data.groupId, {...data.message});  
    });

    socket.on('typingToGroup', (data) => {
        if(data.typerId==_id) return;
        if(!userGroups.find(group => data.to == group)) return;
        const displayName = contacts.find(contact => contact.userId == data.typerId)?.userName;
        userTypingMessage(groups, setGroupChatsData, data.groupId, displayName||data.typerNumber);
    });

    socket.on('stoppedTypingToGroup', (data) => {
        if(data.typerId==_id) return;
        if(!userGroups.find(group => data.to == group)) return;
        userTypingMessage(groups, setGroupChatsData, data.groupId, null);
    });

    socket.on('deletedGroupMessageForAll', (data) => {
        if(!userGroups.find(group => data.groupId == group)) return;
        deletedMessageForAll(null, null, groups, setGroupChatsData, data.messageId, data.groupId);
    });

    socket.on('receiveReaction', (data) => {
        if(!data.groupId) return;
        if(!userGroups.find(group => data.groupId == group)) return;
        updateReaction(null, null, groups, setGroupChatsData, data.id, data.messageId, data.reactions);
    });

    socket.on('updatedGroupAccount', (data) => {
        if(!groups.find(chat => chat.account._id == data.groupId)) return;
        changeGroupAccount({...data.account}, null, groups, setGroupChatsData, data.groupId);
    });

    socket.on('leftGroup', (data) => {
      LeftGroup(data.exiter, data.message, data.groupId, groups, setGroupChatsData);
    });
    /** group */

    /** status */
    socket.on('receiveStatus', (data) => {
        const displayName = contacts.find(contact => contact.userId == data.posterId)?.userName;
        if(!displayName || !data.to.includes(_id)) return;
        receivedNewStatus(data, status, setStatusData, displayName, data.posterImg);
    });

    socket.on('viewedStatus', (data) => {
        viewedStatus(data.statusId, data.viewerId, data.time, status, setStatusData);
    });

    socket.on('deletedStatus', (data) => {
        if(!contacts.find(contact => contact.userId == data.posterId)) return;
        deletedStatus(data.statusId, data.posterId, status, setStatusData);
    })
    /** status */

    /** calls */
    socket.on('receivingCall', (data) => {
      if(curCall.isInCall) {
          socket.emit('userInCall', { caller: data.caller, receiver: user._id, to: data.caller });
      } else {
          setCurCallData({signal: data.signal});
          navigate(`/app/call/${data.callType}/join/${data.caller}?lastPage=${window.location.pathname}`);
      }
    });
    /** calls */
    }

    return () => {
      if(socket?.disconnect) socket.diconnect();
    }

  }, []);


  return (
    <div className="App">
      {Loading && <LoadingPage />}
      {error && <ErrorPage />}
      {(!Loading && !error) && <div className="main">
        <LeftDiv />

        <Routes>
          <Route path="/chat" element={<RightDiv ele="chat_null" />} />
          <Route path="/chat/dm/:id" element={<RightDiv ele="dm" />} />
          <Route path="/chat/gc/:id/:refId" element={<RightDiv ele="gc" />} />
          <Route path="/media/images/:id" element={<RightDiv ele="media" />} /> 
          <Route path="/group/info/:id" element={<RightDiv ele="gc_info" />} />
          <Route path="/account/info/:id" element={<RightDiv ele="dm_info" />} />
          <Route path="/call" element={<RightDiv ele="call" />} />
          <Route path="/call/audio/call/:receiverId" element={<RightDiv ele="audio_call" />} />
          <Route path="/call/audio/join/:callerId" element={<RightDiv ele="audio_call_join" />} />
          <Route path="/call/video/call/:receiverId" element={<RightDiv ele="video_call" />} />
          <Route path="/call/video/join/:callerId" element={<RightDiv ele="video_call_join" />} />
          <Route path="/status" element={<RightDiv ele="status_null" />} />
          <Route path="/status/create/write" element={<RightDiv ele="write" />} />
          <Route path="/status/create/upload-img" element={<RightDiv ele="upload_img" />} />
          <Route path="/status/view-my-status" element={<RightDiv ele='my_status_view' />} />
          <Route path="/status/view-status" element={<RightDiv ele="status_view" />} />
          <Route path="/me/profile" element={<RightDiv ele="profile" />} />
        </Routes>
      </div>}
    </div>
  )
}

export default AppMain;