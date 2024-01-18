import React from "react";
import BaseForm, { BaseFormItemProps } from "../../components/base-form";
import { Input, Card, Button, SubmitContext, message } from "tdesign-react";
import { authUserReq } from "../../api/auth";
import { md } from 'node-forge';

import './index.css';
import { ActionTypes, useDispatchContext } from "../../context/context-provider";

const schema: BaseFormItemProps[] = [
  {
    name: 'key',
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
      const { key: rawKey } = e.fields;
      const hash = md.sha256.create().update(rawKey).digest().toHex();
      const body = { key: hash };
      try {
        const { code, msg } = await authUserReq({ body });
        if(code === 0) {
          message.success('通过验证');
          dispatch({
            type: ActionTypes.UPDATE_STATE,
            payloads: {
              key: hash,
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