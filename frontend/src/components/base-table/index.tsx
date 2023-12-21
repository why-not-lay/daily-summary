import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { Table, TableProps, PrimaryTableRef, PrimaryTableCol } from "tdesign-react";

export type BaseTableCol = PrimaryTableCol & {
  key?: string,
  label?: string,
} 

export type BaseTableProps = TableProps & {
  columns?: BaseTableCol[],
}

const BaseTable = forwardRef<PrimaryTableRef, BaseTableProps>((props, ref) => {
  const rawTableRef = useRef<any>();
  const newCols = useMemo(() => props?.columns?.map((column: BaseTableCol) => ({
    ...column,
    colKey: column?.key,
    title: column?.label,
  })), [props.columns]);


  useImperativeHandle(ref, () => ({
    ...rawTableRef.current
  }))

  return (
    <Table
      ref={rawTableRef} 
      {...props}
      columns={newCols}
    />
  )
})

export default BaseTable; 