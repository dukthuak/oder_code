-- Tạo database trên SQL Server
IF DB_ID(N'NhaHangDB') IS NOT NULL
  DROP DATABASE NhaHangDB;
GO
CREATE DATABASE NhaHangDB
  COLLATE Vietnamese_100_CI_AS;
GO
USE NhaHangDB;
GO
