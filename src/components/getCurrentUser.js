import axios from 'axios';
import { authService } from '@services/authService';

//获取user信息
const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        if(authService.isAuthenticated()){
            if(window.loginedUser){
                resolve(window.loginedUser);
            } else {
                axios.get(`${globalInitConfig.REACT_APP_API_BASE_URL}auth/users/me`).then(res => {
                    if (res.data.code === 200) {
                        let userInfo = res.data.data;
                        userInfo.userId = userInfo.id;
                        window.loginedUser = userInfo;
                        resolve(userInfo);
                    } else {
                        window.loginedUser = null;
                        resolve(null);
                    }
                })
            }
        }else{
            window.loginedUser = null;
            resolve(null);
        }
    });
};
export default getCurrentUser;
