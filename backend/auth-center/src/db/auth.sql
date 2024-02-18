-- 切换到 auth_db 数据库  
USE auth_db;  
  
-- 创建 users 表  
CREATE TABLE `users` (  
  `uid` CHAR(32) PRIMARY KEY COMMENT '用户id',
  `username` VARCHAR(255) NOT NULL COMMENT '用户名',
  `passwd` CHAR(64) NOT NULL COMMENT '密码',
  `create_time` BIGINT NOT NULL COMMENT '创建时间',  
  `update_time` BIGINT NOT NULL COMMENT '更新时间',  
  `flag` BIGINT COMMENT '用户状态'
) COMMENT='用户表';

-- 创建 tokens 表  
CREATE TABLE `tokens` (  
  `tid` CHAR(32) PRIMARY KEY COMMENT 'token id',
  `uid` CHAR(32) NOT NULL COMMENT '用户 id',
  `type` INT NOT NULL COMMENT 'token 类型',
  `token` CHAR(64) NOT NULL COMMENT 'token',
  `create_time` BIGINT NOT NULL COMMENT '创建时间',
  `expire_time` BIGINT NOT NULL COMMENT '过期时间', 
  `flag` BIGINT COMMENT 'token状态',  
  FOREIGN KEY (uid) REFERENCES users(uid)
) COMMENT='token 表';