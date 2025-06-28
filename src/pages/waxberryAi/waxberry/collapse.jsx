import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import { RightOutlined,DownOutlined} from '@ant-design/icons';

import './collapse.scss';

export default class Collapse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  componentWillMount() {
  }

  componentDidMount() {

  }

  toggleAccordion(){
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  render() {
    const { isOpen } = this.state;
    const { task } = this.props;
    return (
      <div className={`accordion-container ${isOpen ? 'active' : ''}`}>
        <div className="accordion-header" onClick={() => this.toggleAccordion()}>
          {task.name}
          {isOpen ? <RightOutlined /> : <DownOutlined />}
        </div>
        <div className="accordion-content">
            <div className="task">
                <span className="name">任务编号：</span>
                <span className="desc">{task.id}</span>
            </div>
            <div className="task">
                <span className="name">任务目标：</span>
                <span className="desc">{task.goal}</span>
            </div>
            <div className="task">
                <span className="name">依赖信息：</span>
                <ul className="desc">
                    {task.dependency.map((item, index) => (
                        <li key={index}>{item.id}：{item.description}</li>
                    ))}
                </ul>
            </div>
            <div className="task">
                <span className="name">预期产出：</span>
                <span className="desc">{task.output}</span>
            </div>
            <div className="task">
                <span className="name">任务详情：</span>
                <span className="desc">{task.description}</span>
            </div>
            <div className="task">
                <span className="name">DoD：</span>
                <span className="desc">{task.DoD}</span>
            </div>
        </div>
      </div>
    )
  }
}
