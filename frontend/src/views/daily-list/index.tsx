import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BaseTable, Card, PrimaryTableCol, Input, DateRangePicker, Pagination, PageInfo, message, Select } from 'tdesign-react';
import { DailyRow, dailyListReq } from "../../api/daily-list";
import SearchBar, { SearchBarRef } from "../../components/search-bar";
import { BaseFormItemProps } from "../../components/base-form";
import { PageConfig } from "../../types/common";
import dayjs from "dayjs";
import { useOptions } from "./hooks/useOptions";
import './index.css';

const tableColumns: PrimaryTableCol[] = [
  {
    colKey: 'id',
    title: 'id',
  },
  {
    colKey: 'source',
    title: '来源',
  },
  {
    colKey: 'action',
    title: '操作',
  },
  {
    colKey: 'status',
    title: '状态',
  },
  {
    colKey: 'create_time',
    title: '创建日期',
    cell: ({ row }) => dayjs(row['create_time']).format('YYYY-MM-DD HH:mm:ss')
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

  const { statusOptions, sourceOptions } = useOptions();

  const searchBarSchema: BaseFormItemProps[] = useMemo(() => [
    {
      name: 'source',
      label: '来源',
      component: <Select options={sourceOptions} clearable/>
    },
    {
      name: 'action',
      label: '操作',
      component: <Input/>
    },
    {
      name: 'status',
      label: '状态',
      component: <Select options={statusOptions} clearable/>
    },
    {
      name: 'createTime',
      label: '创建日期',
      component: <DateRangePicker clearable valueType="time-stamp"/>
    },
  ], [statusOptions, sourceOptions]);

  const setData = useCallback(async () => {
    setIsLoading(true);
    try {
      const values = searchBarRef.current?.getValues();
      const { createTime, source, action, status } = values;
      const [create_time_start, create_time_end ] = createTime ?? [];
      const resp = await dailyListReq({
        body: {
          source,
          action,
          status,
          create_time_start,
          create_time_end,
          pageSize: pageConfig.pageSize,
          pageNum: pageConfig.pageNum,
        }
      });
      const { data, code, msg } = resp;
      if(code === 0) {
        const { total, records } = data;
        setTableData(records);
        setTotal(total);
      } else {
        message.error('请求失败');
        console.error(msg);
      }
    } catch (error) {
      message.error('请求出错');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [pageConfig.pageNum, pageConfig.pageSize]);

  const onChange = (pageInfo: PageInfo) => {
    const { current, pageSize } = pageInfo;
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