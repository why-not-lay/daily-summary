-- 切换到 api_db 数据库  
USE api_db;  
  
-- 创建 apis 表  
CREATE TABLE `apis` (  
  `api` VARCHAR(255) COMMENT '接口地址',  
  `origin` VARCHAR(255) COMMENT '主机源地址',  
  `create_time` BIGINT NOT NULL COMMENT '创建时间',  
  `update_time` BIGINT NOT NULL COMMENT '更新时间',  
  `flag` BIGINT COMMENT '接口状态',  
  PRIMARY KEY (`api`)  
) COMMENT='APIs 记录表';