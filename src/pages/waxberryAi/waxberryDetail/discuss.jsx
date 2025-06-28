// CommentList.jsx
import React, { useState,useRef,useEffect } from 'react';
import { Radio,Tooltip,Cascader,message,Input,Popover,Button,Tag,Modal ,Image} from 'antd';
import Icon ,{ HeartOutlined, MessageOutlined,HeartFilled,LeftOutlined  } from '@ant-design/icons';

import { useTranslation } from 'react-i18next';
import axios from 'axios';
import './CommentList.scss'; // 👈 CSS 放在旁边的文件
import FileListV2 from "@/pages/waxberryAi/components/fileList/fileList-V2";
import getFileTypePng from '@/pages/waxberryAi/components/fileList/getFileTypeTempltate';
import defaultAvatar from '@/pages/waxberryAi/components/menu/img/defaultAvatar.png'
import noComment from '@/pages/waxberryAi/img/noComment.png'
const { TextArea } = Input;
const Message=message
const EmojiSvg=()=>(<svg  fill="none" version="1.1" width="24" height="24" viewBox="0 0 24 24"><defs><clipPath id="master_svg0_385_138764"><rect x="0" y="0" width="24" height="24" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_385_138764)"><g><path d="M11.843738373107911,21.33386201400757Q15.662618373107911,21.33386201400757,18.363418373107912,18.59906201400757Q19.686618373107912,17.258762014007566,20.38421837310791,15.513162014007568Q21.05761837310791,13.827862014007568,21.05771837310791,12.000032014007568Q21.05771837310791,10.172192014007567,20.38431837310791,8.486662014007567Q19.68671837310791,6.740772014007568,18.363418373107912,5.399932014007568Q15.66361837310791,2.6661620140075684,11.84539837310791,2.6661620140075684Q8.02712837310791,2.6661620140075684,5.32834837310791,5.399952014007568Q2.62941837310791,8.133912014007567,2.62941837310791,12.000012014007568Q2.62888793610791,15.866062014007568,5.32702837310791,18.600862014007568Q8.02619837310791,21.33386201400757,11.843738373107911,21.33386201400757ZM11.84539837310791,4.163122014007568Q15.04941837310791,4.163122014007568,17.31451837310791,6.456972014007569Q19.57661837310791,8.74919201400757,19.57661837310791,11.999902014007569Q19.57661837310791,15.250562014007569,17.314618373107912,17.54206201400757Q15.04741837310791,19.83796201400757,11.843738373107911,19.83796201400757Q8.64156837310791,19.83796201400757,6.37558837310791,17.54376201400757Q4.11028837310791,15.248162014007569,4.11078837310791,12.000032014007568Q4.11078837310791,8.751322014007568,6.37688837310791,6.457012014007568Q8.64204837310791,4.1631320140075685,11.84539837310791,4.163122014007568ZM10.101338373107911,11.071862014007568Q10.469388373107911,10.698872014007568,10.469388373107911,10.17176201400757Q10.469388373107911,9.644212014007568,10.10135837310791,9.271082014007568Q9.73227837310791,8.896912014007569,9.20907837310791,8.896912014007569Q8.68769837310791,8.896912014007569,8.31802837310791,9.270982014007568Q7.94876837310791,9.644652014007569,7.94876837310791,10.17176201400757Q7.94876837310791,10.698482014007569,8.317918373107911,11.071952014007568Q8.687568373107911,11.445932014007568,9.20907837310791,11.445932014007568Q9.732208373107909,11.445932014007568,10.101338373107911,11.071862014007568ZM15.78971837310791,11.071892014007569Q16.15811837310791,10.698782014007568,16.15811837310791,10.17176201400757Q16.15811837310791,9.644302014007568,15.78971837310791,9.271062014007569Q15.42051837310791,8.896912014007569,14.89771837310791,8.896912014007569Q14.37581837310791,8.896912014007569,14.00661837310791,9.271062014007569Q13.63811837310791,9.644472014007569,13.63811837310791,10.17176201400757Q13.63811837310791,10.698602014007568,14.00661837310791,11.071892014007569Q14.37591837310791,11.445942014007569,14.89771837310791,11.445932014007568Q15.42051837310791,11.445932014007568,15.78971837310791,11.071892014007569ZM7.94362837310791,14.624062014007569Q7.7220083731079106,14.883362014007568,7.7386683731079104,15.371562014007567L7.73975837310791,15.403262014007568L7.75356837310791,15.431762014007568Q8.76571837310791,17.52326201400757,11.84339837310791,17.52326201400757Q14.90561837310791,17.52326201400757,16.34091837310791,15.451862014007569L16.36761837310791,15.413362014007568L16.36761837310791,15.366462014007569Q16.36781837310791,14.876062014007568,16.12701837310791,14.617862014007569Q15.88191837310791,14.354962014007569,15.41541837310791,14.356562014007569L15.34481837310791,14.356762014007568L15.30001837310791,14.41126201400757Q13.930118373107911,16.076662014007567,11.84339837310791,16.076662014007567Q9.769498373107911,16.076662014007567,8.75118837310791,14.427762014007568L8.70722837310791,14.356562014007569L8.623568373107911,14.356562014007569Q8.172278373107911,14.356562014007569,7.94362837310791,14.624062014007569Z" fillRule="evenodd" fill="currentColor" fillOpacity="1"/></g></g></svg>)
const CommentSvg=()=>(<svg  fill="none" version="1.1" width="16" height="13.991459846496582" viewBox="0 0 16 13.991459846496582"><defs><clipPath id="master_svg0_385_132259"><rect x="0" y="0" width="16" height="13.991459846496582" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_385_132259)"><g><path d="M15.9876,10.6634C15.9876,11.3976,15.3889,11.9927,14.6606,11.9927L10.4321,11.9927C9.69917,11.9927,8.5609,12.2297,7.87965,12.5264L5.66652,13.4904C4.98975,13.7852,4.44113,13.4256,4.44113,12.6918L4.44113,12.6579C4.44113,12.2905,4.14284,11.9927,3.77625,11.9927L1.33249,11.9927C0.596574,11.9927,0,11.398,0,10.6634L0,1.32925C0,0.595125,0.597555,0,1.3356,0L14.652,0C15.3896,0,15.9876,0.594719,15.9876,1.32925L15.9876,10.6634ZM5.03353,10.6602C5.39956,10.6602,5.69629,10.9559,5.69629,11.3264C5.69629,11.6944,5.96686,11.8744,6.30595,11.7262L7.52266,11.1945C8.19784,10.8994,9.34466,10.6602,10.0721,10.6602L13.991,10.6602C14.3592,10.6602,14.6577,10.3604,14.6577,9.98934L14.6577,2.00334C14.6577,1.63286,14.3544,1.33252,13.9969,1.33252L1.99332,1.33252C1.62837,1.33252,1.33252,1.6323,1.33252,2.00334L1.33252,9.98934C1.33252,10.3598,1.63246,10.6602,1.99528,10.6602L5.03353,10.6602ZM3.99756,7.32886C3.99756,6.96089,4.30122,6.6626,4.66547,6.6626L11.3248,6.6626C11.6936,6.6626,11.9927,6.95833,11.9927,7.32886C11.9927,7.69683,11.689,7.99512,11.3248,7.99512L4.66547,7.99512C4.29659,7.99512,3.99756,7.69939,3.99756,7.32886ZM3.99756,4.66382C3.99756,4.29585,4.30122,3.99756,4.66547,3.99756L11.3248,3.99756C11.6936,3.99756,11.9927,4.29329,11.9927,4.66382C11.9927,5.03179,11.689,5.33008,11.3248,5.33008L4.66547,5.33008C4.29659,5.33008,3.99756,5.03435,3.99756,4.66382Z" fill="currentColor" fillOpacity="1" /></g></g></svg>)
const comments = [
    { id: 1, content: '评论内容评论内容评论内容评论内容评论内容', likecount: 1, commentcount: 0 ,username:'哈哈'  },
    { id: 2, content: '评论内容评论内容评论内容评论内容评论内容', likecount: 5, commentcount: 6 ,username:'哈哈'},
    { id: 3, content: '评论内容评论内容评论内容评论内容评论内容', likecount: 1, commentcount: 0 ,username:'哈哈'},
    { id: 4, content: '评论内容评论内容评论内容评论内容评论内容', likecount: 1, commentcount: 0 ,username:'哈哈'},
    { id: 5, content: '评论内容评论内容评论内容评论内容评论内容', likecount: 1, commentcount: 0 ,username:'哈哈'},
];
const emojiList = [
    '😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊',
    '😋','😎','😍','😘','🥰','😗','😙','😚','🙂','🤗',
    '🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮',
    '😯','😪','😫','😴','😌','😛','😜','😝','🤤','😒',
    '😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞',
    '😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬',
    '😰','😱','🥵','🥶','😳','🤪','😵','😡','😠','🤬',
    '😷','🤒','🤕','🤢','🤮','🥴','😇','🥳','🥺','🤠',
    '🤡','🤥','🤫','🤭','🫢','🫣','🫠','🤓','🧐','😈',
    '👿','👹','👺','💀','☠️','👻','👽','👾','🤖','🎃'
];
const styles = {
    panel: {
        display: 'flex',
        flexWrap: 'wrap',
        width: '360px', // 10 emojis * 28px
        //backgroundColor: '#fff',


        //boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: '22px',
    },
    emoji: {
        width: '28px',
        height: '28px',
        lineHeight: '28px',
        textAlign: 'center',
        cursor: 'pointer',
        margin: '2px',
        userSelect: 'none',
    }
};


