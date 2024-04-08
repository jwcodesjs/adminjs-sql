import { BaseProperty, type PropertyType } from "adminjs";
export type ColumnInfo = {
    name: string;
    isId: boolean;
    isEnum: boolean;
    position: number;
    defaultValue?: string | number | boolean;
    isNullable: boolean;
    isEditable: boolean;
    type: PropertyType;
    referencedTable: string | null;
    availableValues?: string[] | null;
};
export declare class Property extends BaseProperty {
    private readonly _isPrimary;
    private readonly _isNullable;
    private readonly _isEditable;
    private readonly _referencedTable;
    private readonly _name;
    private readonly _availableValues?;
    private readonly _isEnum;
    constructor(column: ColumnInfo);
    isId(): boolean;
    name(): string;
    path(): string;
    isEditable(): boolean;
    reference(): string | null;
    availableValues(): Array<string> | null;
    subProperties(): BaseProperty[];
    isRequired(): boolean;
    isEnum(): boolean;
}
