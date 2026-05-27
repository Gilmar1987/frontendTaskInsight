export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isDeleted: boolean;
  createdAt: string;
}

export interface ILoginResponse {
  success: boolean;
  data: {
    user: IUser;
    token: string;
    refreshToken: string;
  };
}
