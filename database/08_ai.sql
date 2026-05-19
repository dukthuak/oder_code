USE nha_hang_db;

DROP TABLE IF EXISTS ai_du_bao;
CREATE TABLE ai_du_bao (
  ma_ai      INT AUTO_INCREMENT PRIMARY KEY,
  loai       ENUM('nhu_cau_mon','canh_bao_ton','goi_y','khac') NOT NULL,
  ma_mon     INT,
  ma_nl      INT,
  gia_tri    DECIMAL(14,4),
  noi_dung   TEXT,
  ngay_tao   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ai_mon FOREIGN KEY (ma_mon) REFERENCES mon_an(ma_mon),
  CONSTRAINT fk_ai_nl FOREIGN KEY (ma_nl) REFERENCES nguyen_lieu(ma_nl)
) ENGINE=InnoDB;

CREATE INDEX idx_ai_loai_ngay ON ai_du_bao(loai, ngay_tao);
