import React, { useCallback, useEffect, useRef, useState } from "react";
import { BaseTable, Card, PrimaryTableCol, Input, DateRangePicker, SubmitContext, Pagination, PageInfo } from 'tdesign-react';
import { DailyRow, dailyListReq } from "../../api/daily-list";
import SearchBar, { SearchBarRef } from "../../components/search-bar";
import { BaseFormItemProps } from "../../components/base-form";
import './index.css';
import { PageConfig } from "../../types/common";

const tableColumns: PrimaryTableCol[] = [
  {
    colKey: 'id',
    title: 'id',
  },
  {
    colKey: 'action',
    title: '操作',
  },
  {
    colKey: 'source',
    title: '来源',
  },
  {
    colKey: 'createTime',
    title: '创建日期',
  },
];

const searchBarSchema: BaseFormItemProps[] = [
  {
    name: 'action',
    label: '操作',
    component: <Input/>
  },
  {
    name: 'source',
    label: '来源',
    component: <Input/>
  },
  {
    name: 'createTime',
    label: '创建日期',
    component: <DateRangePicker clearable valueType="time-stamp"/>
  },
];

const DailyList: React.FC = () => {
  const searchBarRef = useRef<SearchBarRef | null>(null);
  const [tableData, setTableData] = useState<DailyRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageConfig, setPageConfig] = useState<PageConfig>({
    pageNum: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState<number>(0)

  const setData = useCallback(async () => {
    setIsLoading(true);
    try {
      const values = searchBarRef.current?.getValues();
      const { createTime, source, action } = values;
      const [createTimeStart, createTimeEnd ] = createTime ?? [];
      const resp = await dailyListReq({
        params: {
          source,
          action,
          createTimeStart,
          createTimeEnd,
          pageSize: pageConfig.pageSize,
          pageNum: pageConfig.pageNum,
        }
      }, true);
      const { data } = resp;
      const { total, records } = data;
      setTableData(records);
      setTotal(total);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [pageConfig.pageNum, pageConfig.pageSize]);

  const onChange = (pageInfo: PageInfo) => {
    const { current, pageSize } = pageInfo;
    console.log(pageInfo)
    setPageConfig({
      ...pageConfig,
      pageNum: current,
      pageSize,
    });
  }

  const onSearch = async () => {
    setData();
  }

  const onReset = async () => {
    setData();
  }

  useEffect(() => {
    setData();
  }, [setData]);

  return (
    <div className="daily_list">
      <Card
        shadow={true}
        className="bar"
      >
        <SearchBar
          ref={searchBarRef} 
          schemas={searchBarSchema}
          onSearch={onSearch}
          onReset={onReset}
        />
      </Card>
      <Card
        shadow={true}
        className="data"
      >
        <BaseTable
          rowKey='id'
          bordered={true}
          stripe={true}
          hover={true}
          disableDataPage={true}
          data={tableData}
          columns={tableColumns}
          loading={isLoading}
        />
        <Pagination
          className="pagination"
          showPageNumber
          showPageSize
          showPreviousAndNextBtn
          totalContent
          size="medium"
          theme="default"
          current={pageConfig.pageNum}
          pageSize={pageConfig.pageSize}
          total={total}
          onChange={onChange}
        />
      </Card>
    </div>
  )
}

export default DailyList;