export type Post = {
    author_id: number;
    content: string
    created_at?: Date | string;
    id?: number;
    published: boolean;
    status: 'ACTIVE' | 'REMOVED';
    title: string
    updated_at?: Date | string;
    some_json: object
}

export type Profile = {
    bio: string;
    id?: string;
    name: string;
    user_id: number;
}

export type User = {
    email: string;
    id?: number;
    name: string;
}
