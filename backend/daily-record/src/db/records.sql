-- 切换到 record_db 数据库  
USE record_db;  
  
-- 创建 daily_records 表  
CREATE TABLE `daily_records` (  
  `id` CHAR(16) PRIMARY KEY COMMENT 'id',
  `uid` CHAR(32) NOT NULL COMMENT '用户 id',
  `source` VARCHAR(255) NOT NULL COMMENT '来源',  
  `action` VARCHAR(255) NOT NULL COMMENT '操作',  
  `status` VARCHAR(255) COMMENT '操作状态',  
  `prev` CHAR(16) COMMENT '前序操作 id',
  `create_time` BIGINT NOT NULL COMMENT '创建时间',  
  `flag` BIGINT COMMENT '记录状态'
) COMMENT='日常记录表';