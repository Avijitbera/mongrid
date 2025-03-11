
export interface User {
    id: string;
    username: string;
    email: string;
    password: string;
    bio?: string;
    profilePicture?: string;
    followersCount: number;
    followingCount: number;
}