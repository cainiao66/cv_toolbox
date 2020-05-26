import React from 'react';
import {Button, Typography, Divider,Row, Col,Card,Empty,PageHeader} from 'antd';

export default class StitchDoc extends React.Component{
    goBack=()=>{
        this.props.parent.getChildrenMsg(this,1)
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
            </Typography>
        )
    }
}