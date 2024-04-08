import { Adapter } from "../Adapter.js";
import type { DatabaseConfig, Post, Profile, User } from "./types.js";
export declare const buildUser: () => User;
export declare const buildProfile: (user: {
    id: number;
}) => Profile;
export declare const buildPost: (user: {
    id: number;
}) => Post;
export declare const getAdapter: (config: DatabaseConfig) => Adapter;
