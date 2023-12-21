import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import BaseForm, { BaseFormItemProps, BaseFormProps, BaseFormRef } from "../base-form";
import SearchBarBtns from "./btns";
import { SubmitContext } from "tdesign-react";
import "./index.css";

export interface SearchBarProps {
  schemas: BaseFormItemProps[],
  onSearch?: (context: SubmitContext) => void,
  onReset?: () => void,
}

export interface SearchBarRef {
  search: () => void,
  reset: () => void,
  getValues: (fieldNames?: string[]) => any,
}

const SearchBar = forwardRef<SearchBarRef, SearchBarProps>((props, ref) => {
  const BaseFormRef = useRef<BaseFormRef | null>(null);
  const { schemas, onSearch, onReset } = props;

  useImperativeHandle(ref, () => ({
    search: () => {

    },
    reset: () => {
      const form = BaseFormRef.current!.form;
      form.reset({ type: 'empty', fields: ['source'] });
    },
    getValues: (fieldNames?: any[]) => {
      const form = BaseFormRef.current!.form;
      const values = form.getFieldsValue( fieldNames instanceof Array ? (fieldNames as any) : true );
      return values;
    },
  }));

  const baseFormProps = useMemo<BaseFormProps>(() => ({
    schemas: [
      ...schemas,
      {
        name: 'btns',
        component: <SearchBarBtns/>
      },
    ],
    layout: 'inline',
  }), [schemas])

  return (
    <BaseForm
      ref={BaseFormRef}
      {...baseFormProps}
      onReset={onReset}
      onSubmit={onSearch}
    />
  )
})

export default SearchBar;