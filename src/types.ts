// src/types.ts

export interface HoYoResponse {
    retcode: number;
    message: string;
    data: {
        post: {
            post: PostInfo;
            user: UserInfo;
            video?: VideoInfo;
            image_list: ImageInfo[];
            cover_list: ImageInfo[];
        };
    };
}

export interface PostInfo {
    post_id: string;
    subject: string; // Title
    desc: string;    // Description
    view_type: number; // 1=Regular, 2=Image, 5=Video
    created_at: number;
}

export interface UserInfo {
    nickname: string;
    avatar_url: string;
}

export interface VideoInfo {
    url: string;
    cover: string;
    resolution?: { url: string }[];
}

export interface ImageInfo {
    url: string;
    height: number;
    width: number;
}