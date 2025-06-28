import React, { useState } from 'react';


import './tableModal.scss';

import { Input, InputNumber } from 'antd';
import { CloseOutlined } from "@ant-design/icons";
import { useTranslation } from 'react-i18next';

export default function TableModal({ onOk, onCancel }) {

    const { t } = useTranslation();
    const [rows, setRows] = useState(2);
    const [cols, setCols] = useState(1);
    const [showTable, setShowTable] = useState(false);
    const [tableData, setTableData] = useState([]);

    const handleOk = () => {
        if (showTable) {
            onOk(tableData);
        } else {
            let data = [];
            for (let r = 0; r < rows; r++) {
                let row = [];
                for (let c = 0; c < cols; c++) {
                    row.push(''); // 初始化每个单元格为空字符串
                }
                data.push(row);
            }
            setTableData(data);
            setShowTable(true);
        }
    };

    // 更新特定单元格的值
    const handleInputChange = (rowIndex, colIndex, value) => {
        setTableData(prevData => {
            const newData = [...prevData];
            newData[rowIndex][colIndex] = value;
            return newData;
        });
    };

    const addRows = () =>{
        setTableData(prevData => {
            let row = [];
            for (let c = 0; c < cols; c++) {
                row.push('');
            }
            return [...prevData,row];
        });
        setRows(pre=>pre+1);
    };

    const addCols = () =>{
        setTableData(prevData => {
            const newData = [...prevData];
            newData.forEach(row=>{
                row.push('');
            });
            return newData;
        });
        setCols(pre=>pre+1);
    };

    return (
        <div className="waxberry-custom-modal">
            <div className="waxberry-modal-box">
                <div className="waxberry-modal-title">
                    <span>{t('table')}</span>
                    <CloseOutlined onClick={() => onCancel()} />
                </div>
                <div className="table-content">
                    {showTable ?
                        <div className="table-edit">
                            <div className="table-edit-content">
                                <div className="table-rows">
                                    {tableData.map((row, rowIndex) => (
                                        <div className="table-row" key={'row' + rowIndex}>
                                            {row.map((item, colIndex) => (
                                                <div className="table-col" key={'col' + colIndex}>
                                                    <Input
                                                        value={item}
                                                        onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                <div className="table-col-add">
                                    <svg onClick={addCols} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><g><path d="M8,1.14286C11.7714,1.14286,14.8571,4.22857,14.8571,8C14.8571,11.7714,11.7714,14.8571,8,14.8571C4.22857,14.8571,1.14286,11.7714,1.14286,8C1.14286,4.22857,4.22857,1.14286,8,1.14286ZM8,-1.19209e-7C3.54286,0,0,3.54286,0,8C0,12.4571,3.54286,16,8,16C12.4571,16,16,12.4571,16,8C16,3.54286,12.4571,0,8,-1.19209e-7ZM8,3.42857C7.65714,3.42857,7.42857,3.65714,7.42857,4L7.42857,12C7.42857,12.3429,7.65714,12.5714,8,12.5714C8.34286,12.5714,8.57143,12.3429,8.57143,12L8.57143,4C8.57143,3.65714,8.34286,3.42857,8,3.42857ZM12,7.42857L4,7.42857C3.65714,7.42857,3.42857,7.65714,3.42857,8C3.42857,8.34286,3.65714,8.57143,4,8.57143L12,8.57143C12.3429,8.57143,12.5714,8.34286,12.5714,8C12.5714,7.65714,12.3429,7.42857,12,7.42857Z" fill="#B6B7EA"/></g></svg>
                                </div>
                            </div>
                            <div className="table-row-add">
                                <svg onClick={addRows} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="none" version="1.1" width="16" height="16" viewBox="0 0 16 16"><g><path d="M8,1.14286C11.7714,1.14286,14.8571,4.22857,14.8571,8C14.8571,11.7714,11.7714,14.8571,8,14.8571C4.22857,14.8571,1.14286,11.7714,1.14286,8C1.14286,4.22857,4.22857,1.14286,8,1.14286ZM8,-1.19209e-7C3.54286,0,0,3.54286,0,8C0,12.4571,3.54286,16,8,16C12.4571,16,16,12.4571,16,8C16,3.54286,12.4571,0,8,-1.19209e-7ZM8,3.42857C7.65714,3.42857,7.42857,3.65714,7.42857,4L7.42857,12C7.42857,12.3429,7.65714,12.5714,8,12.5714C8.34286,12.5714,8.57143,12.3429,8.57143,12L8.57143,4C8.57143,3.65714,8.34286,3.42857,8,3.42857ZM12,7.42857L4,7.42857C3.65714,7.42857,3.42857,7.65714,3.42857,8C3.42857,8.34286,3.65714,8.57143,4,8.57143L12,8.57143C12.3429,8.57143,12.5714,8.34286,12.5714,8C12.5714,7.65714,12.3429,7.42857,12,7.42857Z" fill="#B6B7EA"/></g></svg>
                            </div>
                        </div> :
                        <div className="table-setting">
                            <span className="title">表格尺寸</span>
                            <div className="item">
                                <span>列数</span>
                                <InputNumber value={cols} min={1} controls={true} onChange={val => setCols(val)} />
                            </div>
                            <div className="item">
                                <span>行数</span>
                                <InputNumber value={rows} min={2} controls={true} onChange={val => setRows(val)} />
                            </div>
                        </div>
                    }
                </div>
                <div className="waxberry-modal-footer footer-right">
                    <div className="close" onClick={() => onCancel()}>{t('cancel')}</div>
                    <div className="ok" onClick={() => handleOk()}>{t('confirm')}</div>
                </div>
            </div>
        </div>
    );
}