function getTextFileWordCount(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const fileContent = event.target.result;
            const words = fileContent.trim().split(/\s+/).length;
            resolve(words);
        };
        reader.onerror = (error) => {
            console.error('读取文件失败:', error);
            reject(0);
        };
        reader.readAsText(file);
    });
}

let fileReplace = {};//@替换
export default function CommentList(props) {
    const [sortType, setSortType] = useState('0');
    const [inputFileOpen, setInputFileOpen] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [message, setMessage] = useState('');

    const [openEmoji,setOpenEmoji]=useState(false)
    const [comments,setComments]=useState([])
    const [parentComment,setParentComment] =useState(null)
    const [replyInfo,setReplyInfo]=useState(null)
    const [commentLoad,setCommentLoad]=useState(false)
    const fileUpload=useRef({})
    const imageUpload=useRef({})
    const textAreaRef = useRef(null);
    const { t } = useTranslation();


    useEffect(()=>{
        console.log(props.context,'wocao')
        getComments()
    },[sortType])
    const EmojiPanel =
        (
            <div style={styles.panel}>
                {emojiList.map((emoji, index) => (
                    <span
                        key={index}
                        style={styles.emoji}
                        onClick={() => selectEmoji(emoji)}
                    >
            {emoji}
          </span>
                ))}
            </div>
        );
    function selectEmoji(emoji){
        console.log(emoji,textAreaRef,textAreaRef.current?.resizableTextArea.textArea)
        const textarea = textAreaRef.current?.resizableTextArea?.textArea;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const newValue = message.slice(0, start) + emoji + message.slice(end);
        setMessage(newValue);
        setOpenEmoji(false)
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        });
    }
    const handleOpenChange = (newOpen) => {
        setOpenEmoji(newOpen);
    };

    function getComments(){
        setCommentLoad(true)
        axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/comments/getSubject?pageNo=0&pageSize=1000`,{
            sortFlag:sortType,
            agentId:props.context.id
        }).then(res=>{
            if(res.data.code === 200){

                setComments(res.data.data)
            }else {
                setComments([])
                setCommentLoad(false)
            }
        }).catch(()=>{

        });
    }
    function getChildComments(comment){

        axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/comments/getComment?pageNo=0&pageSize=1000`,{
            sortFlag:sortType,
            subjectId:comment.id
        }).then(res=>{
            if(res.data.code === 200){
                console.log(res.data.data,'comment')
                setComments(res.data.data)
            }
        }).catch(()=>{

        });
    }

    function handleFileUpload(type,e) {
        fileUploader(type,e.target.files[0]);
    }

    function handleDrop(e){
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files.length) {
            fileUploader("file",e.dataTransfer.files[0]);
        }
    }

    function handlePaste(e){
        const items = (e.clipboardData || window.clipboardData).items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                fileUploader("file",file);
                break;
            }
        }
    }
    function inputFileChange(value, selectedOptions) {

        let node = selectedOptions[selectedOptions.length-1];
        fileReplace['@'+node.fileName] = value[value.length-1];
        setMessage(message + node.fileName)
        setInputFileOpen(false)

    }
    function fileUploader(type,file) {
        let suffixName = "";
        let split = file.name.split('.');
        if(split.length>1){
            suffixName = split.pop();
        }
        let fileObj = {
            type,
            fileName: file.name,
            fileSize: file.size,
            suffixName,
            progress: 0
        };
        if(type === "file"){
            getTextFileWordCount(file).then((wordCount) => {
                fileObj.wordNumber = wordCount;
            }).catch((error) => {
                console.error('获取字数失败:', error);
            });
        }
        //总大小不能超过1M
        let totalSize = 1048576;
        let total = fileList.reduce((accumulator, current) => accumulator + current.fileSize, fileObj.fileSize);
        if(total > totalSize){
            Message.warning(this.props.t('message.totalSizeCannotExceed')+"1M");
            return;
        }
        fileList.push(fileObj);
        setFileList([fileObj])

        const formData = new FormData();
        formData.append('file',file);
        formData.append('creator', window.loginedUser?.userId);
        formData.append('client', 'waxberryClient');
        formData.append('securityLevel', 'normal');
        formData.append('encrypt', false);
        formData.append('product', 'mgr');

        const xhr = new XMLHttpRequest();
        let url = globalInitConfig.REACT_APP_API_FS_URL + 'file/upload';
        xhr.open('POST', url, true);
        const token = localStorage.getItem('access_token');
        xhr.setRequestHeader('Authorization', token ? `Bearer ${token}` : '');

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                fileObj.progress = (event.loaded / event.total) * 100;
            }
        };

        xhr.onload = () => {
            let resFile = JSON.parse(xhr.response);
            if (xhr.status === 200 && resFile.code === 200) {
                fileObj.fileId = resFile.data.id;
                fileObj.progress = 0;

                // let params = {
                //     fileId: fileObj.fileId,
                //     fileName: fileObj.fileName,
                //     path: "/waxberry/attachment/" + fileObj.fileName,
                //     containerId: that.state.waxberryObj.vesselId
                // };
                // axios.post(globalInitConfig.REACT_APP_API_BASE_URL + "mgr/agent/agent/uploadAgentFile", params).then(res=> {
                //     if(res.data.code === 200){
                //         setFileList(fileList)

                //     }
                // })
            } else {
                setFileList([fileObj])
                console.log(`Upload of ${file.name} failed.`);
            }
        };

        xhr.send(formData);
    }
    function send(){

        if(!message){
            return;
        }



        let  body={
            agentId:props.context.id,
            content:message,
            "type": "parent",
        }
        if(parentComment){
            //  fileId 是附件id  audioId是语音的
            body={
                agentId:props.context.id,
                content:message,
                parentUserName:parentComment.userName,
                parentId:parentComment.id,
                subjectId:parentComment.id,

                "type": "child",

            }
        }
        if(replyInfo){
            body={
                parentUserName:replyInfo.userName,
                parentId:replyInfo.id,
                subjectId:(parentComment&&parentComment.id)||replyInfo.id,
                agentId:props.context.id,
                content:message,
                "type": "child",
            }
        }
        if(body.parentId===body.subjectId) body.parentUserName=''
        console.log(parentComment,replyInfo)
        console.log(fileList,'kankan')
        if(fileList.length>0){
            const fileInfo=fileList[0]
            if(fileInfo.type==='image'){
                body.audioId=fileInfo.fileId
            }else body.fileId=fileInfo.fileId
            body.fileName=fileInfo.fileName
        }
        console.log(body)
        axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr/comments/commentCommit`,body).then(res=>{
            if(res.data.code === 200){
                if(!parentComment&&!replyInfo) getComments()
                else getChildComments(parentComment||replyInfo)
                setFileList([])
            }
        }).catch(()=>{

        }).finally(()=>{
            setMessage('')
            setReplyInfo(null)
        });
        // setMessage("")
        // setIsExecuting(true)
        // setMessageData(conversationMessage)
        // this.setState({
        //     message: "",
        //     isExecuting: true,
        //     messageData: conversationMessage
        // });
    }
    function closeFunction(index){
        console.log('????')
        let fileList1 = [...fileList];
        fileList1.splice(index,1);
        setFileList(fileList1)
    }
    function likeAndCancel(obj){
        if(obj.loading) return
        let likeFlag
        obj.loading=true
        if(obj.likeFlag=='1')likeFlag='0'
        else likeFlag='1'
        let body=obj.subjectId?{ "childId":obj.id,
            id:obj.id,
            likeFlag}:{
            subjectId:obj.id,
            id:obj.id,
            likeFlag
        }
        axios.post(`${globalInitConfig.REACT_APP_API_BASE_URL}mgr//comments/likeComments`,body).then(res=>{
            if(res.data.code === 200){
                console.log(res.data.data,'like')
                obj.likeCount=res.data.data
                obj.likeFlag=likeFlag
                setComments([...comments])
                obj.loading=false
            }
        }).catch(()=>{

        });
        setComments([...comments])
    }
    function  fileClickFunction(fileName){

        let link = '@' + fileName;
        fileReplace[link] = `/waxberry/attachment/${fileName}`;
        setMessage( message + link)

    }
    function handleChange(e) {
        let message = e.target.value;
        if(message.length>1 && message.slice(-2) === "@f"){
            setInputFileOpen(true)
            setMessage(message.slice(0,-1))

        }else{
            setMessage(message)
        }
    }
    function back(){
        console.log('back')
        setParentComment(null)
        setComments([])
        getComments()
    }
    function commentSb(commentInfo){
        console.log(commentInfo)

        if(commentInfo.isReply){
            commentInfo.isReply=false
            setReplyInfo(null)
            return
        }
        if(replyInfo&&replyInfo.isReply){
            replyInfo.isReply=false
        }
        commentInfo.isReply=true
        setReplyInfo(commentInfo)
    }
    function  viewChildComment(comment){
        setParentComment(comment)
        setComments([])
        getChildComments(comment)
    }
    function downloadFile(e,url) {
        e.stopPropagation()
        const link = document.createElement('a');
        link.href = url;
        link.download = ''; // 不设置则使用服务器返回的文件名
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    const ChlidComment=()=>{

        return (
            <div className="childComment">
                <div

                    className={`comment-item active`}
                >
                    <div className="comment-left">
                        <div className="avatar-placeholder" >
                            <img style={{height:'100%',width:'100%'}} src={defaultAvatar}/>
                        </div>
                        <div className="comment-text">
                            <div className="username">{parentComment.userName}</div>
                            <div>{parentComment.content}</div>
                        </div>
                    </div>
                    <div className="comment-right">

                        <div className="icon-text">
                            <div onClick={()=>likeAndCancel(parentComment)}>{parentComment.likeFlag=='1'?<HeartFilled style={{color:'#F76965'}}/>:<HeartOutlined />}  </div>

                            <span>{parentComment.likeCount}</span>
                        </div>
                    </div>
                </div>
                <div className="divideInfo">
                    <div className="commentCount">{`${parentComment.commentCount}${t('discuss.whatCount')}`}</div>
                    <div className='divideLine'></div>
                </div>

            </div>
        )
    }
    return (
        <div className="comment-container">

            <div className="comment-header">
                <div><span onClick={back} style={{cursor:'pointer'}}>{parentComment?<LeftOutlined />:null}</span>{t('discuss.title')}</div>
                <Radio.Group
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value)}
                    buttonStyle="solid"
                >
                    <Radio.Button value="0">{t('default')}</Radio.Button>
                    <Radio.Button value="1">{t('latest')}</Radio.Button>
                </Radio.Group>
            </div>
            {parentComment&&<ChlidComment/>}
            {
                comments.length==0&&!commentLoad? <div className="noComment">
                    <img style={{height:120,width:120}} src={noComment}/>
                    <div style={{marginTop:6}}>{t("discuss.emptyInfo")}</div>
                </div>: <div className="comment-list" >
                    {comments.map((comment, index) => (
                        <div
                            key={comment.id}
                            onClick={()=>commentSb(comment)}
                            className={`comment-item ${comment.isReply?'active':''}`}
                        >
                            <div className="comment-left">
                                <div className="avatar-placeholder" >
                                    <img style={{height:'100%',width:'100%'}} src={defaultAvatar}/>
                                </div>
                                <div className="comment-text">
                                    <div className="username">{comment.userName+(comment.parentUserName?` ${t('discuss.reply')} ${comment.parentUserName}`:'')}</div>
                                    <div>{comment.content}</div>
                                    {
                                        comment.audioId&&
                                        <div style={{marginTop:4}}>
                                            <Image
                                                src={`${globalInitConfig.REACT_APP_API_FS_URL}file/download/${comment.audioId}`}
                                                width="120"
                                            />
                                        </div>}
                                    {
                                        comment.fileId&&comment.fileName&&
                                        <div className="fileFrame"  style={{marginTop:4}} onClick={(e)=>downloadFile(e,`${globalInitConfig.REACT_APP_API_FS_URL}file/download/${comment.fileId}`)}>
                                            <span className="img" dangerouslySetInnerHTML={{ __html: getFileTypePng(comment.fileName.split('.')[1]) }}/>
                                            <span className="fileName">{comment.fileName}</span>
                                        </div>}
                                </div>

                            </div>
                            <div className="comment-right">
                                {!parentComment && <div className="icon-text">
                                    <div style={{cursor:'pointer'}} onClick={(e)=>{e.stopPropagation();viewChildComment(comment)}}> <Icon component={CommentSvg}/></div>
                                    <span>{comment.commentCount }</span>
                                </div>}

                                <div className="icon-text">
                                    <div style={{cursor:'pointer'}} onClick={(e)=>{e.stopPropagation();likeAndCancel(comment)}}>{comment.likeFlag=='1'?<HeartFilled style={{color:'#F76965'}}/>:<HeartOutlined />}  </div>

                                    <span>{comment.likeCount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            }

           <div style={{width:'100%',paddingRight:24}}>
            <div className="inputDiv">

                <div className="input" onDrop={handleDrop} onPaste={handlePaste}>
                    {/* <Cascader
                                    open={inputFileOpen}
                                    className="inputFileCascader"
                                    popupClassName="inputFileCascaderPopup"
                                    placement="topLeft"
                                    options={inputFileOptions}
                                    onChange={inputFileChange}
                                    onDropdownVisibleChange={(open)=> setInputFileOpen(open)}
                                /> */}
                    <input style={{display: 'none'}} ref={fileUpload} type="file" accept=".pdf,.txt,.csv,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.md,.mobi,.epub,.py,.java,.js,.ts,.cpp,.h,.hpp,.html,.css,.php,.rb,.pl,.sh,.bash,.swift,.kt,.go,.dart,.scala,.css,.xml,.vue,.json,.yaml,.yml,.xml,.env,.ini,.toml,.plist,.feature,.bat,.md,.cmd,.ps1,.vbs,.vmc,.vbox,.dockerfile,.proto,.lua,.mod,.sum,.png,.jpeg,.jpg,.webp" onChange={(e)=>handleFileUpload("file",e)}/>
                    <input style={{display: 'none'}} ref={imageUpload } type="file" accept="image/*" onChange={(e)=>handleFileUpload("image",e)}/>
                    {fileList.length>0 && <FileListV2 fileList={fileList} closeFunction={(index)=>closeFunction(index)} onClickFunction={(fileName)=>fileClickFunction(fileName)}/>}
                    {replyInfo&&<div><span>{`${t('discuss.myReply')}${replyInfo.userName}`}</span></div>}
                    <TextArea
                        value={message}
                        placeholder={t('home.comment')}
                        onChange={(e)=>handleChange(e)}
                        autoSize={{ minRows: 1, maxRows: 3 }}
                        ref={textAreaRef}
                        // onKeyPress={(e)=>this.onKeyPress(e)}
                        // onPressEnter={()=> this.send()}
                    />
                    <div className="operate">
                        <div className="link">
                            <Popover content={EmojiPanel} arrow={false} onOpenChange={handleOpenChange} open={openEmoji} placement="top" trigger="click" >
                                <div style={{display:'flex',alignItems:'center'}}><EmojiSvg></EmojiSvg></div>
                            </Popover>
                            <svg onClick={()=> fileUpload.current.click()} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_210_43358"><rect x="32" y="0" width="32" height="32" rx="0"/></clipPath></defs><g transform="matrix(-1,0,0,1,64,0)" clipPath="url(#master_svg0_210_43358)"><g transform="matrix(0.7384299635887146,-0.6743301749229431,0.6743301749229431,0.7384299635887146,-1.11708172111139,27.581089392728245)"><path d="M51.413321826171874,17.87750875C50.69382182617188,17.07940875,49.714321826171876,16.63328875,48.693721826171874,16.63533875L48.689721826171876,16.63533875C47.673021826171876,16.63328875,46.695421826171874,17.07735875,45.97792182617187,17.87136875L45.97592182617188,17.87341875L38.89229182617188,25.67436875C38.233391826171875,26.40286875,38.03787182617187,27.49566875,38.395681826171874,28.44516875C38.75348182617188,29.39476875,39.59616182617187,30.01276875,40.53074182617188,30.01076875C41.12121182617187,30.01076875,41.709731826171875,29.76516875,42.157461826171875,29.26996875L49.24112182617188,21.468978749999998C49.542221826171875,21.13745875,49.542221826171875,20.601288750000002,49.24112182617188,20.26977875C48.94002182617187,19.93825875,48.45322182617188,19.93825875,48.15212182617188,20.26977875L41.070381826171875,28.07076875C40.92569182617188,28.228268749999998,40.730171826171876,28.31626875,40.52683182617187,28.31626875C40.323491826171875,28.31626875,40.12797182617187,28.22626875,39.985251826171876,28.066668749999998C39.83861182617188,27.91106875,39.756491826171874,27.69626875,39.75453182617188,27.47116875C39.75453182617188,27.24596875,39.83470182617187,27.03116875,39.979381826171874,26.87356875L47.06302182617188,19.07261875C47.493221826171876,18.59579875,48.07972182617188,18.32976875,48.689721826171876,18.33181875L48.69172182617187,18.33181875C49.30372182617187,18.32976875,49.89222182617188,18.59989875,50.324321826171875,19.07670875C50.760321826171875,19.55556875,51.00082182617187,20.19609875,51.00082182617187,20.87346875C51.00272182617188,21.54673875,50.760321826171875,22.19340875,50.32822182617188,22.66817875L48.41602182617187,24.77393875L48.40432182617187,24.78621875L43.103781826171875,30.62666875C41.60023182617188,32.28016875,39.164061826171874,32.28226875,37.65857182617187,30.62876875C36.935151826171875,29.834768750000002,36.530421826171874,28.75626875,36.53433182617187,27.63276875C36.53433182617187,26.49906875,36.935151826171875,25.43286875,37.66248182617188,24.63273875L44.884961826171875,16.67830875C45.186021826171874,16.34678875,45.186021826171874,15.81062875,44.884961826171875,15.47910875C44.583861826171876,15.14758885,44.09701182617187,15.14758885,43.79592182617188,15.47910875L36.57344182617187,23.43353875C35.55869282617188,24.54473875,34.98973193617187,26.05706875,34.99364226237188,27.63276875C34.99364226237188,29.218768750000002,35.552826826171874,30.71056875,36.569531826171875,31.82796875C37.57841182617187,32.94116875,38.94899182617188,33.565368750000005,40.37824182617187,33.561268749999996C41.80944182617188,33.56326875,43.181991826171874,32.93916875,44.19282182617187,31.82386875L51.68312182617187,23.57473875C51.75742182617188,23.49083875,51.81612182617188,23.39055875,51.853221826171875,23.28209875C52.299021826171874,22.57812875,52.54152182617187,21.74728875,52.54152182617187,20.87141875C52.54342182617188,19.74793875,52.13672182617188,18.66946875,51.413321826171874,17.87750875Z" fill="currentColor"/></g></g></svg>
                            <svg onClick={()=> imageUpload.current.click()} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_210_43360"><rect x="0" y="0" width="32" height="32" rx="0"/></clipPath></defs><g clipPath="url(#master_svg0_210_43360)"><g><path d="M25.25006103515625,7.75L25.25006103515625,24.25L7.25006103515625,24.25L7.25006103515625,7.75L25.25006103515625,7.75ZM21.33456103515625,16.3375L16.26256103515625,20.558500000000002L12.96806103515625,17.9595L8.75006103515625,21.3705L8.75006103515625,22.75L23.75006103515625,22.75L23.75006103515625,18.341L21.33456103515625,16.3375ZM23.75006103515625,9.25L8.75006103515625,9.25L8.75006103515625,19.441499999999998L12.95656103515625,16.04L16.237061035156252,18.628L21.33356103515625,14.388L23.75006103515625,16.392L23.75006103515625,9.25ZM13.50006103515625,10.25C14.74270103515625,10.25,15.75006103515625,11.25736,15.75006103515625,12.5C15.75006103515625,13.74264,14.74270103515625,14.75,13.50006103515625,14.75C12.25742103515625,14.75,11.25006103515625,13.74264,11.25006103515625,12.5C11.25006103515625,11.25736,12.25742103515625,10.25,13.50006103515625,10.25ZM13.50006103515625,11.75C13.08585103515625,11.75,12.75006103515625,12.08579,12.75006103515625,12.5C12.75006103515625,12.91421,13.08585103515625,13.25,13.50006103515625,13.25C13.91427103515625,13.25,14.25006103515625,12.91421,14.25006103515625,12.5C14.25006103515625,12.08579,13.91427103515625,11.75,13.50006103515625,11.75Z" fill="currentColor"/></g></g></svg>
                            {/*<Voice onVoiceInput={this.handleVoiceInput.bind(this)} />*/}
                        </div>

                        <Tooltip title={t('home.send')}>
                            <svg className={message.length > 0 ? "sendActive" : "send"} onClick={()=>send()} fill="none" version="1.1" width="32" height="32" viewBox="0 0 32 32"><defs><clipPath id="master_svg0_9_08092"><rect x="6" y="7" width="18" height="18" rx="0"/></clipPath></defs><g><g><ellipse cx="16" cy="16" rx="16" ry="16" fill="currentColor" /></g><g clipPath="url(#master_svg0_9_08092)"><g><path d="M23.20373388671875,8.186527112304688C23.20373388671875,8.184770112304687,23.20193388671875,8.184770112304687,23.20193388671875,8.183012112304688C23.16503388671875,8.110942112304688,23.11233388671875,8.045902112304688,23.04723388671875,7.993168112304687C22.98393388671875,7.940433812304687,22.91193388671875,7.901761912304687,22.83633388671875,7.877152512304687C22.83453388671875,7.877152512304687,22.83283388671875,7.8753948123046875,22.83103388671875,7.8753948123046875C22.80113388671875,7.864847912304688,22.76953388671875,7.859574412304688,22.73783388671875,7.8543010123046875C22.72913388671875,7.852543232304687,22.72033388671875,7.8490275923046875,22.70973388671875,7.8490275923046875C22.67983388671875,7.8455119503046875,22.651733886718752,7.8455119503046875,22.62183388671875,7.847269802304687C22.60953388671875,7.847269802304687,22.59903388671875,7.845512017304688,22.58673388671875,7.847269802304687C22.502333886718752,7.852543232304687,22.41793388671875,7.8771526123046876,22.34063388671875,7.915824512304687L7.08103888671875,15.483205112304688C6.93162488671875,15.555275112304688,6.81736668671875,15.685355112304688,6.76463228671875,15.843555112304688C6.74881188671875,15.887505112304687,6.74178068671875,15.934965112304688,6.73650728671875,15.980665112304688C6.72068694671875,16.073835112304685,6.72420258671875,16.170515112304688,6.75408538671875,16.26191511230469C6.80330418671875,16.42187511230469,6.91404588671875,16.553715112304687,7.06345988671875,16.629305112304685L10.93592388671875,18.664815112304687C11.02908388671875,18.71411511230469,11.13103388671875,18.73871511230469,11.23650388671875,18.73871511230469C11.47029388671875,18.74041511230469,11.684753886718749,18.61391511230469,11.79900388671875,18.410015112304688C11.966003886718749,18.10581511230469,11.848223886718749,17.727935112304685,11.53885388671875,17.564455112304685L8.70877388671875,16.077345112304688L20.09063388671875,10.431255112304687L13.14900388671875,18.40291511230469C13.14373388671875,18.40821511230469,13.14197388671875,18.415215112304686,13.136703886718749,18.420515112304688C12.96443388671875,18.53301511230469,12.85193388671875,18.722815112304687,12.85193388671875,18.940815112304687L12.85193388671875,23.530515112304688C12.85369388671875,23.69741511230469,12.92224388671875,23.857415112304686,13.04178388671875,23.97521511230469C13.16131388671875,24.093015112304688,13.32303388671875,24.156215112304686,13.490023886718749,24.154515112304686L13.490023886718749,24.156215112304686C13.84158388671875,24.156215112304686,14.12635388671875,23.876715112304687,14.12635388671875,23.532215112304687L14.12635388671875,19.204515112304687L21.70423388671875,10.498055112304687L20.12923388671875,21.981815112304687L16.13377388671875,20.062315112304688C15.81912388671875,19.911115112304685,15.44119388671875,20.03771511230469,15.28123388671875,20.347115112304685C15.20740388671875,20.496515112304685,15.19686388671875,20.66871511230469,15.25135388671875,20.82691511230469C15.30584388671875,20.985115112304687,15.42186388671875,21.11351511230469,15.57303388671875,21.183815112304686L20.320833886718752,23.467215112304686C20.40873388671875,23.509415112304687,20.50373388671875,23.530515112304688,20.60213388671875,23.530515112304688C20.60563388671875,23.530515112304688,20.60913388671875,23.52871511230469,20.61263388671875,23.52871511230469C20.62323388671875,23.52871511230469,20.63553388671875,23.532215112304687,20.646033886718747,23.532215112304687C20.962533886718752,23.534015112304687,21.23143388671875,23.303715112304687,21.27713388671875,22.990815112304688L23.24593388671875,8.645316112304688C23.28983388671875,8.497660112304688,23.28103388671875,8.334183112304688,23.20373388671875,8.186527112304688Z" fill="#FFFFFF" /></g></g></g></svg>
                        </Tooltip>

                    </div>
                </div>
            </div>
            </div>

        </div>
    );
}
