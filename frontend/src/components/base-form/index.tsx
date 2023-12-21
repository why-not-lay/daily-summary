import React, { forwardRef, useImperativeHandle } from "react";
import { Form, FormProps, FormItemProps } from 'tdesign-react';
import { InternalFormInstance } from "tdesign-react/es/form/hooks/interface";

const { FormItem, useForm } = Form;

export type BaseFormItemProps = FormItemProps & {
  name?: string,
  label?: string,
  component?: React.ReactNode | null;
}

export type BaseFormProps = FormProps & {
  schemas?: BaseFormItemProps[]
}  

export interface BaseFormRef {
  form: InternalFormInstance
}

const BaseForm = forwardRef<BaseFormRef, BaseFormProps>((props, ref) => {
  const { schemas = [] } = props;

  const [form] = useForm()

  useImperativeHandle(ref, () => ({
    form
  }))

  return (
    <Form
      form={form}
      {...props}
    >
      {
        schemas.map(schema => (
          <FormItem
            {...schema}
            key={schema.name}
            name={schema.name}
            label={schema.label}
          >
            {schema.component}
          </FormItem>
        ))
      }
    </Form>
  )
})

export default BaseForm;