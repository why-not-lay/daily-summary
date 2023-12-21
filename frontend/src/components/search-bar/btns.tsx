import React from "react";
import { Button } from "tdesign-react";

const SearchBarBtns: React.FC = () => {
  return (
    <>
      <Button className="search_bar-btn" type="submit">查询</Button>
      <Button className="search_bar-btn" variant="outline" type="reset">重置</Button>
    </>
  ) 
} 

export default SearchBarBtns; 