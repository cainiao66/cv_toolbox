import React from 'react';
import {Button, Typography, Divider,Row, Col,Card,Empty,PageHeader} from 'antd';
import ReactMarkdown from 'react-markdown'
import cvMd from "./md/cv.md";


export default class StitchDoc extends React.Component{
    goBack=()=>{
        this.props.parent.getChildrenMsg(this,1)
    }
    state={
        markdown:'',
    }
    componentWillMount() {
        fetch(cvMd)
        .then(res => res.text())
        .then(text => this.setState({markdown: text}));
    }
    render(){
        return(
            <Typography>
                <PageHeader
                    onBack={() => this.goBack()}
                    title="全景拼接项目文档"
                    style={{paddingLeft:'0px',paddingBottom:'0px'}}
                ></PageHeader>
                <Divider></Divider>
                <ReactMarkdown
                    source={this.state.markdown}
                />
            </Typography>
        )
    }
}
