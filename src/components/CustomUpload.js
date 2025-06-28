import React from 'react';
import { Upload, Button } from 'antd';

// 封装一个带Authorization请求头的 Upload 组件
const CustomUpload = (
    {
        children,
        name = 'file',
        action = `${globalInitConfig.REACT_APP_API_FS_URL}file/upload`,
        withCredentials,
        data = {
            creator: window.loginedUser?.userId,
            client: 'waxberryClient',
            securityLevel: 'normal',
            encrypt: false,
            product: 'mgr'
        },
        ...props
    }
) => {
    const customRequest = (options) => {
        const { file, onProgress, onSuccess, onError } = options;

        const formData = new FormData();
        formData.append(name, file);

        // 将额外的 data 参数添加到 FormData 中
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });

        const xhr = new XMLHttpRequest();
        xhr.open('POST', action, true);
        const token = localStorage.getItem('access_token');
        xhr.setRequestHeader('Authorization', token ? `Bearer ${token}` : '');

        xhr.withCredentials = withCredentials;

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress({ percent }, file);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                onSuccess(xhr.response, file);
            } else {
                onError(new Error('Upload failed'));
            }
        });

        xhr.addEventListener('error', () => {
            onError(new Error('Upload failed'));
        });

        xhr.send(formData);
    };

    return (
        <Upload
            {...props}
            customRequest={customRequest}
        >
            {children}
        </Upload>
    );
};

export default CustomUpload;
