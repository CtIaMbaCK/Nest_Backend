// Định nghĩa kiểu dữ liệu trả về từ Goong
export interface GoongResponse {
  results: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }[];
  status: string;
}
