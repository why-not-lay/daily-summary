import React from "react";
import BaseForm, { BaseFormItemProps } from "../../components/base-form";
import { Input, Card, Button, SubmitContext, message } from "tdesign-react";
import { authUserReq } from "../../api/auth";
import { md } from 'node-forge';

import './index.css';
import { ActionTypes, useDispatchContext } from "../../context/context-provider";

const schema: BaseFormItemProps[] = [
  {
    name: 'username',
    label: '',
    component: <Input clearable={true} placeholder="请输入用户名"/>,
    rules: [
      { required: true, message: '请输入用户名', type:'error'},
    ]
  },
  {
    name: 'password',
    label: '',
    component: <Input type="password" clearable={true} placeholder="请输入密钥"/>,
    rules: [
      { required: true, message: '请输入密钥', type:'error'},
      { max: 16, message: '密钥过长', type:'error'}
    ]
  },
  {
    name: 'btns',
    component: (
      <Button block theme="primary" type="submit">
        登录
      </Button>
    )
  }
];

export const UserAuth: React.FC = () => {
  const dispatch = useDispatchContext();

  const onSubmit = async (e: SubmitContext) => {
    if(e.validateResult === true) {
      const { password, username } = e.fields;
      const hash = md.sha256.create().update(password).digest().toHex();
      const body = { username, password: hash };
      try {
        const { code, msg, data } = await authUserReq({ body });
        if(code === 0) {
          const { token: randomId, tokenId } = data;
          const token = new Array(randomId.length).fill(0).map((_, idx) => (
            Number.parseInt(randomId[idx], 16) ^ Number.parseInt(hash[idx], 16)
          )).map(num => (num).toString(16)).join('');
          message.success('通过验证');
          dispatch({
            type: ActionTypes.UPDATE_STATE,
            payloads: {
              token,
              tid: tokenId,
              isAuth: true,
            }
          })
        } else {
          message.error('未通过验证');
          console.error(msg);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  return (
    <div className="user_auth-bg">
      <Card shadow className="user_auth">
        <BaseForm
          schemas={schema}
          onSubmit={onSubmit}
        />
      </Card>
    </div>
  )
}