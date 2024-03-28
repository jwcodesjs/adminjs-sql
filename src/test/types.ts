export type TestDb = {
    post: {
        author_id: number;
        content: string
        created_at?: Date | string;
        id?: number;
        published: boolean;
        status: 'ACTIVE' | 'REMOVED';
        title: string
        updated_at?: Date | string;
    }
    profile: {
        bio: string;
        id?: string;
        name: string;
        user_id: number;
    }
    user: {
        email: string;
        id?: number;
        name: string;
    }
}
