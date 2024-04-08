import { type BaseRecord } from "adminjs";
import type { Resource } from "../Resource.js";
import type { Post, Profile, User } from "./types.js";
export declare function useFixtures(): {
    createUser(): Promise<Required<User>>;
    findMany<T = Post | Profile | User>(resource: Resource, filterParams: Partial<T>): Promise<BaseRecord[]>;
    findOne<T_1 = Post | Profile | User>(resource: Resource, filter: Partial<T_1>): Promise<BaseRecord>;
};
