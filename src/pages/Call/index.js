import { useSelector, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
// import { setStatusMessageData } from '../../../store/actions';
import './styles.css';
import AudioCall from './audioCall';
// import { contactName } from '../../../utils/Chat';
import AudioReceive from './audioReceive';
import VideoCall from './videoCall';
import VideoReceive from './videoReceive';

const CallsPage = ({ data, socket, closePage }) => {

    // const { _id, contacts, userName, img } = useSelector(state => state.user);
    const { _id, contacts, userName, img } = { _id:'123',contacts:[],userName:'Osato',img:'' };
    const { type, callerId, receiverId, receiverName, image, signal, callerName } = data;
    const dispatch = useDispatch();
    // const setStatusMessage = bindActionCreators(setStatusMessageData, dispatch);
    const setStatusMessage = () => null;
    const contactName = () => 'User';
    
    if(type === 'audio' && callerId === _id) {
        return (
            <div className='CALLS'>
                <AudioCall setStatusMessage={setStatusMessage}
                closePage={closePage} image={image} userName={userName}
                receiverId={receiverId} socket={socket} callerId={callerId} img={img}
                receiverName={contactName(receiverId, contacts) || receiverName} />
            </div>
        )
    } else if(type === 'audio' && callerId !== _id) {
        return (
            <div className='CALLS'>
                <AudioReceive closePage={closePage} image={image} signal={signal}
                receiverId={receiverId} socket={socket} callerId={callerId}
                callerName={contactName(callerId, contacts) || callerName} />
            </div>
        )
    } else if(type === 'video' && callerId === _id) {
        return (
            <div className='CALLS'>
                <VideoCall setStatusMessage={setStatusMessage}
                closePage={closePage} image={image} userName={userName}
                receiverId={receiverId} socket={socket} callerId={callerId} img={img}
                receiverName={contactName(receiverId, contacts) || receiverName} />
            </div>
        )
    } else if(type === 'video' && callerId !== _id) {
        return (
            <div className='CALLS'>
                <VideoReceive closePage={closePage} image={image} signal={signal}
                receiverId={receiverId} socket={socket} callerId={callerId}
                callerName={contactName(callerId, contacts) || callerName} />
            </div>
        )
    }
};

export default CallsPage;