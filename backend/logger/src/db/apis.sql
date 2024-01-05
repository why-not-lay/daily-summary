-- 切换到 log_db 数据库  
USE log_db;  
  
-- 创建 logs 表  
CREATE TABLE `logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'id',
  `source` VARCHAR(255) COMMENT '来源',  
  `log` JSON COMMENT '日志',
  `create_time` BIGINT NOT NULL COMMENT '创建时间'
) COMMENT='日志表';